# Guía para consumir la API del proyecto Punto Cultura

## Base URL de la API

```
http://127.0.0.1:8000/api/
```

> Esta URL puede cambiar cuando se despliegue en producción, pero la estructura de los endpoints será la misma.

---

## Endpoints disponibles

### Centros Culturales

| Método | Endpoint           | Descripción                               |
|--------|--------------------|-------------------------------------------|
| GET    | `/centros/`        | Lista todos los centros culturales públicos |
| GET    | `/centros/<id>/`   | Obtiene detalle de un centro cultural por ID |
| POST   | `/centros/`        | Crea un nuevo centro cultural             |
| PATCH  | `/centros/<id>/`   | Actualiza parcialmente un centro cultural |
| DELETE | `/centros/<id>/`   | Elimina un centro cultural                 |

#### Formato para crear/editar un centro cultural (POST/PATCH)

```json
{
  "nombre": "Nombre del Centro",
  "descripcion": "Descripción detallada",
  "imagen": "archivo imagen (en multipart/form-data)",
  "direccion": "Dirección visible del centro",
  "latitud": 12.345678,
  "longitud": -98.765432
}
```

---

### Eventos

| Método | Endpoint           | Descripción                             |
|--------|--------------------|---------------------------------------|
| GET    | `/eventos/`        | Lista todos los eventos                |
| GET    | `/eventos/<id>/`   | Obtiene detalle de un evento por ID   |
| POST   | `/eventos/`        | Crea un nuevo evento                   |
| PATCH  | `/eventos/<id>/`   | Actualiza parcialmente un evento      |
| DELETE | `/eventos/<id>/`   | Elimina un evento                      |

#### Formato para crear/editar un evento (POST/PATCH)

```json
{
  "titulo": "Nombre del Evento",
  "descripcion": "Descripción completa",
  "imagen": "archivo imagen (multipart/form-data)",
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "YYYY-MM-DD",
  "categoria": <ID de la categoría>,
  "centro_cultural": <ID del centro cultural>
}
```

---

### Categorías

| Método | Endpoint        | Descripción                   |
|--------|-----------------|-------------------------------|
| GET    | `/categorias/`  | Lista todas las categorías     |
| POST   | `/categorias/`  | Crea una nueva categoría       |

#### Formato para crear categoría (POST)

```json
{
  "nombre": "Nombre de la Categoría"
}
```

---

## Cómo consumir la API desde el frontend

Ejemplo usando **fetch**:

```javascript
fetch('http://127.0.0.1:8000/api/eventos/')
  .then(response => response.json())
  .then(data => {
    console.log(data); // Aquí recibís el listado de eventos
  })
  .catch(error => console.error('Error:', error));
```

Ejemplo usando **axios**:

```javascript
import axios from 'axios';

axios.get('http://127.0.0.1:8000/api/centros/')
  .then(response => {
    console.log(response.data); // Listado de centros culturales
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

---

## Nota sobre autenticación

Por ahora **no se requiere autenticación**, todos los endpoints son accesibles para lectura y escritura.

---


