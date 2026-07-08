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