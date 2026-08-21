import psycopg

from src.config import DATABASE_URL


def get_connection():
    """
    Crea y devuelve una conexión a PostgreSQL.
    """
    return psycopg.connect(DATABASE_URL)


def fetch_sales_data(connection):
    """
    Obtiene el historial de ventas agrupado por usuario,
    producto y día.
    """

    query = """
        SELECT
            s."userId",
            si."productId",
            DATE(s."createdAt") AS date,
            SUM(si.quantity) AS quantity_sold
        FROM "sale_item" si
        INNER JOIN "sale" s
            ON s.id = si."saleId"
        INNER JOIN "product" p
            ON p.id = si."productId"
        WHERE p."deletedAt" IS NULL
        GROUP BY
            s."userId",
            si."productId",
            DATE(s."createdAt")
        ORDER BY
            s."userId",
            si."productId",
            DATE(s."createdAt");
    """

    with connection.cursor() as cursor:
        cursor.execute(query)
        rows = cursor.fetchall()

    return [
        {
            "userId": row[0],
            "productId": row[1],
            "date": row[2],
            "quantity_sold": row[3],
        }
        for row in rows
    ]