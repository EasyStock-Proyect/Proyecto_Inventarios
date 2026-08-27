# Easy Stock

Sistema web para gestionar productos, categorías, existencias, ventas, alertas y reportes para pequeños comercios. Está compuesto por un frontend React desplegado en Cloudflare Pages, una API REST Express desplegada en Azure App Service, PostgreSQL en Azure Database for PostgreSQL y un componente Python desplegado en Azure Functions para generar predicciones de demanda.

## Estado actual

El backend implementa autenticación, productos, categorías, ventas, alertas, reportes y `GET /api/predictions`. El frontend consume autenticación, inventario, categorías, ventas y alertas; las vistas de dashboard, ajustes y predicción siguen en desarrollo. La vista de predicción todavía no consume la API.

El módulo ML usa Prophet para generar siete predicciones diarias por usuario/producto y las guarda en PostgreSQL Azure. Azure Functions ejecuta `weekly_predictions` según `ML_TRAINING_SCHEDULE`. No existe una API Python separada. El frontend consume únicamente el backend REST y no se conecta directamente a PostgreSQL ni a Azure Functions.

## Arquitectura

```text
Cloudflare Pages (React + Vite + CSS propio) --> Azure App Service (Express/CommonJS) --> Prisma --> Azure Database for PostgreSQL
                                      ^                         ^
                                      |                         |
                             GET /api/predictions       Python + Prophet
                                                                ^
                                                     Azure Functions Timer
```

Azure Functions genera las predicciones y las persiste en Azure Database for PostgreSQL. Express las consulta mediante Prisma; `GET /api/predictions` agrega los próximos siete días y usa una caché en memoria de una hora por usuario. Cloudflare Pages consume el backend REST, sin conexión directa a la base de datos ni a Azure Functions. Consulta [docs/architecture.md](docs/architecture.md) y [docs/ml-predictions.md](docs/ml-predictions.md).

## Estructura

```text
backend/                 API Express, Prisma, migraciones y Jest
frontend/                React/Vite, CSS propio y Vitest
ml/                      Python, Prophet y Azure Functions
docs/                    Documentación técnica y diagramas
.github/workflows/       CI y despliegue del backend
inventarios_data*.sql    Exportaciones SQL
*_inventarios*.dump      Dumps de PostgreSQL
```

## Tecnologías

- Frontend: React 19, Vite, React Router, Axios, CSS, Vitest y Testing Library.
- Backend: Node.js, Express 5/CommonJS, Prisma 6, PostgreSQL, JWT, bcrypt, cookie-parser, CORS, Jest y Supertest.
- ML: Python, pandas, Psycopg 3, Prophet y python-dotenv.
- Despliegue: Cloudflare Pages para frontend, Azure App Service para backend, Azure Database for PostgreSQL para persistencia y Azure Functions para ML.

## Inicio rápido

Requisitos locales: Node.js 22 o compatible, npm, Python compatible con `ml/requirements.txt` y acceso a PostgreSQL.

Configura `.env` desde los ejemplos sin subir secretos. Después:

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

La configuración completa está en [docs/development.md](docs/development.md) y [docs/configuration.md](docs/configuration.md).

## API

Las rutas disponibles bajo `/api` son `/auth`, `/products`, `/categories`, `/sales`, `/alerts`, `/reports/sales` y `/predictions`. La documentación detallada de cada módulo está distribuida entre las guías de arquitectura, autenticación, desarrollo y operaciones.

## Base de datos y predicciones

Prisma define `User`, `RefreshToken`, `Category`, `Product`, `Sale`, `SaleItem`, `StockMovement`, `StockAlert` y `DemandPrediction`. `DemandPrediction` se almacena en `demand_prediction` con unicidad por usuario, producto y fecha, en Azure Database for PostgreSQL. La guía está en [docs/database.md](docs/database.md).

La predicción se genera desde el primer día con historial disponible, usa como máximo 60 días de entrenamiento y un horizonte de siete días. Con menos de 30 días se genera igualmente, pero `hasEnoughData` y `recommendationReliable` son falsos.

## Pruebas

```powershell
cd backend
npm test

cd ..\frontend
npm run lint
npm test
```

El backend tiene pruebas de servicios, controladores, middleware e integración de productos. No hay una suite Python automatizada configurada en el repositorio.

## Despliegue

Los workflows validan backend/frontend en pull requests. `azure-backend.yml` despliega el backend a Azure App Service desde `main`. El frontend está desplegado en Cloudflare Pages y el módulo ML en Azure Functions; sus procesos de publicación no están definidos en los workflows presentes en este repositorio. Consulta [docs/deployment.md](docs/deployment.md).

## Documentación

- [Arquitectura](docs/architecture.md)
- [Desarrollo](docs/development.md)
- [Autenticación](docs/authentication.md)
- [Base de datos](docs/database.md)
- [Configuración](docs/configuration.md)
- [Despliegue](docs/deployment.md)
- [Operaciones](docs/operations.md)
- [ML y predicciones](docs/ml-predictions.md)
- [QA responsive y rendimiento](docs/qa-responsive-performance.md)
