import argparse
import sys
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from src.database import fetch_sales_data, get_connection
from src.data_preparation import build_sales_time_series


OUTPUT_DIRECTORY = PROJECT_ROOT / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIRECTORY / "sales_time_series.csv"


def parse_arguments():
    """Obtiene las fechas opcionales desde la línea de comandos."""

    parser = argparse.ArgumentParser(
        description=(
            "Prepara el historial de ventas para modelos "
            "de predicción de demanda."
        )
    )

    parser.add_argument(
        "--start",
        dest="start_date",
        help="Fecha inicial en formato YYYY-MM-DD."
    )

    parser.add_argument(
        "--end",
        dest="end_date",
        help="Fecha final en formato YYYY-MM-DD."
    )

    return parser.parse_args()


def main():
    """Ejecuta el pipeline de preparación de datos de ventas."""

    args = parse_arguments()

    print("Iniciando preparación de datos de ventas...")

    if args.start_date:
        print(f"Fecha inicial: {args.start_date}")

    if args.end_date:
        print(f"Fecha final: {args.end_date}")

    connection = get_connection()

    try:
        print("Extrayendo historial de ventas...")
        sales_data = fetch_sales_data(connection)
    finally:
        connection.close()

    print(
        f"Registros de ventas extraídos: {len(sales_data)}"
    )

    if not sales_data:
        print("No se encontraron ventas para procesar.")

        OUTPUT_DIRECTORY.mkdir(
            parents=True,
            exist_ok=True
        )

        empty_dataframe = pd.DataFrame(
            columns=[
                "productId",
                "date",
                "quantity_sold"
            ]
        )

        empty_dataframe.to_csv(
            OUTPUT_FILE,
            index=False
        )

        print(
            f"Archivo generado: {OUTPUT_FILE}"
        )

        return

    print("Construyendo series temporales...")

    sales_time_series = build_sales_time_series(
        sales_data,
        start_date=args.start_date,
        end_date=args.end_date
    )

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True
    )

    sales_time_series.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print(
        "Serie temporal generada correctamente: "
        f"{OUTPUT_FILE}"
    )

    print(
        f"Registros finales: {len(sales_time_series)}"
    )


if __name__ == "__main__":
    main()