# PuntoCultura

**PuntoCultura** es una plataforma digital para la **Subsecretaría de Cultura de Santiago del Estero** que permite gestionar, publicar y explorar eventos culturales en todo el territorio provincial. Este proyecto representa una refuncionalización del sitio institucional, combinando facilidad de uso, gestión segura de contenidos y una interfaz moderna basada en tecnologías abiertas.

---

## 📚 Tabla de contenidos

- [✨ Características principales](#-características-principales)
- [🧱 Tecnologías utilizadas](#-tecnologías-utilizadas)
- [🔌 Conexión frontend-backend](#-conexión-frontend-backend)
- [🔐 Características de seguridad](#-características-de-seguridad)
- [⚙️ Instalación](#️-instalación)
- [🧪 Guía de población y permisos](#-guía-de-población-y-permisos)
- [📡 Endpoints de la API REST](#-endpoints-de-la-api-rest)
- [🌐 Integraciones y extras](#-integraciones-y-extras)

---

## ✨ Características principales

- **Interfaz pública:** Diseño totalmente responsive con tarjetas y vistas públicas accesibles y modernas.
- **Gestión de eventos culturales:** Creación, edición, publicación, borrador y visualización de eventos por parte de administradores y editores.
- **Panel administrativo avanzado:** Interfaz segura con autenticación, control de acceso basado en roles, filtros, carga y previsualización de imágenes, gestión de usuarios y roles.
- **Calendario de eventos:** Visualización dinámica con FullCalendar.
- **Búsqueda y filtros:** Sistema robusto para filtrar por texto, categoría, año, centro, fecha, estado de publicación y combinaciones.
- **Paginación:** Navegación por páginas en listados de eventos.
- **Carrusel 3D:** Destacados de eventos en la página principal.
- **Gestión de medios:** Carga y visualización de imágenes asociadas a eventos y centros.
- **Modales interactivos:** Detalle de eventos y centros en modales con imágenes y enlaces a mapas.
- **Formulario de contacto:** Sección de contacto para consultas, con datos de contacto y redes sociales.
- **Integración con Facebook:** Última publicación embebida en la página principal.
- **Enlaces externos:** Acceso a DNI Cultural, Patrimonio Cultural, Biblioteca Digital, redes sociales y Google Maps.
- **Autenticación JWT segura** y middleware anti-inyección SQL.
- **Soporte de borradores:** Eventos y centros pueden estar en estado "borrador" (no publicados).

---

## 🧱 Tecnologías utilizadas

### Frontend

- **HTML, CSS, JS** tradicional (multi-página)
- **FullCalendar:** Calendario de eventos
- **TailwindCSS:** Estilos utilitarios en panel de administración
- **Google Fonts:** Montserrat, Host Grotesk, Ubuntu
- **API Fetch + AJAX:** Para interacción con backend
- **JWT + localStorage:** Autenticación y control de acceso
- **Flatpickr:** Selector de fechas en panel admin
- **Choices.js:** Selects avanzados para filtros múltiples

### Backend

- **Django 5.2.1** + Django REST Framework
- **SimpleJWT:** Autenticación basada en JWT
- **django-cors-headers:** Soporte para CORS
- **SQLite** (por defecto), fácilmente sustituible por PostgreSQL/MySQL
- **Middleware personalizado:** Detección de inyección SQL
- **Sistema de roles:** Grupos y permisos usando el auth system de Django
- **Comandos de gestión:** `crear_roles`, `poblar_datos`, `poblar_datos_simple`

---

## 🔌 Conexión frontend-backend

### Endpoints RESTful (prefijo `/api/`):

- `/api/eventos/` — CRUD para eventos (con filtros avanzados)
- `/api/centros/` — CRUD para centros culturales (con filtros avanzados)
- `/api/categorias/` — CRUD para categorías
- `/api/users/` — Gestión de usuarios y roles
- `/api/token/` — Autenticación JWT
- `/api/create-editor/` — Crear usuarios editores (administradores)

### Flujo de datos típico:

1. El usuario visita la página de eventos → JS obtiene `/api/eventos/` → Renderiza eventos.
2. Un editor inicia sesión en `/frontend/pages/login.html` → Obtiene un JWT desde `/api/token/`.
3. JS usa el JWT para interactuar con endpoints protegidos (crear/editar/borrar contenido).
4. El panel admin permite gestión avanzada de eventos, centros y usuarios, con filtros, modales y carga de imágenes.

---

## 🔐 Características de seguridad

- **Autenticación JWT** segura: Tokens almacenados en `localStorage` y enviados en headers, con soporte para auto refrescar el token.
- **Middleware contra inyección SQL**: Bloquea patrones sospechosos en las solicitudes.
- **Detección de intentos de logueo**: Se detectan todos los intentos de inicio de sesión con usuario ingresado, IP, estado y timestamp
- **Acceso basado en roles**: solo usuarios en los grupos correspondientes pueden crear, editar o eliminar.
- **Soporte de borradores:** Eventos y centros pueden estar ocultos al público hasta ser publicados.

---

## ⚙️ Instalación

> Requisitos: tener **Python 3.11+**, **git** y **pip** instalados.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/puntocultura.git
cd puntocultura
```

### 2. Crear un entorno virtual

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

## 🧪 Guía de población y permisos

Este proyecto permite poblar una base de datos Django con información cultural ficticia, incluyendo **categorías**, **centros culturales** y **eventos**.
También permite crear y asignar el rol de **Editor** a un usuario, y crear y asignar el rol de **Administrador** a otro usuario para poder testear rápidamente el funcionamiento del sitio en su totalidad. A continuación, se explica cómo ejecutar correctamente los scripts de gestión disponibles.

### 1. Migrar base de datos (si está vacía)

```bash
python manage.py migrate
```

### 2. Crear grupo de editores

```bash
python manage.py crear_roles
```

### 3. Poblar datos culturales ficticios (con imágenes de Unsplash)

```bash
python manage.py poblar_datos --unsplash-key TU_CLAVE_UNSPLASH
```
> Puedes obtener una clave de acceso gratuita creando una cuenta en [https://unsplash.com/developers](https://unsplash.com/developers).

Credenciales generadas:

- Usuario: `editor`
- Contraseña: `editor123`


### 4. Crear superusuario administrador

```bash
python manage.py createsuperuser
```

### 📁 Limpieza manual (opcional)

Borrar las carpetas de medios si se reinicia la base de datos:

```
/backend/media/eventos
/backend/media/centros
```

---

## 📡 Endpoints de la API REST

### 📍 Centros Culturales (`/api/centros/`)

| Método  | Ruta                | Descripción                             |
|---------|---------------------|-----------------------------------------|
| GET     | `/`                 | Lista todos los centros culturales      |
| GET     | `/<id>/`            | Detalle de centro por ID                |
| POST    | `/`                 | Crear nuevo centro                      |
| PUT     | `/<id>/`            | Reemplazar centro                       |
| PATCH   | `/<id>/`            | Modificar parcialmente                  |
| DELETE  | `/<id>/`            | Eliminar centro                         |

**Campos esperados**:
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

### 📅 Eventos (`/api/eventos/`)

| Método  | Ruta                | Descripción                             |
|---------|---------------------|-----------------------------------------|
| GET     | `/`                 | Lista todos los eventos publicados      |
| GET     | `/<id>/`            | Detalle de evento                       |
| POST    | `/`                 | Crear nuevo evento                      |
| PUT     | `/<id>/`            | Reemplazar evento                       |
| PATCH   | `/<id>/`            | Actualizar parcialmente evento          |
| DELETE  | `/<id>/`            | Eliminar evento                         |

**Campos esperados**:
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

**Filtros opcionales**:

- `?categoria=<id>`
- `?centro_cultural=<id>`
- `?publicado=true|false`
- `?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD`

---

### 🏷️ Categorías (`/api/categorias/`)

| Método  | Ruta                | Descripción                             |
|---------|---------------------|-----------------------------------------|
| GET     | `/`                 | Lista todas las categorías              |
| GET     | `/<id>/`            | Detalle de categoría                    |
| POST    | `/`                 | Crear categoría                         |
| PUT     | `/<id>/`            | Reemplazar categoría                    |
| PATCH   | `/<id>/`            | Actualizar parcialmente                 |
| DELETE  | `/<id>/`            | Eliminar categoría                      |

**Campos esperados**:
```json
{
  "nombre": "string",
  "color": "#FFFFFF"
}
```

> ⚠️ Las operaciones POST, PUT, DELETE requieren un token JWT válido.

---

## 🌐 Integraciones y extras

- **Formulario de contacto:** Página de contacto con formulario y datos institucionales.
- **Redes sociales:** Enlaces a Instagram y Facebook oficiales.
- **Enlaces externos:** Acceso directo a DNI Cultural, Patrimonio Cultural, Biblioteca Digital.
- **Carrusel 3D:** Eventos destacados en la home.
- **Facebook embed:** Última publicación de Facebook embebida en la página principal.
- **Enlaces a Google Maps:** Desde los modales de centros culturales.
- **Footer institucional:** Información de contacto y redes en todas las páginas.

---