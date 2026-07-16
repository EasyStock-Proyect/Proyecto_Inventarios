# Proyecto_Inventarios

## Descripción

Proyecto académico para el desarrollo de un sistema inteligente de gestión de inventarios y análisis de ventas, orientado a pequeños y medianos comercios. El sistema permitirá administrar productos, controlar existencias, registrar ventas y generar información útil para la toma de decisiones.

---

## Tecnologías

### Frontend

- React
- Vite
- JavaScript
- ESLint
- Vitest

### Backend *(En desarrollo)*

- Node.js
- Express
- MySQL

### Control de versiones

- Git
- GitHub
- GitHub Actions (CI)

---

## Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 22 o superior
- npm
- Git

---

## Clonar el repositorio

```bash
git clone https://github.com/Pablobenavide/Proyecto_Inventarios.git
```

Entrar al proyecto:

```bash
cd Proyecto_Inventarios
```

---

# Configuración del Frontend

Ingresar a la carpeta:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

> En Windows (CMD):

```cmd
copy .env.example .env
```

Modificar las variables según el entorno de desarrollo.

---

## Ejecutar el proyecto

```bash
npm run dev
```

---

## Ejecutar ESLint

```bash
npm run lint
```

---

## Ejecutar pruebas

```bash
npm test
```

---

## Integración Continua (CI)

El proyecto utiliza **GitHub Actions** para ejecutar automáticamente:

- ESLint
- Pruebas con Vitest

Cada Pull Request hacia las ramas protegidas ejecuta el pipeline de integración continua antes de permitir la fusión de cambios.

---

## Variables de entorno

Las variables necesarias se encuentran documentadas en:

```text
frontend/.env.example
```

Cada desarrollador debe crear un archivo:

```text
frontend/.env
```

a partir del archivo de ejemplo.

---

## Estructura del proyecto

```text
Proyecto_Inventarios/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── ...
│
├── backend/          (En desarrollo)
│
├── README.md
│
└── .gitignore
```

---

## Flujo de trabajo

El proyecto utiliza el siguiente flujo de ramas:

- **develop** → Rama principal de desarrollo donde se integran los cambios.
- **main** → Rama estable que contiene las versiones listas para producción o entrega.

Los cambios se realizan sobre la rama **develop** y posteriormente se integran a **main** mediante un **Pull Request**.

Antes de aprobar un Pull Request, GitHub Actions ejecuta automáticamente:

- ESLint (`npm run lint`)
- Pruebas (`npm test`)

Solo si las verificaciones son exitosas y el Pull Request es aprobado, los cambios pueden fusionarse con la rama protegida.

---

# Configuración del Backend

Ingresar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

---

## Crear la base de datos

Crear una base de datos en MySQL:

```sql
CREATE DATABASE inventarios_db;
```

---

## Variables de entorno

Crear el archivo:

```text
backend/.env
```

Agregar la cadena de conexión:

```env
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@localhost:3306/inventarios_db"
```

Ejemplo:

```env
DATABASE_URL="mysql://root:admin@localhost:3306/inventarios_db"
```

---

# Prisma ORM

El backend utiliza **Prisma ORM** para el modelado, versionado y administración de la base de datos.

---

## Generar el cliente de Prisma

```bash
npx prisma generate
```

---

## Ejecutar migraciones

Aplicar las migraciones existentes:

```bash
npx prisma migrate dev
```

Crear una nueva migración:

```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

Ejemplo:

```bash
npx prisma migrate dev --name add_product_barcode
```

---

## Ejecutar los datos de prueba (Seed)

```bash
npx prisma db seed
```

Este comando inserta datos iniciales para facilitar el desarrollo y las pruebas.

---

## Reiniciar la base de datos

En caso de necesitar reconstruir completamente la base de datos:

```bash
npx prisma migrate reset
```

Este comando:

- Elimina la base de datos.
- Ejecuta nuevamente todas las migraciones.
- Ejecuta automáticamente el Seed.

---

## Prisma Studio

Para visualizar y administrar la base de datos desde una interfaz gráfica:

```bash
npx prisma studio
```

---

# Modelo de Base de Datos

Actualmente el sistema cuenta con las siguientes entidades:

- User
- Category
- Product
- Sale
- SaleItem
- StockAlert

El modelo se encuentra definido en:

```text
backend/prisma/schema.prisma
```

---

# Migraciones

Todas las modificaciones del esquema quedan registradas automáticamente en:

```text
backend/prisma/migrations
```

Esto garantiza que cualquier desarrollador pueda recrear exactamente la misma base de datos ejecutando las migraciones.

---

# Seeds

Los datos de prueba se encuentran en:

```text
backend/prisma/seed.js
```

Estos permiten poblar automáticamente la base de datos para realizar pruebas y desarrollo.

---

# Variables de entorno

## Frontend

```text
frontend/.env.example
```

Crear:

```text
frontend/.env
```

---

## Backend

```text
backend/.env
```

Debe contener:

```env
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@localhost:3306/inventarios_db"
```

---

# Estructura del proyecto

```text
Proyecto_Inventarios/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── ...
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   ├── .env
│   └── ...
│
├── README.md
│
└── .gitignore
```

---

# Funcionalidades implementadas del Backend

- Configuración inicial de **Prisma ORM**.
- Conexión a **MySQL** mediante variables de entorno.
- Esquema de base de datos versionado mediante migraciones.
- Modelado de las entidades:
  - User
  - Category
  - Product
  - Sale
  - SaleItem
  - StockAlert
- Datos de prueba mediante **Prisma Seed**.
- Administración visual de la base de datos con **Prisma Studio**.
- Reconstrucción de la base de datos mediante migraciones (`prisma migrate reset`).

---
