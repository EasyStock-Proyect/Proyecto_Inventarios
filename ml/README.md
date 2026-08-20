# ML Data Preparation

## Propósito

El módulo `ml/` prepara el historial de ventas almacenado en PostgreSQL para futuras tareas de análisis y predicción de demanda. Su responsabilidad actual se limita a la extracción y transformación de datos; no incluye modelos predictivos ni entrenamiento.

## Estado actual

Actualmente, el módulo implementa un pipeline de preparación de datos de ventas que:

- Consulta las ventas agrupadas por producto y día.
- Normaliza y completa las series diarias, asignando `0` a los días sin ventas.
- Genera un archivo CSV con los datos procesados.

Los modelos de series temporales, el entrenamiento, la predicción y cualquier integración con otros módulos del sistema son funcionalidades futuras y no forman parte de la implementación actual.

## Arquitectura del módulo

```text
ml/
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   └── data_preparation.py
│
├── scripts/
│   └── prepare_sales_data.py
│
├── data/
│   └── processed/
│       └── .gitkeep
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

### Archivos principales

- `src/config.py`: carga las variables de entorno con `python-dotenv`, obtiene `DATABASE_URL` y detiene la ejecución si no está configurada.
- `src/database.py`: crea conexiones PostgreSQL mediante Psycopg 3 y consulta `sale` y `sale_item` para obtener `productId`, la fecha de venta y `quantity_sold`, agrupados por producto y día.
- `src/data_preparation.py`: convierte los datos en un `DataFrame`, normaliza las fechas, convierte las cantidades a valores numéricos, agrupa por producto y fecha, completa los días sin ventas y ordena el resultado.
- `scripts/prepare_sales_data.py`: punto de entrada del pipeline. Lee los argumentos de fecha, consulta la base de datos, ejecuta la preparación y genera el CSV de salida.
- `data/processed/`: directorio destinado a los archivos generados por el pipeline. Los datasets procesados no se versionan; `.gitkeep` conserva la carpeta en el repositorio.

## Requisitos

- Python 3.14 o una versión compatible con las dependencias especificadas.
- PostgreSQL accesible desde el entorno donde se ejecuta el script.
- Un entorno virtual de Python, recomendado para aislar las dependencias del módulo.

## Instalación

Desde una terminal de PowerShell, ubícate en el directorio `ml/` y crea el entorno virtual:

```powershell
cd C:\Proyecto_Inventarios\ml
py -3.14 -m venv .venv
```

Activa el entorno virtual en Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instala las dependencias actuales:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Las dependencias instaladas son `psycopg[binary]`, `pandas` y `python-dotenv`, con las versiones fijadas en `requirements.txt`.

## Configuración

1. Crea `ml/.env` a partir del archivo de ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Edita `ml/.env` y configura la conexión a PostgreSQL:

   ```env
   DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_de_datos
   ```

`DATABASE_URL` es obligatoria. El archivo `.env` contiene configuración local y no debe subirse al repositorio.

## Ejecución

El pipeline se ejecuta desde el directorio `ml/`:

```powershell
python scripts/prepare_sales_data.py
```

También admite límites opcionales de fecha en formato `YYYY-MM-DD`:

```powershell
python scripts/prepare_sales_data.py --start 2026-08-01 --end 2026-08-20
```

Se puede indicar únicamente uno de los límites:

```powershell
python scripts/prepare_sales_data.py --start 2026-08-01
python scripts/prepare_sales_data.py --end 2026-08-20
```

Cuando no se proporciona un rango, cada producto utiliza desde su primera venta hasta su última venta disponible. Cuando se proporciona un límite, las series se generan dentro del intervalo resultante. Si la fecha inicial es posterior a la fecha final, la preparación genera un error de validación.

## Resultado

El pipeline genera o sobrescribe el siguiente archivo:

```text
data/processed/sales_time_series.csv
```

El CSV contiene exactamente estas columnas:

```text
productId,date,quantity_sold
```

Cada fila representa la cantidad total vendida de un producto en un día. Los días sin ventas dentro del intervalo de cada serie se incluyen con `quantity_sold` igual a `0`. Si la consulta no encuentra ventas, se genera igualmente el CSV con esas tres columnas y sin registros.

## Control de versiones de datos

Los archivos generados dentro de `data/processed/` están excluidos del control de versiones. Solo se conserva `.gitkeep` para mantener disponible la estructura de directorios requerida por el pipeline.