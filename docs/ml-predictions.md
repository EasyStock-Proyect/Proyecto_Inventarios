# ML y predicciones

## Responsabilidad

El componente `ml/`, desplegado en Azure Functions, genera predicciones y las persiste directamente en Azure Database for PostgreSQL. No expone una API Python para el frontend. El backend Express actúa como API de consulta y el frontend consume únicamente ese backend.

## Pipeline

```text
Ventas en Azure Database for PostgreSQL
        |
        v
fetch_sales_data
        |
        v
Serie diaria por usuario/producto
        |
        v
Ventana máxima de 60 días
        |
        v
Prophet
        |
        v
7 predicciones diarias
        |
        v
upsert en demand_prediction
        |
        v
GET /api/predictions
```

`fetch_sales_data` agrupa cantidades de `sale_item` por usuario, producto y día, excluyendo productos eliminados. `build_sales_time_series` completa los días sin ventas con cero. Cada combinación usuario/producto se entrena de forma independiente.

## Parámetros del modelo

- **Ventana de entrenamiento:** como máximo los últimos 60 días disponibles hasta la fecha actual.
- **Historial mínimo confiable:** 30 días.
- **Horizonte:** siete días futuros.
- **Modelo:** Prophet.
- **Datos insuficientes:** se genera la predicción desde el primer día con historial disponible, aunque haya menos de 30 días; en ese caso `hasEnoughData` es `false`.
- **Persistencia:** se guardan cantidades predichas y límites inferior/superior no negativos, con upsert por usuario, producto y fecha.

## Azure Functions

`weekly_predictions` ejecuta `generate_predictions(connection)` según `ML_TRAINING_SCHEDULE`. La Function abre una conexión a Azure Database for PostgreSQL, procesa todos los productos con historial, registra series procesadas/exitosas/fallidas y cierra la conexión. El endpoint `health` valida la conexión mediante `SELECT 1`.

## Relación con Express

El backend no entrena modelos ni recibe llamadas directas del módulo ML. `GET /api/predictions` consulta mediante Prisma las filas de los próximos siete días en `demand_prediction`, almacenadas en Azure Database for PostgreSQL, agrupa por producto y suma:

- `forecast7d`: demanda total estimada, redondeada hacia arriba;
- `currentStock`: existencias actuales del producto;
- `recommendedOrder`: máximo entre cero y el techo de `upperBound - currentStock`;
- `confidence`: suma de `lowerBound` y `upperBound` para los siete días;
- `hasEnoughData`: falso si alguna de las predicciones agrupadas no tiene al menos 30 días;
- `recommendationReliable`: refleja el mismo indicador de suficiencia.

La consulta exige JWT y usa una caché en memoria de una hora por usuario. Solo incluye productos activos.

## Ejecución manual

Desde `ml/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python scripts/prepare_sales_data.py
```

El script de preparación genera `data/processed/sales_time_series.csv`. La Function de predicciones usa el código Python de `src/` y Azure Database for PostgreSQL; no depende de que el CSV esté versionado.

## Configuración

Se requiere `DATABASE_URL`. Azure Functions requiere además `ML_TRAINING_SCHEDULE`. Usa [ml/.env.example](../ml/.env.example) sin introducir secretos en el repositorio.
