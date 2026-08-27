# Frontend

Aplicación React 19 construida con Vite. Usa React Router, Axios, CSS propio, Lucide React, React Icons, Vitest y Testing Library.

## Estructura

- `src/api/`: cliente Axios y llamadas de autenticación.
- `src/auth/`: contexto, access token en memoria, restauración y refresh de sesión.
- `src/services/`: llamadas de productos, categorías, ventas y alertas.
- `src/components/`: componentes reutilizables.
- `src/pages/`: login, registro, dashboard, inventario, ventas, predicción y ajustes.
- `src/routes/`: rutas públicas y protegidas.

## Instalación y ejecución

```powershell
npm install
npm run dev
```

La variable `VITE_API_URL` configura la URL base. Si no se define, el cliente usa `/api`; el cliente normaliza el sufijo `/api` cuando es necesario.

## Scripts

```text
npm run dev      Servidor Vite
npm run build    Compilación de producción en dist/
npm run lint     ESLint
npm test         Vitest
npm run preview  Vista previa de la compilación
```

## Autenticación

Axios envía el access token en `Authorization: Bearer` y `withCredentials=true` para la cookie HTTP-only de refresh. Ante un `401`, intenta renovar la sesión una vez. El token de acceso se conserva en memoria, no en almacenamiento persistente del navegador.

## Estado funcional

El frontend consume autenticación, inventario, categorías, ventas y alertas. Dashboard, ajustes y predicción tienen pantallas en desarrollo; la página de predicción aún no consume `GET /api/predictions`.

La documentación general está en [../README.md](../README.md).
