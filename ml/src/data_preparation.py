import pandas as pd


def build_sales_time_series(
    sales_data: list[dict],
    start_date: str | None = None,
    end_date: str | None = None
) -> pd.DataFrame:
    """
    Construye una serie temporal diaria de ventas por usuario y producto.

    Si se proporciona un rango de fechas, todas las series se
    completan dentro de ese intervalo.

    Si no se proporciona un rango, cada serie utiliza desde
    su primera venta hasta su última venta.

    Los días sin ventas se rellenan con 0.
    """

    columns = [
        "userId",
        "productId",
        "date",
        "quantity_sold"
    ]

    if not sales_data:
        return pd.DataFrame(columns=columns)

    df = pd.DataFrame(sales_data)

    df["date"] = pd.to_datetime(
        df["date"]
    ).dt.normalize()

    df["quantity_sold"] = (
        pd.to_numeric(
            df["quantity_sold"],
            errors="coerce"
        )
        .fillna(0)
        .astype(int)
    )

    range_start = (
        pd.to_datetime(start_date).normalize()
        if start_date
        else None
    )

    range_end = (
        pd.to_datetime(end_date).normalize()
        if end_date
        else None
    )

    if range_start is not None and range_end is not None:
        if range_start > range_end:
            raise ValueError(
                "La fecha inicial no puede ser posterior "
                "a la fecha final."
            )

        df = df[
            (df["date"] >= range_start) &
            (df["date"] <= range_end)
        ]

    elif range_start is not None:
        df = df[df["date"] >= range_start]

    elif range_end is not None:
        df = df[df["date"] <= range_end]

    if df.empty:
        return pd.DataFrame(columns=columns)

    df = (
        df.groupby(
            ["userId", "productId", "date"],
            as_index=False
        )["quantity_sold"]
        .sum()
    )

    complete_series = []

    for (user_id, product_id), product_df in df.groupby(
        ["userId", "productId"]
    ):

        if range_start is not None:
            series_start = range_start
        else:
            series_start = product_df["date"].min()

        if range_end is not None:
            series_end = range_end
        else:
            series_end = product_df["date"].max()

        all_dates = pd.date_range(
            start=series_start,
            end=series_end,
            freq="D"
        )

        series = (
            product_df
            .set_index("date")
            .reindex(all_dates, fill_value=0)
            .rename_axis("date")
            .reset_index()
        )

        series["userId"] = user_id
        series["productId"] = product_id

        complete_series.append(
            series[
                columns
            ]
        )

    result = pd.concat(
        complete_series,
        ignore_index=True
    )

    result["date"] = result["date"].dt.date

    return (
        result
        .sort_values(
            ["userId", "productId", "date"]
        )
        .reset_index(drop=True)
    )