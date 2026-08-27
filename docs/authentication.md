# Autenticación

## Flujo

La API usa dos tokens con responsabilidades distintas:

- **Access token:** JWT firmado con `JWT_SECRET`, con duración de una hora. Contiene `id` y `email` del usuario. Se envía en `Authorization: Bearer <token>`.
- **Refresh token:** JWT firmado con `JWT_REFRESH_SECRET`, con duración de siete días. Se guarda en una cookie HTTP-only llamada `refreshToken`; su hash SHA-256 se persiste en `refresh_token`.

Las rutas protegidas ejecutan `auth.middleware.js`. El middleware valida el encabezado Bearer y asigna los claims decodificados a `req.user`.

## Operaciones

- `POST /api/auth/register`: crea un usuario. La contraseña debe tener al menos ocho caracteres.
- `POST /api/auth/login`: valida credenciales, crea ambos tokens, persiste el refresh token y devuelve solo el access token en JSON.
- `POST /api/auth/refresh`: lee la cookie, valida el JWT y su registro no revocado, revoca el token anterior y crea uno nuevo.
- `POST /api/auth/logout`: revoca el refresh token recibido y limpia la cookie.
- `GET /api/auth/me`: devuelve el usuario autenticado y requiere access token.

## Cookies y CORS

Express usa `cookie-parser` y CORS con credenciales. El origen permitido se obtiene de `FRONTEND_URL` o usa `http://localhost:5173` por defecto. En producción la cookie es `secure` y usa `sameSite=lax`; en desarrollo usa `sameSite=strict`.

El cliente Axios conserva el access token en memoria, envía credenciales y reintenta una solicitud `401` una vez después de renovar la sesión. El refresh token no se expone al JavaScript del navegador.

## Errores

La API responde `401` cuando falta el token, el formato no es Bearer o el token es inválido/expiró. Los errores de credenciales y validación se devuelven con un objeto JSON que contiene `message`.

## Consideraciones operativas

Los secretos deben configurarse mediante variables de entorno y nunca documentarse con valores reales. La revocación de refresh tokens depende de la tabla `refresh_token`; eliminar o perder esa tabla invalida el estado de sesión persistido.
