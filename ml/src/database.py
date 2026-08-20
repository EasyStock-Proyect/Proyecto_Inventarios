import psycopg

from src.config import DATABASE_URL


def get_connection():
    """
    Crea y devuelve una conexión a PostgreSQL.
    """
    return psycopg.connect(DATABASE_URL)


def fetch_sales_data(connection):
    """
    Obtiene el historial de ventas agrupado por producto y día.
    """

    query = """
        SELECT
            si."productId",
            DATE(s."createdAt") AS date,
            SUM(si.quantity) AS quantity_sold
        FROM "sale_item" si
        INNER JOIN "sale" s
            ON s.id = si."saleId"
        GROUP BY
            si."productId",
            DATE(s."createdAt")
        ORDER BY
            si."productId",
            DATE(s."createdAt");
    """

    with connection.cursor() as cursor:

        cursor.execute(query)

        rows = cursor.fetchall()

    return [
        {
            "productId": row[0],
            "date": row[1],
            "quantity_sold": row[2],
        }
        for row in rows
    ]