# Configuración

## Variables de entorno

Los archivos `.env` son locales y están excluidos por los `.gitignore` de cada componente. Usa los archivos `.env.example` como plantilla y reemplaza los placeholders localmente sin subir valores reales.

### Backend

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión de Prisma a Azure Database for PostgreSQL en el despliegue real. |
| `JWT_SECRET` | Sí | Firma del access token. |
| `JWT_REFRESH_SECRET` | Sí | Firma del refresh token. |
| `PORT` | No | Puerto HTTP; el código usa `3000` si no se define. |
| `FRONTEND_URL` | No | Origen permitido por CORS; por defecto `http://localhost:5173`. |
| `NODE_ENV` | No | Determina opciones de cookie de producción. |

### Frontend

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `VITE_API_URL` | No | URL base de la API; el cliente normaliza el sufijo `/api`. |
| `VITE_APP_NAME` | No | Nombre de aplicación disponible para Vite. |
| `VITE_ENV` | No | Identificador de entorno del frontend. |

### ML y Azure Functions

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión Psycopg a Azure Database for PostgreSQL en el despliegue real. |
| `ML_TRAINING_SCHEDULE` | Sí para el temporizador | Expresión de programación que consume el trigger de Azure Functions. |

Azure Functions también requiere la configuración propia del entorno de Functions. No existe un `local.settings.json` versionado en este repositorio; no crees uno con secretos dentro del control de versiones. El frontend desplegado en Cloudflare Pages solo necesita la URL configurada del backend mediante `VITE_API_URL`; no necesita credenciales de PostgreSQL ni configuración de Azure Functions.

## Ejemplos

- [backend/.env.example](../backend/.env.example)
- [frontend/.env.example](../frontend/.env.example)
- [ml/.env.example](../ml/.env.example)

Los ejemplos contienen nombres y placeholders, nunca credenciales, tokens ni cadenas de conexión utilizables.
