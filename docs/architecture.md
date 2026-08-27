# Arquitectura

## Vista general

Easy Stock está organizado como una aplicación web con un frontend React desplegado en Cloudflare Pages, una API REST Express desplegada en Azure App Service, Azure Database for PostgreSQL como base de datos y un proceso Python desplegado en Azure Functions para predicciones de demanda.

```text
+------------------+       HTTP/JSON        +-------------------+
| Cloudflare Pages | ---------------------> | Azure App Service |
| React + Vite     | <--------------------- | Express + CommonJS|
| CSS propio       | <--------------------- | /api              |
+------------------+    JWT + cookie         +---------+---------+
                                                       |
                                                    Prisma
                                                       |
                                                       v
                                             +-------------------+
                                             | Azure Database for |
                                             | PostgreSQL         |
                                             | demand_prediction  |
                                             +---------+---------+
                                                       ^
                                                       |
                                             +---------+---------+
                                             | Azure Functions    |
                                             | weekly_predictions |
                                             | Python + Prophet   |
                                             +-------------------+
```

El frontend usa exclusivamente el backend REST como API; no se conecta directamente a PostgreSQL ni a Azure Functions. Azure Functions ejecuta `weekly_predictions`, lee ventas desde Azure Database for PostgreSQL, genera predicciones con Prophet y escribe el resultado en `demand_prediction`. Después, Express consulta esas filas mediante Prisma y `GET /api/predictions` devuelve una agregación para el frontend.

## Componentes

### Frontend

`frontend/` contiene una aplicación React 19 servida y compilada con Vite, desplegada en Cloudflare Pages. Usa React Router para navegación, Axios para HTTP y CSS propio para estilos. `src/api/` centraliza el cliente HTTP; `src/auth/` gestiona el access token en memoria, la restauración de sesión y el refresh; `src/services/` contiene llamadas de negocio; `src/pages/` contiene las vistas.

La vista de predicción existe como pantalla, pero actualmente muestra contenido en desarrollo y no consume `/api/predictions`.

### Backend

`backend/` contiene una aplicación Node.js CommonJS con Express 5, desplegada en Azure App Service. `index.js` carga variables de entorno, importa `src/app.js` y escucha en el puerto configurado. `src/app.js` configura CORS, cookies, JSON y monta las rutas bajo `/api`.

La responsabilidad está dividida en:

- `routes/`: nombres y métodos HTTP;
- `controllers/`: traducción entre HTTP y servicios;
- `services/`: reglas de negocio y acceso a Prisma;
- `middlewares/`: autenticación y manejo de errores;
- `config/`: cliente Prisma;
- `utils/`: JWT y otras utilidades.

### Persistencia

Prisma Client conecta Express con Azure Database for PostgreSQL. El esquema y las migraciones viven en `backend/prisma/`. La base contiene usuarios, tokens de refresh, categorías, productos, ventas, movimientos de stock, alertas y predicciones de demanda.

### ML y Azure Functions

`ml/` contiene el código Python desplegado en Azure Functions para acceder a Azure Database for PostgreSQL, preparar series, entrenar con Prophet y persistir predicciones. `function_app.py` define `health` y el temporizador `weekly_predictions`. Azure Functions ejecuta el temporizador con la frecuencia indicada por `ML_TRAINING_SCHEDULE`.

## Módulos funcionales

- Autenticación: registro, login, refresh, logout y usuario actual.
- Productos: consulta paginada, creación, actualización, eliminación lógica, generación de SKU y ajustes de stock.
- Categorías: consulta y operaciones CRUD.
- Ventas: registro transaccional y consulta paginada.
- Alertas: consulta de alertas no leídas y marcado como leídas.
- Reportes: ventas agrupadas por día, semana o mes.
- Predicciones: lectura agregada de siete días por producto.

## Estructura relevante

```text
backend/src/{config,controllers,middlewares,routes,services,utils}
backend/prisma/{schema.prisma,migrations,seed.js}
backend/tests/
frontend/src/{api,auth,components,layouts,pages,routes,services}
ml/{src,scripts,function_app.py,requirements.txt}
docs/
.github/workflows/
```

Los diagramas existentes en `docs/` complementan esta descripción, pero esta guía y el código son la referencia para el estado actual.
