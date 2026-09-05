# Solarte | Inventario de lacteos

Proyecto final de Servicios y APIs para gestionar articulos de la bodega Solarte.

## Puesta en marcha

1. Copiar `.env.example` como `.env`.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Abrir `http://localhost:5173`.

La API queda disponible en `http://localhost:3001`.

## Publicar en Render

1. Crear un repositorio en GitHub y subir toda esta carpeta.
2. En Render elegir **New > Blueprint** y conectar ese repositorio.
3. Render detectara `render.yaml`, instalara dependencias, construira React y levantara Express.
4. La URL publica sera similar a `https://solarte-inventario.onrender.com`.
5. Para Thunder Client usar esa misma URL: `https://solarte-inventario.onrender.com/api/products`.

En el plan gratuito el servicio puede dormir despues de un periodo sin visitas y tardar unos segundos en responder la primera vez. Como SQLite usa almacenamiento temporal en ese plan, para una entrega permanente conviene migrar luego a PostgreSQL (por ejemplo, una base gratuita de Supabase o Neon).

## Sustentacion

- **Archivos de la API:** `server.js` contiene Express, la conexion SQLite y todos los endpoints CRUD.
- **Archivos del aplicativo:** `src/main.jsx` contiene la interfaz React y `src/styles.css` contiene el diseno responsive, logo, animaciones y estilos.
- **Credenciales de conexion:** se encuentran en `.env.example` y se cargan en `server.js` mediante `dotenv`. En SQLite local la ruta de la base es `data/solarte.db`.

## Thunder Client

- Consultar recursos: `GET http://localhost:3001/api/products`
- Consultar uno: `GET http://localhost:3001/api/products/1`
- Crear recurso: `POST http://localhost:3001/api/products` con JSON:

```json
{
  "name": "Leche deslactosada familiar",
  "brand": "Colanta",
  "units": 80,
  "warehouse": "Fríos C-02",
  "category": "Leche"
}
```

- Editar: `PUT http://localhost:3001/api/products/1`
- Eliminar: `DELETE http://localhost:3001/api/products/1`

Luego de crear o editar desde Thunder Client, recarga el aplicativo para verificar el recurso. Desde el aplicativo también se puede crear, editar y eliminar directamente.
