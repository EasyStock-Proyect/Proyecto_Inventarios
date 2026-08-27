# Documentación de la API

## Iniciar el backend

Desde `backend/` instala las dependencias y arranca el servidor:

```powershell
npm install
npm start
```

El servidor local usa el puerto `3000` si no se configura otro mediante `PORT`.

## Abrir Swagger UI

Con el backend ejecutándose, abre:

<http://localhost:3000/api-docs>

Swagger UI carga la especificación externa desde `/api-docs/openapi.yaml`. La fuente versionada está en [openapi.yaml](openapi.yaml). La especificación no está duplicada en JavaScript.

## Autenticación

Las operaciones protegidas requieren un access token JWT. En Swagger UI:

1. Ejecuta `POST /api/auth/login` con las credenciales de un usuario de desarrollo.
2. Copia el valor `accessToken` de la respuesta.
3. Pulsa **Authorize**.
4. Introduce el token con el esquema Bearer, por ejemplo `Bearer <access-token-jwt>`.
5. Ejecuta las operaciones protegidas.

El refresh token se gestiona mediante la cookie HTTP-only `refreshToken`; no se introduce manualmente en los cuerpos JSON.

## Probar predicciones

`GET /api/predictions` requiere autenticación Bearer JWT. Pulsa **Authorize**, introduce un access token válido y ejecuta la operación. La respuesta consulta las predicciones almacenadas en PostgreSQL; no ejecuta Prophet ni Azure Functions.

Cada elemento puede incluir `productId`, `productName`, `forecast7d`, `currentStock`, `recommendedOrder`, `confidence.lowerBound`, `confidence.upperBound` y `hasEnoughData`. El endpoint agrega el horizonte de siete días y mantiene una caché en memoria de una hora por usuario.
