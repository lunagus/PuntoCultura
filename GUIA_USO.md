# Guía de Población y Asignación de Permisos:

Este proyecto permite poblar una base de datos Django con información cultural ficticia, incluyendo **categorías**, **centros culturales** y **eventos**.
También permite crear y asignar el rol de **Editor** a un usuario, y crear y asignar el rol de **Administrador** a otro usuario para poder testear rápidamente el funcionamiento del sitio en su totalidad. A continuación, se explica cómo ejecutar correctamente los scripts de gestión disponibles.

---

## Partiendo de una base de datos vacía o inexistente:


## 1. Migraciones de la base de datos

Antes de poblar cualquier dato, asegúrate de tener la base de datos correctamente migrada.

```bash
cd backend/
python manage.py migrate
```

---

## 2. Crear migraciones (opcional)

Solo si has hecho cambios recientes en los modelos.

```bash
python manage.py makemigrations
```

---

## 3. Crear grupo de usuarios "Editor"

Este comando crea el grupo `Editor` con permisos CRUD (crear, leer, actualizar, eliminar) sobre los modelos `Evento`, `CentroCultural` y `Categoria`.

```bash
python manage.py crear_roles
```

Si el grupo ya existe, el script lo notificará y actualizará sus permisos si es necesario.

---

## 4. Crear usuario editor y poblar la base de datos con datos culturales

Este script crea un usuario editor e inserta automáticamente categorías, centros culturales y eventos (pasados, actuales y futuros). Además, puede descargar imágenes desde **Unsplash** si proporcionas una clave de acceso válida.

```bash
python manage.py poblar_datos --unsplash-key TU_CLAVE_UNSPLASH
```

> Puedes obtener una clave de acceso gratuita creando una cuenta en [https://unsplash.com/developers](https://unsplash.com/developers).

> Las credenciales de este usuario creado son: 

- usuario = editor
- contraseña = editor123

email = "editor@cultura.santiago.gob.ar"
nombre="Editor"
apellido="Cultural"


### Argumentos opcionales

- `--solo-eventos`: Solo crea eventos, sin modificar categorías ni centros.

```bash
python manage.py poblar_datos --solo-eventos --unsplash-key TU_CLAVE
```

El script intentará:
- Crear un usuario `editor` (si no existe).
- Poblar datos usando ese usuario como creador.
- Descargar imágenes automáticamente (solo si la clave de Unsplash es válida y los objetos están publicados).
- Omitir registros ya existentes.

---

## 5. Crear un superusuario para administración

Para acceder al panel de administración de Django, crea un superusuario:

```bash
python manage.py createsuperuser
```

---

## OPCIONAL:

Si por alguna razón necesitas borrar la base de datos y volver a repoblarla, debes también borrar las imágenes de:

\PuntoCultura\backend\media\eventos

\PuntoCultura\backend\media\centros

---