# 📘 Guía de Endpoints de la API REST - Centros Culturales y Eventos

Esta guía documenta los endpoints de la API REST para gestionar **Centros Culturales**, **Eventos** y **Categorías**, basada en Django REST Framework.

---

## 📍 1. Centros Culturales

**Endpoint base:** `/api/centros/`

| Método  | Ruta                       | Descripción                             |
|---------|----------------------------|-----------------------------------------|
| GET     | `/api/centros/`           | Listar todos los centros culturales     |
| GET     | `/api/centros/<id>/`      | Obtener un centro cultural por ID       |
| POST    | `/api/centros/`           | Crear un nuevo centro cultural          |
| PUT     | `/api/centros/<id>/`      | Reemplazar un centro cultural           |
| PATCH   | `/api/centros/<id>/`      | Actualizar parcialmente un centro       |
| DELETE  | `/api/centros/<id>/`      | Eliminar un centro cultural             |

### 📝 Campos esperados
```json
{
  "nombre": "string",
  "descripcion": "string",
  "imagen": "file",
  "ubicacion_lat": "decimal",
  "ubicacion_lon": "decimal",
  "direccion": "string",
  "publicado": true,
  "horario_apertura": "HH:MM",
  "horario_cierre": "HH:MM",
  "creado_por": user_id
}
```

---

## 📅 2. Eventos

**Endpoint base:** `/api/eventos/`

| Método  | Ruta                        | Descripción                             |
|---------|-----------------------------|-----------------------------------------|
| GET     | `/api/eventos/`            | Listar todos los eventos publicados     |
| GET     | `/api/eventos/<id>/`       | Obtener un evento por ID                |
| POST    | `/api/eventos/`            | Crear un nuevo evento                   |
| PUT     | `/api/eventos/<id>/`       | Reemplazar un evento                    |
| PATCH   | `/api/eventos/<id>/`       | Actualizar parcialmente un evento       |
| DELETE  | `/api/eventos/<id>/`       | Eliminar un evento                      |

### 📝 Campos esperados
```json
{
  "titulo": "string",
  "descripcion": "string",
  "imagen": "file",
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "YYYY-MM-DD",
  "categoria": categoria_id,
  "centro_cultural": centro_id,
  "publicado": true,
  "horario_apertura": "HH:MM",
  "horario_cierre": "HH:MM",
  "creado_por": user_id
}
```

---

## 🏷️ 3. Categorías

**Endpoint base:** `/api/categorias/`

| Método  | Ruta                         | Descripción                             |
|---------|------------------------------|-----------------------------------------|
| GET     | `/api/categorias/`          | Listar todas las categorías             |
| GET     | `/api/categorias/<id>/`     | Obtener una categoría por ID            |
| POST    | `/api/categorias/`          | Crear una nueva categoría               |
| PUT     | `/api/categorias/<id>/`     | Reemplazar una categoría                |
| PATCH   | `/api/categorias/<id>/`     | Actualizar parcialmente una categoría   |
| DELETE  | `/api/categorias/<id>/`     | Eliminar una categoría                  |

### 📝 Campos esperados
```json
{
  "nombre": "string",
  "color": "#FFFFFF"
}
```

---

## 🔍 Filtros (opcional)

Estos filtros pueden aplicarse en las peticiones `GET` a `/api/eventos/`:

- `?categoria=<id>`
- `?centro_cultural=<id>`

---

## 🔐 Autenticación

La creación, actualización o eliminación requiere autenticación, dependiendo de los permisos definidos (ej: `IsAuthenticated`, `IsAdminUser`).

---
