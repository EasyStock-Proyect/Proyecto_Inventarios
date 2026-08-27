# Operaciones

## Arranque local

1. Verifica que Azure Database for PostgreSQL esté disponible y que `DATABASE_URL` apunte a la base correcta.
2. Aplica migraciones Prisma y, solo para datos de desarrollo, ejecuta el seed.
3. Arranca el backend desde `backend/` con `npm run dev`.
4. Arranca el frontend desde `frontend/` con `npm run dev`.
5. Configura el entorno ML antes de ejecutar el pipeline o la Function.

## Flujo de predicciones

`weekly_predictions`, desplegado en Azure Functions, obtiene las ventas actuales desde Azure Database for PostgreSQL, construye una serie diaria por usuario/producto, usa como máximo 60 días de historial, entrena Prophet y guarda siete fechas futuras en `demand_prediction`. Express, desplegado en Azure App Service, consulta esas filas mediante Prisma y `GET /api/predictions`. El frontend, desplegado en Cloudflare Pages, consume únicamente Express.

El endpoint mantiene una caché en memoria de una hora por usuario. Reiniciar el proceso Express elimina esa caché, pero no elimina las predicciones persistidas. La Function vuelve a generar predicciones según su schedule; no es invocada por cada consulta HTTP.

## Diagnóstico

- Si la API no arranca, revisa `DATABASE_URL` para Azure Database for PostgreSQL, Prisma generado, migraciones y `PORT`.
- Si las rutas protegidas devuelven `401`, revisa el access token, la cookie de refresh, `FRONTEND_URL` y `withCredentials`.
- Si `/api/predictions` devuelve una lista vacía, comprueba que existan filas recientes en `demand_prediction`, que correspondan al usuario y que los productos no tengan `deletedAt`.
- Si una predicción tiene `hasEnoughData=false`, el producto tiene menos de 30 días disponibles; el modelo se genera, pero la recomendación no debe considerarse confiable.
- Si la Function falla, revisa `DATABASE_URL` para Azure Database for PostgreSQL, dependencias Python, `ML_TRAINING_SCHEDULE` y los logs de ejecución.

## Seguridad y datos

No registres tokens, contraseñas ni cadenas de conexión. Los dumps y exportaciones SQL deben tratarse como datos sensibles y no deben restaurarse en una base de producción sin revisión y autorización.

## Límites conocidos

La pantalla frontend de predicción aún no consume la API. Aunque frontend y ML están desplegados en Cloudflare Pages y Azure Functions respectivamente, no hay workflows de publicación para ellos en este repositorio ni una suite Python automatizada configurada.
