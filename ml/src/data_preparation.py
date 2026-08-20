import pandas as pd


def build_sales_time_series(
    sales_data: list[dict],
    start_date: str | None = None,
    end_date: str | None = None
) -> pd.DataFrame:
    """
    Construye una serie temporal diaria de ventas por producto.

    Si se proporciona un rango de fechas, todas las series se
    completan dentro de ese intervalo.

    Si no se proporciona un rango, cada producto utiliza desde
    su primera venta hasta su última venta.

    Los días sin ventas se rellenan con 0.
    """

    columns = [
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

    range_start = None
    range_end = None

    if start_date:
        range_start = pd.to_datetime(start_date).normalize()

    if end_date:
        range_end = pd.to_datetime(end_date).normalize()

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
            ["productId", "date"],
            as_index=False
        )["quantity_sold"]
        .sum()
    )

    complete_series = []

    for product_id, product_df in df.groupby("productId"):

        if range_start is not None:
            product_start = range_start
        else:
            product_start = product_df["date"].min()

        if range_end is not None:
            product_end = range_end
        else:
            product_end = product_df["date"].max()

        all_dates = pd.date_range(
            start=product_start,
            end=product_end,
            freq="D"
        )

        product_series = (
            product_df
            .set_index("date")
            .reindex(all_dates, fill_value=0)
            .rename_axis("date")
            .reset_index()
        )

        product_series["productId"] = product_id

        complete_series.append(
            product_series[
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
            ["productId", "date"]
        )
        .reset_index(drop=True)
    )