# Desarrollo

## Requisitos

- Node.js 22 o una versión compatible con los `package.json`.
- npm.
- Python compatible con `ml/requirements.txt`.
- PostgreSQL accesible desde backend y ML.

## Instalación

### Backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

El seed es para desarrollo y no forma parte del despliegue productivo.

### Frontend

```powershell
cd frontend
npm install
```

### ML

```powershell
cd ml
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Configuración

Copia cada `.env.example` a `.env` y configura valores locales. El backend requiere PostgreSQL y secretos JWT; el frontend usa `VITE_API_URL`; ML requiere `DATABASE_URL`; Azure Functions requiere además `ML_TRAINING_SCHEDULE`. Consulta [configuration.md](configuration.md).

## Ejecución

En terminales separadas:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

El backend usa `PORT` o `3000` y el frontend normalmente usa el servidor de desarrollo de Vite. La API queda bajo `/api`.

Para abrir Prisma Studio:

```powershell
cd backend
npm run studio
```

Para preparar series de ventas:

```powershell
cd ml
python scripts/prepare_sales_data.py
```

## Scripts disponibles

| Componente | Comando | Propósito |
| --- | --- | --- |
| Backend | `npm start` | Arranca Node.js. |
| Backend | `npm run dev` | Arranca Node.js con Nodemon. |
| Backend | `npm test` | Ejecuta Jest con cobertura. |
| Backend | `npm run migrate` | Ejecuta `prisma migrate dev`. |
| Frontend | `npm run dev` | Arranca Vite. |
| Frontend | `npm run build` | Genera `dist`. |
| Frontend | `npm run lint` | Ejecuta ESLint. |
| Frontend | `npm test` | Ejecuta Vitest. |

## Migraciones

Durante desarrollo usa `npx prisma migrate dev` para crear y aplicar migraciones. En un entorno que solo debe aplicar migraciones existentes usa `npx prisma migrate deploy`. Genera el cliente con `npx prisma generate` después de instalar o cambiar el esquema.

## Despliegue

Los detalles de CI y Azure están en [deployment.md](deployment.md). El workflow existente despliega únicamente el backend a Azure App Service. No hay automatización de publicación para frontend ni Azure Functions.

## Convenciones de cambio

Mantén separadas rutas, controladores, servicios y utilidades del backend. No edites migraciones ya aplicadas para corregir el historial. Mantén los secretos fuera del repositorio y actualiza la documentación cuando cambie una variable, ruta o proceso existente.
