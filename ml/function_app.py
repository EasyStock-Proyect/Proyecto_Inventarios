import datetime
import logging

import azure.functions as func
import psycopg

from src.config import DATABASE_URL
from src.database import get_connection
from src.prediction_service import generate_predictions


app = func.FunctionApp()


@app.route(
    route="health",
    auth_level=func.AuthLevel.ANONYMOUS
)
def health(req: func.HttpRequest) -> func.HttpResponse:
    """
    Comprueba que Azure Functions pueda conectarse a PostgreSQL.
    """

    try:
        with psycopg.connect(
            DATABASE_URL,
            connect_timeout=10
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()

        if result and result[0] == 1:
            return func.HttpResponse(
                "Conexión a PostgreSQL correcta.",
                status_code=200
            )

        return func.HttpResponse(
            "PostgreSQL no devolvió el resultado esperado.",
            status_code=500
        )

    except Exception:
        logging.exception(
            "Error verificando la conexión con PostgreSQL."
        )

        return func.HttpResponse(
            "Error interno al verificar la conexión con PostgreSQL.",
            status_code=500
        )


@app.timer_trigger(
    schedule="%ML_TRAINING_SCHEDULE%",
    arg_name="timer",
    run_on_startup=False,
    use_monitor=True
)
def weekly_predictions(timer: func.TimerRequest) -> None:
    """
    Ejecuta el reentrenamiento semanal y genera las predicciones.
    """

    if timer.past_due:
        logging.warning(
            "El entrenamiento semanal se está ejecutando con retraso."
        )

    start_time = datetime.datetime.now(
        datetime.timezone.utc
    )

    logging.info(
        "Iniciando reentrenamiento semanal de predicciones: %s",
        start_time.isoformat()
    )

    connection = None

    try:
        connection = get_connection()

        result = generate_predictions(connection)

        logging.info(
            "Reentrenamiento finalizado. "
            "Series procesadas=%s, exitosas=%s, fallidas=%s",
            result["processed"],
            result["successful"],
            result["failed"]
        )

    except Exception:
        logging.exception(
            "Error durante el reentrenamiento semanal."
        )
        raise

    finally:
        if connection is not None:
            connection.close()