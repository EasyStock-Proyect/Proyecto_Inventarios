import pandas as pd
from prophet import Prophet


MINIMUM_TRAINING_DAYS = 30
MAXIMUM_TRAINING_DAYS = 60
FORECAST_DAYS = 7


def prepare_prophet_data(series: pd.DataFrame) -> pd.DataFrame:
    """
    Convierte una serie de ventas al formato requerido por Prophet.

    Entrada:
        DataFrame con:
        - date
        - quantity_sold

    Salida:
        DataFrame con:
        - ds
        - y
    """

    prophet_data = series.rename(
        columns={
            "date": "ds",
            "quantity_sold": "y"
        }
    )[["ds", "y"]].copy()

    prophet_data["ds"] = pd.to_datetime(
        prophet_data["ds"]
    )

    prophet_data["y"] = pd.to_numeric(
        prophet_data["y"],
        errors="coerce"
    ).fillna(0)

    return prophet_data


def get_training_window(
    series: pd.DataFrame
) -> tuple[pd.DataFrame, int]:
    """
    Obtiene como máximo los últimos 60 días de historial.

    Retorna:
        - serie utilizada para entrenar;
        - cantidad de días disponibles.
    """

    series = series.sort_values("date").copy()

    available_days = len(series)

    training_data = series.tail(
        MAXIMUM_TRAINING_DAYS
    ).copy()

    return training_data, available_days


def generate_forecast(
    series: pd.DataFrame
) -> dict:
    """
    Entrena un modelo Prophet y genera una predicción
    para los próximos 7 días.

    Menos de 30 días de historial:
        - genera predicción igualmente;
        - hasEnoughData = False.

    30 días o más:
        - hasEnoughData = True.
    """

    training_data, available_days = get_training_window(
        series
    )

    if training_data.empty:
        raise ValueError(
            "No existen datos suficientes para generar "
            "una predicción."
        )

    has_enough_data = (
        available_days >= MINIMUM_TRAINING_DAYS
    )

    prophet_data = prepare_prophet_data(
        training_data
    )

    model = Prophet()

    model.fit(prophet_data)

    future = model.make_future_dataframe(
        periods=FORECAST_DAYS,
        freq="D"
    )

    forecast = model.predict(future)

    forecast = forecast.tail(
        FORECAST_DAYS
    )[
        [
            "ds",
            "yhat",
            "yhat_lower",
            "yhat_upper"
        ]
    ].copy()

    forecast["yhat"] = forecast["yhat"].clip(
        lower=0
    )

    forecast["yhat_lower"] = forecast[
        "yhat_lower"
    ].clip(lower=0)

    forecast["yhat_upper"] = forecast[
        "yhat_upper"
    ].clip(lower=0)

    return {
        "forecast": forecast,
        "trainingDays": available_days,
        "hasEnoughData": has_enough_data
    }