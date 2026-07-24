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

# Módulo de Autenticación

Se implementó el sistema de autenticación del proyecto mediante una arquitectura cliente-servidor, permitiendo el registro e inicio de sesión de usuarios.

---

## Frontend

Se desarrollaron las siguientes vistas:

- Pantalla de inicio de sesión (Login).
- Pantalla de registro (Register).
- Dashboard temporal para validar el acceso al sistema.

### Características implementadas

- Diseño responsive para dispositivos móviles y escritorio.
- Validación de formularios en el cliente.
- Validación de formato de correo electrónico.
- Validación de longitud mínima de contraseña.
- Confirmación de contraseña durante el registro.
- Visualización y ocultamiento de la contraseña.
- Componentización de la interfaz mediante componentes reutilizables.
- Consumo de la API utilizando Axios.
- Manejo de mensajes de error provenientes del backend.
- Redirección al Dashboard después de un inicio de sesión exitoso.

---

## Componentes desarrollados

Se implementaron componentes reutilizables para facilitar el mantenimiento de la interfaz:

- Button
- Input
- PasswordInput
- Tabs
- Logo
- Footer
- AuthLink

---

# Backend

Se implementó la API de autenticación utilizando Express y Prisma ORM.

### Funcionalidades

- Registro de usuarios.
- Inicio de sesión.
- Validación de usuarios existentes.
- Hash de contraseñas mediante bcrypt.
- Generación de Access Token y Refresh Token utilizando JWT.
- Validación de credenciales.

---

# Endpoints implementados

## Registrar usuario

```http
POST /auth/register
```

Body

```json
{
    "businessName": "Mi Negocio",
    "businessType": "Tienda",
    "email": "correo@correo.com",
    "password": "12345678"
}
```

Respuesta

```json
{
    "message": "Usuario registrado correctamente"
}
```

---

## Iniciar sesión

```http
POST /auth/login
```

Body

```json
{
    "email": "correo@correo.com",
    "password": "12345678"
}
```

Respuesta

```json
{
    "accessToken": "...",
    "refreshToken": "..."
}
```

---

# Flujo de autenticación

1. El usuario completa el formulario de registro.
2. El frontend valida la información ingresada.
3. La información es enviada a la API.
4. El backend verifica si el correo ya existe.
5. La contraseña es cifrada utilizando bcrypt.
6. El usuario es almacenado en la base de datos.
7. El usuario inicia sesión.
8. El backend valida las credenciales.
9. Se generan los tokens de autenticación (JWT).
10. El frontend redirige al Dashboard.

---

# Funcionalidades implementadas

## Frontend

- Login responsive.
- Registro responsive.
- Validación de formularios.
- Integración con la API.
- Manejo de errores.
- Redirección al Dashboard.
- Componentes reutilizables.

## Backend

- API REST de autenticación.
- Registro de usuarios.
- Inicio de sesión.
- Hash de contraseñas con bcrypt.
- Generación de JWT.
- Integración con Prisma ORM.
- Persistencia en MySQL.

---

# Estructura agregada

```text
frontend/
└── src/
    ├── api/
    │   ├── api.js
    │   └── auth.js
    │
    ├── components/
    │   ├── AuthLink/
    │   ├── Button/
    │   ├── Footer/
    │   ├── Input/
    │   ├── Logo/
    │   ├── PasswordInput/
    │   └── Tabs/
    │
    ├── pages/
    │   ├── Login/
    │   ├── Register/
    │   └── Dashboard/
    │
    └── routes/
        └── AppRoutes.jsx

backend/
├── src/
│   ├── config/
│   │   └── prisma.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── index.js
│   │
│   ├── services/
│   │   └── auth.service.js
│   │
│   └── app.js
│
└── index.js
```
