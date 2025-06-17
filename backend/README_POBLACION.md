# Población de Datos - Subsecretaría de Cultura de Santiago del Estero

Este directorio contiene comandos de Django para poblar automáticamente la base de datos con datos realistas de cultura para Santiago del Estero.

## Comandos Disponibles

### 1. `poblar_datos` (Con imágenes de Unsplash)

Pobla la base de datos con categorías, centros culturales y eventos, incluyendo imágenes descargadas automáticamente de Unsplash.

**Uso:**
```bash
python manage.py poblar_datos --unsplash-key TU_ACCESS_KEY_AQUI
```

**Ejemplo con tu clave:**
```bash
python manage.py poblar_datos --unsplash-key c6xlcimCPj_2FP7tHGj9z-0AGmtMzyogefZeNZfp6uY
```

### 2. `poblar_datos_simple` (Sin imágenes)

Versión simplificada que crea todos los datos sin descargar imágenes de Unsplash.

**Uso:**
```bash
python manage.py poblar_datos_simple
```

## Datos Generados

### Categorías (10)
- Música Folklórica
- Teatro
- Danza Tradicional
- Artes Visuales
- Literatura
- Cine y Audiovisual
- Artesanías
- Festivales Culturales
- Talleres Educativos
- Exposiciones

### Centros Culturales (12)
1. **Centro Cultural del Bicentenario** - Principal espacio cultural
2. **Casa de la Cultura** - Histórica casa colonial
3. **Teatro 25 de Mayo** - Teatro histórico
4. **Museo de Bellas Artes** - Museo de arte argentino
5. **Centro Cultural Municipal** - Espacio municipal
6. **Casa del Artesano** - Centro de artesanías
7. **Auditorio Municipal** - Auditorio moderno
8. **Galería de Arte Contemporáneo** - Galería moderna
9. **Centro de Danzas Folklóricas** - Especializado en danzas
10. **Biblioteca Popular** - Biblioteca pública
11. **Centro de Música Popular** - Centro especializado en música (BORRADOR)
12. **Espacio de Arte Digital** - Centro de arte digital (BORRADOR)

### Eventos (40) - Distribución Temporal

#### 📅 **Eventos Pasados (2020-2023) - 10 eventos**
- Festival de Folklore "Santiago Canta" 2020
- Obra de Teatro "Historias de Santiago" 2021
- Exposición "Arte Contemporáneo Santiagueño" 2021
- Taller de Danzas Folklóricas 2022
- Presentación del Libro "Santiago del Estero: Historia y Cultura" 2022
- Ciclo de Cine Argentino 2022
- Feria de Artesanías Tradicionales 2023
- Concierto de Música Clásica 2023
- Taller de Pintura para Niños 2023
- Exposición Fotográfica "Santiago en Imágenes" 2023

#### 📅 **Eventos Recientes (2024-2025) - 2 eventos**
- Recital de Rock Nacional - Diciembre 2024
- Obra de Teatro Infantil "El Bosque Mágico" - Enero 2025

#### 📅 **Eventos Futuros (próximos meses) - 18 eventos**
- Clase Magistral de Danza Contemporánea
- Encuentro de Poetas Santiagueños
- Festival de Cortometrajes
- Taller de Cerámica Tradicional
- Concierto de Jazz y Blues
- Obra de Teatro "La Casa de Bernarda Alba"
- Exposición de Esculturas
- Taller de Danzas Circulares
- Presentación de Revista Cultural
- Ciclo de Documentales Argentinos
- Feria de Arte y Diseño
- Concierto de Música Andina
- Obra de Teatro "El Principito"
- Taller de Pintura al Óleo
- Exposición "Retratos de Santiago"
- Festival de Folklore 2025
- Semana de las Artes 2025

#### 📝 **Eventos No Publicados (Borradores) - 10 eventos**
- Festival de Jazz Internacional
- Exposición de Arte Digital
- Taller de Composición Musical Digital
- Obra de Teatro Experimental
- Conferencia sobre Arte y Tecnología
- Recital de Música Electrónica
- Taller de Programación Creativa
- Festival de Cine Digital
- Concierto de Música Clásica Contemporánea
- Exposición de Fotografía Digital

## Características

- **Datos realistas**: Todos los datos están basados en la cultura y geografía de Santiago del Estero
- **Ubicaciones precisas**: Coordenadas GPS reales de Santiago del Estero
- **Distribución temporal completa**: Eventos pasados, recientes y futuros para demostrar filtros
- **Usuario editor**: Se crea automáticamente un usuario editor (id=3) si no existe
- **Imágenes automáticas**: Descarga imágenes relevantes de Unsplash (solo en versión completa)
- **Prevención de duplicados**: Usa `get_or_create` para evitar datos duplicados
- **Funcionalidades de filtrado**: Permite probar búsquedas por fecha, categoría, centro cultural, etc.

## Funcionalidades de Filtrado Demostrables

Con esta distribución de eventos podrás probar:

### 🔍 **Filtros por Fecha**
- **Eventos pasados**: Ver eventos históricos de 2020-2023
- **Eventos recientes**: Eventos de los últimos meses
- **Eventos futuros**: Próximos eventos programados
- **Rango de fechas**: Filtrar por períodos específicos

### 🏷️ **Filtros por Categoría**
- Música Folklórica (6 eventos)
- Teatro (5 eventos)
- Danza Tradicional (3 eventos)
- Artes Visuales (3 eventos)
- Literatura (3 eventos)
- Cine y Audiovisual (3 eventos)
- Artesanías (3 eventos)
- Festivales Culturales (2 eventos)
- Talleres Educativos (2 eventos)
- Exposiciones (2 eventos)

### 🏛️ **Filtros por Centro Cultural**
- Centro Cultural del Bicentenario (4 eventos)
- Teatro 25 de Mayo (5 eventos)
- Museo de Bellas Artes (3 eventos)
- Centro Cultural Municipal (4 eventos)
- Casa del Artesano (2 eventos)
- Auditorio Municipal (3 eventos)
- Galería de Arte Contemporáneo (2 eventos)
- Centro de Danzas Folklóricas (2 eventos)
- Biblioteca Popular (2 eventos)
- Casa de la Cultura (2 eventos)

### 📊 **Búsquedas Combinadas**
- Eventos de música folklórica en 2023
- Talleres en el Centro Cultural Municipal
- Exposiciones futuras
- Eventos pasados del Teatro 25 de Mayo

### 📝 **Funcionalidades de Borradores**
- **Contenido no publicado**: 2 centros culturales y 10 eventos con `publicado=False`
- **Filtros de publicación**: Mostrar/ocultar contenido según estado de publicación
- **Gestión de borradores**: Contenido en preparación que no aparece públicamente
- **Optimización de recursos**: Los borradores no descargan imágenes de Unsplash
- **Centros en construcción**: Centros culturales futuros que aún no están operativos

## Requisitos

Para usar la versión con imágenes:
- Clave de acceso de Unsplash
- Librería `requests` (ya incluida en requirements.txt)

Para usar la versión simple:
- Solo Django y las dependencias básicas

## Instalación de Dependencias

Si usas la versión con imágenes, asegúrate de tener instaladas las dependencias:

```bash
pip install -r requirements.txt
```

## Notas Importantes

1. **Usuario Editor**: El comando creará automáticamente un usuario editor con id=3 si no existe
2. **Imágenes**: Las imágenes se guardan en el directorio `media/` configurado en Django
3. **Fechas**: Los eventos incluyen fechas pasadas, recientes y futuras para demostrar filtros
4. **Publicación**: Todos los elementos se crean como publicados por defecto
5. **Coordenadas**: Las ubicaciones corresponden a puntos reales en Santiago del Estero

## Ejecución

1. Navega al directorio `backend/`
2. Activa tu entorno virtual si es necesario
3. Ejecuta uno de los comandos según tus necesidades

**Ejemplo completo:**
```bash
cd backend/
python manage.py poblar_datos --unsplash-key c6xlcimCPj_2FP7tHGj9z-0AGmtMzyogefZeNZfp6uY
```

## Resultado Esperado

Al finalizar la ejecución, verás un resumen como:
```
Población completada exitosamente:
- 10 categorías creadas
- 12 centros culturales creados (10 publicados + 2 borradores)
- 40 eventos creados (30 publicados + 10 borradores)
```

Los datos estarán disponibles inmediatamente en tu aplicación Django y podrás verlos a través del admin o las APIs correspondientes.

**Nota importante**: Los centros y eventos marcados como borradores (`publicado=False`) no descargan imágenes de Unsplash para optimizar el uso de la API.

## Casos de Uso para Demostración

### 🎯 **Escenarios de Prueba**

1. **"Mostrar todos los eventos de 2023"**
   - Resultado: 3 eventos (Feria de Artesanías, Concierto de Música Clásica, Taller de Pintura para Niños)

2. **"Eventos futuros de música folklórica"**
   - Resultado: 2 eventos (Concierto de Jazz y Blues, Concierto de Música Andina)

3. **"Talleres en el Centro Cultural Municipal"**
   - Resultado: 2 eventos (Taller de Pintura para Niños 2023, Taller de Danzas Circulares)

4. **"Exposiciones pasadas"**
   - Resultado: 2 eventos (Arte Contemporáneo 2021, Santiago en Imágenes 2023)

5. **"Eventos del Teatro 25 de Mayo en 2025"**
   - Resultado: 1 evento (El Bosque Mágico - Enero 2025)

6. **"Mostrar solo eventos publicados"**
   - Resultado: 30 eventos (excluye los 10 borradores)

7. **"Mostrar todos los eventos (incluyendo borradores)"**
   - Resultado: 40 eventos (incluye los 10 borradores)

8. **"Centros culturales publicados"**
   - Resultado: 10 centros (excluye los 2 borradores)

9. **"Eventos del Centro de Música Popular"**
   - Resultado: 4 eventos (todos son borradores, no aparecen en búsquedas públicas)

10. **"Eventos de arte digital"**
    - Resultado: 3 eventos (todos son borradores del Espacio de Arte Digital) 