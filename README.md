# Proyecto PuntoCultura

## Requisitos previos

- Tener una cuenta de GitHub
- Tener instalado Git y Python en tu computadora

Puedes descargar Git desde: https://git-scm.com

## Configurar Git (solo la primera vez)

Abre la terminal (CMD o PowerShell en Windows) y ejecuta los siguientes comandos, reemplazando con tu información:

```bash
git config --global user.name "TuNombreDeUsuario"
git config --global user.email "tu@email.com"
```

## Clonar el repositorio

```bash
git clone https://github.com/lunagus/PuntoCultura
cd PuntoCultura/backend
```

## Crear y activar entorno virtual

Asegúrate de tener Python instalado. Luego, escribe en la terminal:

```bash
python -m venv venv
venv\Scripts\activate
```

## Instalar dependencias

Con el entorno activado, ejecuta:

```bash
pip install -r requirements.txt
```

## Ejecutar el servidor

```bash
python manage.py runserver
```

Si todo funciona correctamente, el servidor se iniciará en:

http://127.0.0.1:8000

## Cómo abrir una terminal en la carpeta backend (Windows)

1. Abre el explorador de archivos y navega a la carpeta `backend`.
2. Mantén presionada la tecla Shift y haz clic derecho en un espacio vacío.
3. Selecciona "Abrir ventana de PowerShell aquí" o "Abrir ventana de comandos aquí".

## Script opcional para iniciar el servidor (Windows)

Puedes crear un archivo llamado `run_server.bat` dentro de la carpeta `backend` con el siguiente contenido:

```bat
@echo off
call venv\Scripts\activate
python manage.py runserver
```

Luego, abre la terminal en la carpeta `backend` y ejecuta:

```bash
run_server.bat
```

## Comandos básicos de Git para colaborar

### Ver el estado de los archivos

```bash
git status
```

Muestra qué archivos han cambiado o no están guardados aún en el repositorio.

### Agregar archivos al área de preparación

```bash
git add nombre-del-archivo
```

O para agregar todos los archivos modificados:

```bash
git add .
```

### Guardar los cambios con un mensaje

```bash
git commit -m "Mensaje que explica qué hiciste"
```

Por ejemplo:

```bash
git commit -m "Agrega vista de contacto y actualiza estilos"
```

### Enviar tus cambios al repositorio en GitHub

```bash
git push
```

Esto sube tus commits a la rama actual en GitHub (por defecto, `main` o `master`).

### Traer cambios del repositorio (antes de empezar a trabajar)

```bash
git pull
```

Esto actualiza tu copia local con los últimos cambios del equipo.

## Buenas prácticas

- Siempre haz `git pull` antes de empezar a trabajar.
- Haz `git add`, `git commit` y `git push` cuando termines una tarea y estás seguro de que todo funciona.
- Usa mensajes de commit claros y específicos.


## Notas sobre requirements.txt

Si necesitas instalar nuevas librerías de Python, usa el entorno virtual activado y ejecuta:

```bash
pip install nombre-del-paquete
```

Después, actualiza el archivo de dependencias para que el resto del equipo tenga lo mismo:

```bash
pip freeze > requirements.txt
```

No olvides hacer commit y push del `requirements.txt` actualizado.

## Sobre el archivo .gitignore

Este archivo está configurado para ignorar elementos que no deben subirse al repositorio, incluyendo:

- Archivos temporales de Python: `*.pyc`, `__pycache__/`
- Entornos virtuales: `backend/env/`, `backend/venv/`
- Dependencias de Node.js: `frontend/node_modules/`
- Archivos de configuración local: `*.env`, `*.log`, `*.sqlite3`
- Archivos generados por Django: `backend/media/`
- Archivos de caché y temporales de editores: `.vscode/`, `.DS_Store`, `*.swp`
