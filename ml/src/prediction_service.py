from datetime import datetime, timezone, date

import pandas as pd
import psycopg

from src.database import fetch_sales_data
from src.data_preparation import build_sales_time_series
from src.prediction import (
    MAXIMUM_TRAINING_DAYS,
    generate_forecast
)


def save_forecast(
    connection: psycopg.Connection,
    user_id: str,
    product_id: str,
    forecast: pd.DataFrame,
    training_start_date,
    training_end_date,
    training_days: int,
    has_enough_data: bool
):
    """
    Guarda o actualiza las predicciones de un producto.

    Existe una única predicción por:
    userId + productId + forecastDate.
    """

    query = """
        INSERT INTO demand_prediction (
            id,
            "userId",
            "productId",
            "forecastDate",
            "predictedQuantity",
            "lowerBound",
            "upperBound",
            "trainingStartDate",
            "trainingEndDate",
            "trainingDays",
            "hasEnoughData",
            "generatedAt"
        )
        VALUES (
            gen_random_uuid(),
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
        ON CONFLICT ("userId", "productId", "forecastDate")
        DO UPDATE SET
            "predictedQuantity" = EXCLUDED."predictedQuantity",
            "lowerBound" = EXCLUDED."lowerBound",
            "upperBound" = EXCLUDED."upperBound",
            "trainingStartDate" = EXCLUDED."trainingStartDate",
            "trainingEndDate" = EXCLUDED."trainingEndDate",
            "trainingDays" = EXCLUDED."trainingDays",
            "hasEnoughData" = EXCLUDED."hasEnoughData",
            "generatedAt" = EXCLUDED."generatedAt";
    """

    generated_at = datetime.now(timezone.utc)

    rows = []

    for _, row in forecast.iterrows():

        predicted_quantity = max(
            0,
            round(float(row["yhat"]))
        )

        lower_bound = max(
            0,
            int(float(row["yhat_lower"]))
        )

        upper_bound = max(
            lower_bound,
            int(float(row["yhat_upper"]) + 0.9999)
        )

        rows.append(
            (
                user_id,
                product_id,
                pd.Timestamp(row["ds"]).to_pydatetime(),
                predicted_quantity,
                lower_bound,
                upper_bound,
                training_start_date,
                training_end_date,
                training_days,
                has_enough_data,
                generated_at
            )
        )

    with connection.cursor() as cursor:

        cursor.executemany(
            query,
            rows
        )

    connection.commit()


from datetime import date, timedelta


def generate_predictions(connection):
    """
    Genera predicciones para todos los productos que tengan
    historial de ventas.

    Cada modelo se entrena de forma independiente para:
    userId + productId.

    La serie utiliza como máximo los últimos 60 días disponibles
    hasta la fecha actual.
    """

    sales_data = fetch_sales_data(connection)

    if not sales_data:
        return {
            "processed": 0,
            "successful": 0,
            "failed": 0
        }

    sales_df = pd.DataFrame(sales_data)

    sales_df["date"] = pd.to_datetime(
        sales_df["date"]
    ).dt.normalize()

    today = pd.Timestamp(
        date.today()
    )

    processed = 0
    successful = 0
    failed = 0

    for (user_id, product_id), group in sales_df.groupby(
        ["userId", "productId"]
    ):

        processed += 1

        try:
            first_sale_date = group["date"].min()

            window_start = max(
                first_sale_date,
                today - pd.Timedelta(
                    days=MAXIMUM_TRAINING_DAYS - 1
                )
            )

            window_end = today

            series_data = group[
                [
                    "userId",
                    "productId",
                    "date",
                    "quantity_sold"
                ]
            ].to_dict("records")

            time_series = build_sales_time_series(
                series_data,
                start_date=window_start.strftime(
                    "%Y-%m-%d"
                ),
                end_date=window_end.strftime(
                    "%Y-%m-%d"
                )
            )

            product_series = time_series[
                (time_series["userId"] == user_id) &
                (time_series["productId"] == product_id)
            ].copy()

            if product_series.empty:
                failed += 1
                continue

            forecast_result = generate_forecast(
                product_series[
                    [
                        "date",
                        "quantity_sold"
                    ]
                ]
            )

            forecast = forecast_result["forecast"]
            training_days = forecast_result["trainingDays"]
            has_enough_data = forecast_result["hasEnoughData"]

            training_start_date = pd.to_datetime(
                product_series["date"].min()
            ).to_pydatetime()

            training_end_date = pd.to_datetime(
                product_series["date"].max()
            ).to_pydatetime()

            save_forecast(
                connection=connection,
                user_id=user_id,
                product_id=product_id,
                forecast=forecast,
                training_start_date=training_start_date,
                training_end_date=training_end_date,
                training_days=training_days,
                has_enough_data=has_enough_data
            )

            successful += 1

        except Exception as error:

            connection.rollback()

            print(
                f"Error generando predicción para "
                f"userId={user_id}, productId={product_id}: "
                f"{error}"
            )

            failed += 1

    return {
        "processed": processed,
        "successful": successful,
        "failed": failed
    }