# Base de datos

## PostgreSQL y Prisma

La aplicación usa PostgreSQL (`provider = "postgresql"`) y Prisma Client. La configuración de conexión se obtiene de `DATABASE_URL`. El esquema canónico está en `backend/prisma/schema.prisma`; las migraciones están en `backend/prisma/migrations/`.

## Modelos

- `User`: identidad, correo, contraseña hash y relaciones de negocio.
- `RefreshToken`: hash del refresh token, expiración, revocación y usuario.
- `Category`: categorías pertenecientes a un usuario.
- `Product`: SKU, precio, existencias, stock mínimo y eliminación lógica mediante `deletedAt`.
- `Sale` y `SaleItem`: cabecera y detalle de ventas.
- `StockMovement`: ajustes de inventario.
- `StockAlert`: alertas de stock y estado de lectura.
- `DemandPrediction`: predicción diaria por usuario, producto y fecha.

Las relaciones usan eliminación en cascada donde está definido en el esquema. `DemandPrediction` tiene una restricción única sobre `userId`, `productId` y `forecastDate`, y un índice sobre `userId`, `productId`.

## Predicciones

El proceso Python inserta o actualiza filas de `demand_prediction` con un upsert. Cada fila incluye cantidad predicha, límites inferior/superior, fechas y días usados para entrenamiento, indicador `hasEnoughData` y fecha de generación. Express consulta las fechas desde el día actual UTC hasta antes de siete días y excluye productos con `deletedAt`.

## Migraciones

Desde `backend/`:

```powershell
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
```

`migrate dev` se usa durante desarrollo y puede crear migraciones. `migrate deploy` aplica migraciones existentes, como ocurre en CI. El seed se ejecuta con:

```powershell
npx prisma db seed
```

No se deben editar migraciones aplicadas para cambiar el historial. Los cambios del modelo deben generar una nueva migración revisada.

## Conexión local

Crea una base PostgreSQL vacía y configura `DATABASE_URL` en `backend/.env`. El valor debe permanecer fuera del control de versiones. Los dumps y scripts SQL del repositorio son artefactos de datos; su uso debe hacerse sobre una base destinada a desarrollo o restauración, nunca sobre producción sin revisión.
