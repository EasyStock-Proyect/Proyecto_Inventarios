# Proyecto Inventarios / Easy Stock

Sistema web para la gestión de inventarios y ventas dirigido a pequeños comercios. El proyecto integra una interfaz web, una API REST, persistencia en PostgreSQL y un módulo independiente de preparación de datos de ventas para futuras tareas de análisis y predicción de demanda.

## Descripción del proyecto

El sistema centraliza la administración de productos, categorías y existencias, y permite registrar ventas asociadas a los productos del inventario. La aplicación incluye autenticación de usuarios, control de acceso a las operaciones protegidas, seguimiento de movimientos de stock y alertas cuando las existencias alcanzan el mínimo configurado.

El objetivo general es ofrecer una base operativa para que pequeños comercios puedan consultar y actualizar su inventario, registrar sus ventas y obtener información agrupada sobre el comportamiento de estas. La preparación de datos ML se ejecuta actualmente como un proceso independiente y no como una funcionalidad predictiva integrada en la aplicación web.

## Estado actual

El sistema cuenta con módulos funcionales de autenticación, inventario, categorías, ventas, alertas y reportes de ventas en el backend. En el frontend, las pantallas de inventario y ventas consumen la API; el dashboard, ajustes y predicción tienen actualmente contenido en desarrollo. El módulo ML prepara un archivo CSV a partir del historial de ventas, pero todavía no implementa modelos, entrenamiento, predicciones ni una API de predicción.

## Arquitectura general

```text
                 HTTP / JSON
Frontend React + Vite ---------> Backend Node.js + Express
                                      |
                                      v
                                 Prisma ORM
                                      |
                                      v
                                  PostgreSQL

Módulo ML independiente --------> PostgreSQL
                                      |
                                      v
                              Preparación de datos
                                      |
                                      v
                       data/processed/sales_time_series.csv
```

El frontend se comunica con el backend mediante la API bajo el prefijo `/api`. El módulo ML no está conectado al backend ni al frontend: consulta PostgreSQL directamente y genera un CSV local. Actualmente no existe una API de predicciones integrada con la interfaz web.

### Capas principales

- **Frontend:** aplicación React construida con Vite. Gestiona las vistas, la navegación, los formularios y las llamadas HTTP.
- **Backend:** API REST construida con Node.js y Express. Organiza las rutas, controladores, servicios y middlewares.
- **Persistencia:** Prisma Client se utiliza como ORM sobre PostgreSQL.
- **Autenticación:** el access token JWT se envía en el encabezado `Authorization`. El refresh token se mantiene en una cookie HTTP-only y permite restaurar o renovar la sesión.
- **ML:** proceso Python independiente que extrae y normaliza el historial de ventas para producir series diarias.

## Estructura del proyecto

Se muestran las carpetas y archivos principales; se omiten dependencias instaladas, entornos virtuales, reportes de cobertura y otros archivos generados.

```text
Proyecto_Inventarios/
├── .github/
│   └── workflows/
│       ├── backend-test.yml
│       ├── frontend-test.yml
│       └── azure-backend.yml
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── tests/
│   ├── index.js
│   ├── jest.config.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── ml/
│   ├── src/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── data_preparation.py
│   ├── scripts/
│   │   └── prepare_sales_data.py
│   ├── data/
│   │   └── processed/
│   ├── requirements.txt
│   └── README.md
├── docs/
├── inventarios_data.sql
├── inventarios_data_clean.sql
└── README.md
```

### Backend

- `src/controllers/`: recibe las solicitudes HTTP y construye las respuestas para autenticación, productos, categorías, ventas, alertas y reportes.
- `src/services/`: contiene la lógica de negocio y las operaciones sobre Prisma.
- `src/routes/`: registra los endpoints bajo `/api` y aplica el middleware de autenticación a las rutas protegidas.
- `src/middlewares/`: incluye la validación del access token y el manejo centralizado de errores.
- `src/utils/`: utilidades para JWT y hash de contraseñas.
- `src/config/`: instancia y configura el cliente de Prisma.
- `prisma/`: esquema PostgreSQL, migraciones y script de datos iniciales.
- `tests/`: pruebas unitarias de servicios, controladores y middlewares, además de una prueba de integración de productos.

### Frontend

- `src/api/`: cliente HTTP y operaciones de autenticación.
- `src/auth/`: contexto, proveedor, recuperación de sesión y administración del access token.
- `src/components/`: componentes reutilizables de formularios, productos, carrito, ventas, navegación, alertas y diálogos.
- `src/layouts/`: layout principal de la aplicación.
- `src/pages/`: vistas de login, registro, dashboard, inventario, ventas, predicción y ajustes.
- `src/routes/`: enrutamiento de la aplicación y protección de rutas mediante `ProtectedRoute`.
- `src/services/`: funciones de acceso a productos, categorías, ventas y alertas.
- `src/assets/`: fuentes, iconos y logotipos.

### ML

- `src/config.py`: carga y valida `DATABASE_URL` mediante `python-dotenv`.
- `src/database.py`: conecta a PostgreSQL con Psycopg 3 y obtiene el historial agrupado por producto y día desde `sale` y `sale_item`.
- `src/data_preparation.py`: normaliza fechas y cantidades, agrupa los datos y completa con cero los días sin ventas.
- `scripts/prepare_sales_data.py`: punto de entrada del pipeline y generador del CSV procesado.
- `data/processed/`: almacena resultados generados; los datasets no se versionan y la carpeta se conserva con `.gitkeep`.
- `requirements.txt`: dependencias Python del módulo.

## Tecnologías utilizadas

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt
- cookie-parser
- cors
- Jest
- Supertest

### Frontend

- React
- Vite
- Axios
- React Router
- Lucide React
- React Icons
- xlsx
- CSS
- Vitest
- Testing Library

### ML

- Python
- pandas
- Psycopg 3
- python-dotenv

### Integración y entrega

- GitHub Actions
- PostgreSQL como servicio en los workflows de validación
- Azure App Service para el workflow de despliegue del backend

No existe actualmente una configuración de Docker propia en el repositorio.

## Funcionalidades actuales

### Autenticación

- Registro de usuarios con nombre y tipo de negocio, correo y contraseña.
- Inicio de sesión con access token JWT.
- Emisión y rotación de refresh tokens persistidos en PostgreSQL.
- Almacenamiento del refresh token en cookie HTTP-only.
- Renovación automática del access token cuando una solicitud recibe una respuesta `401`.
- Restauración de sesión al cargar el frontend.
- Cierre de sesión y revocación del refresh token.
- Protección de rutas y endpoints mediante autenticación.

### Inventario y categorías

- Creación, consulta, actualización y eliminación lógica de productos.
- Generación de SKU por categoría.
- Búsqueda de productos por nombre o SKU.
- Filtrado por categoría.
- Paginación de productos.
- Gestión de precio, stock actual, stock mínimo y categoría.
- Ajustes de stock con cantidad, dirección, motivo y notas.
- Consulta del historial de movimientos de stock.
- Creación y consulta de alertas de stock.
- Marcado de alertas como leídas.
- Creación, consulta, actualización y eliminación de categorías.

### Ventas

- Registro de ventas con uno o más productos.
- Validación de producto, cantidad, precio y stock disponible.
- Actualización transaccional del stock después de registrar una venta.
- Generación de alertas cuando el stock queda en el mínimo configurado o por debajo de este.
- Consulta paginada del historial de ventas.
- Filtros opcionales del historial por fecha inicial y final.
- Consulta de productos para construir el carrito de venta.
- Exportación del historial de ventas desde el frontend a formato XLSX.

### Reportes

El backend dispone de un endpoint protegido para reportes de ventas. Permite consultar un periodo opcional y agrupar los resultados por día, semana o mes. El reporte calcula el total de ventas, los ingresos, los productos más vendidos y los datos agrupados por periodo.

El dashboard del frontend todavía se encuentra en desarrollo, por lo que estos datos no se presentan actualmente en un tablero implementado.

### Vistas en desarrollo

- `Dashboard`: muestra el acceso inicial y una indicación de que la pantalla está en desarrollo.
- `Ajustes`: muestra una indicación de que la configuración del negocio está en desarrollo.
- `Predicción`: muestra que el módulo de predicción está en desarrollo; no consume el módulo ML ni ejecuta predicciones.

## Módulo de preparación de datos ML

La US-21 corresponde a la preparación del historial de ventas para dejar un dataset diario, consistente y reutilizable en futuras tareas de análisis de demanda.

Actualmente, el módulo:

- Consulta PostgreSQL relacionando las tablas `sale` y `sale_item`.
- Extrae `productId`, fecha de venta y cantidad vendida.
- Agrupa las cantidades por producto y día.
- Normaliza las fechas y convierte `quantity_sold` a valores numéricos.
- Completa con `0` los días sin ventas.
- Permite filtrar el intervalo con `--start` y `--end` en formato `YYYY-MM-DD`.
- Genera `ml/data/processed/sales_time_series.csv` con las columnas exactas `productId,date,quantity_sold`.

Los modelos predictivos, el entrenamiento, las predicciones y la integración con el frontend no están implementados.

### Ejecución del pipeline ML

Desde la raíz del repositorio:

```powershell
cd ml
python scripts/prepare_sales_data.py
```

También se puede indicar un rango completo o uno de sus límites:

```powershell
python scripts/prepare_sales_data.py --start 2026-08-01 --end 2026-08-20
python scripts/prepare_sales_data.py --start 2026-08-01
python scripts/prepare_sales_data.py --end 2026-08-20
```

Si se proporcionan ambos límites y la fecha inicial es posterior a la fecha final, el proceso genera un error de validación. Sin un rango, cada producto se completa desde su primera hasta su última venta disponible.

## Requisitos e instalación

### Requisitos generales

- Node.js 22 o una versión compatible con los paquetes del proyecto.
- npm.
- Python 3.14 o una versión compatible con las dependencias del módulo ML.
- PostgreSQL accesible.

### Backend

Desde `backend/`:

```powershell
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

El backend utiliza `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` y, opcionalmente, `FRONTEND_URL`. La base de datos debe ser PostgreSQL y las migraciones se encuentran en `backend/prisma/migrations/`.

Scripts disponibles:

```text
npm start       Inicia el servidor
npm run dev     Inicia el servidor con Nodemon
npm test        Ejecuta Jest con cobertura
npm run seed    Ejecuta el seed de Prisma
npm run migrate Ejecuta las migraciones en desarrollo
npm run studio  Abre Prisma Studio
```

### Frontend

Desde `frontend/`:

```powershell
npm install
npm run dev
```

El frontend utiliza `VITE_API_URL` para configurar la URL base de la API. Si no se define, el cliente utiliza `/api`.

Scripts disponibles:

```text
npm run dev      Inicia Vite
npm run build    Genera la compilación de producción
npm run lint     Ejecuta ESLint
npm test         Ejecuta las pruebas con Vitest
npm run preview  Sirve la compilación generada
```

### ML

Desde `ml/`, se recomienda crear un entorno virtual e instalar las dependencias:

```powershell
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crea `ml/.env` a partir de `ml/.env.example` y configura `DATABASE_URL`. El archivo `.env` no debe subirse al repositorio.

## Base de datos

El esquema de Prisma define las siguientes entidades principales:

- `User`
- `RefreshToken`
- `Category`
- `Product`
- `Sale`
- `SaleItem`
- `StockMovement`
- `StockAlert`

Las relaciones, restricciones y nombres de tablas se encuentran en `backend/prisma/schema.prisma`. Las migraciones versionadas están en `backend/prisma/migrations/` y los datos iniciales de desarrollo en `backend/prisma/seed.js`.

## Pruebas

### Backend

Las pruebas del backend utilizan Jest y Supertest. Cubren servicios, controladores, middlewares y una integración de productos. Se ejecutan desde `backend/`:

```powershell
npm test
```

### Frontend

Las pruebas del frontend utilizan Vitest y Testing Library. Se ejecutan desde `frontend/`:

```powershell
npm test
```

También se puede revisar el código con:

```powershell
npm run lint
```

## Integración continua y despliegue

El repositorio contiene los siguientes workflows de GitHub Actions:

- `backend-test.yml`: en pull requests hacia `main` o `develop`, instala el backend, genera el cliente Prisma, prepara una base PostgreSQL de pruebas con las migraciones y ejecuta Jest.
- `frontend-test.yml`: en pull requests hacia `main` o `develop`, instala el frontend, ejecuta ESLint y ejecuta las pruebas de Vitest.
- `azure-backend.yml`: en pushes a `main` que afecten `backend/` o el propio workflow, y mediante ejecución manual, valida el backend, crea un artefacto y lo despliega en Azure App Service.

El workflow de Azure requiere los secretos de GitHub configurados para el inicio de sesión federado en Azure: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` y `AZURE_SUBSCRIPTION_ID`.

## Documentación adicional

La carpeta `docs/` contiene diagramas del sistema, del modelo relacional y de algunos flujos de autenticación, registro de ventas y preparación de predicción.