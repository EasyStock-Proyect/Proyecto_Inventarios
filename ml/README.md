# ML y Azure Functions

## Propósito

El módulo `ml/` consulta ventas en PostgreSQL, construye series diarias, entrena un modelo Prophet por usuario/producto y persiste predicciones en `demand_prediction`. Azure Functions ejecuta este proceso mediante `weekly_predictions`.

## Pipeline de predicciones

1. `fetch_sales_data` agrupa `sale_item` por usuario, producto y día, excluyendo productos eliminados.
2. `build_sales_time_series` completa con cero los días sin ventas.
3. Cada serie usa como máximo los últimos 60 días disponibles.
4. Prophet genera un horizonte de siete días.
5. El resultado se guarda mediante upsert, una fila por usuario, producto y fecha.

La predicción se genera desde el primer día con historial disponible. Con menos de 30 días, `hasEnoughData` es falso y la recomendación no se considera confiable; el modelo se ejecuta igualmente.

## Componentes

- `src/config.py`: carga `DATABASE_URL`.
- `src/database.py`: conexión y consulta de ventas.
- `src/data_preparation.py`: normalización y completado de series.
- `src/prediction.py`: ventana de entrenamiento y Prophet.
- `src/prediction_service.py`: generación y persistencia de resultados.
- `function_app.py`: endpoint `health` y temporizador `weekly_predictions`.
- `scripts/prepare_sales_data.py`: generación manual de `data/processed/sales_time_series.csv`.

## Instalación y ejecución

Desde `ml/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python scripts/prepare_sales_data.py
```

Configura `DATABASE_URL` y, para Azure Functions, `ML_TRAINING_SCHEDULE`. Los valores reales no deben subirse al repositorio.

## Azure Functions

`GET /api/health` comprueba la conexión PostgreSQL. `weekly_predictions` abre la conexión, procesa productos con historial, registra resultados y la cierra. El repositorio no contiene workflow de despliegue de Functions.

## Relación con el backend

El frontend no invoca ML directamente. Express consulta `demand_prediction` mediante el endpoint autenticado `GET /api/predictions`. Ese endpoint agrega siete días por producto y devuelve `forecast7d`, `currentStock`, `recommendedOrder`, `confidence` y `hasEnoughData`; mantiene una caché de una hora por usuario.

Para la operación, consulta [docs/ml-predictions.md](../docs/ml-predictions.md) y [docs/operations.md](../docs/operations.md).
