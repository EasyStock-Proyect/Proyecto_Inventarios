# QA responsive y rendimiento

## Alcance

Validar la aplicación en Chrome con estos viewports:

| Viewport | Dispositivo de referencia | Resultado |
| --- | --- | --- |
| 360 x 800 | Móvil | Pendiente de ejecución |
| 768 x 1024 | Tablet | Pendiente de ejecución |
| 1280 x 800 | Escritorio | Pendiente de ejecución |

## Prueba manual en Chrome DevTools

1. Ejecutar el frontend en modo producción con `npm run build` y `npm run preview` dentro de `frontend`.
2. Abrir Chrome DevTools, activar Device Toolbar y probar cada viewport de la tabla.
3. Recorrer login, dashboard, inventario, ventas, historial, modales y formularios.
4. En cada viewport comprobar que no aparece scroll horizontal en `document.documentElement` y que ningún control, tabla o modal se superpone.
5. Revisar la consola y marcar como fallo cualquier error o warning producido durante el flujo.
6. En la pestaña Network, confirmar que las solicitudes principales terminan correctamente y registrar su duración.

## Rendimiento de API

Con PostgreSQL de pruebas configurado, ejecutar desde `backend`:

```text
npx jest tests/products.integration.test.js --runInBand --coverage=false
```

La prueba crea los productos necesarios hasta llegar a 100 y mide cinco solicitudes autenticadas a `GET /api/products?limit=100`. El criterio automático exige que la respuesta más lenta sea menor de 500 ms.

## Evidencia

Registrar en el ticket la fecha, navegador, viewport, resultado de overflow/superposición, errores de consola y el máximo observado en Network. La suite automatizada cubre el umbral de API; la matriz visual requiere ejecución manual en Chrome DevTools.