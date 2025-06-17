import os
import requests
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import datetime, timedelta
import random
from api.models import Categoria, CentroCultural, Evento


class Command(BaseCommand):
    help = "Pobla la base de datos con datos de cultura para Santiago del Estero"

    def add_arguments(self, parser):
        parser.add_argument(
            "--unsplash-key",
            type=str,
            help="Unsplash access key para descargar imágenes",
        )

    def limpiar_nombre_archivo(self, titulo):
        """Limpia el título para usarlo como nombre de archivo"""
        # Reemplazar caracteres problemáticos
        nombre_limpio = titulo.replace(" ", "_")
        nombre_limpio = nombre_limpio.replace('"', "")
        nombre_limpio = nombre_limpio.replace("'", "")
        nombre_limpio = nombre_limpio.replace(":", "")
        nombre_limpio = nombre_limpio.replace("?", "")
        nombre_limpio = nombre_limpio.replace("!", "")
        nombre_limpio = nombre_limpio.replace(".", "")
        nombre_limpio = nombre_limpio.replace(",", "")
        return nombre_limpio.lower()

    def handle(self, *args, **options):
        self.stdout.write("Iniciando población de datos...")

        # Obtener el usuario editor
        try:
            editor = User.objects.get(id=3)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(
                    "Usuario con id=3 no encontrado. Creando usuario editor..."
                )
            )
            editor = User.objects.create_user(
                username="editor",
                email="editor@cultura.santiago.gob.ar",
                password="editor123",
                first_name="Editor",
                last_name="Cultural",
            )
            editor.id = 3
            editor.save()

        # Crear categorías
        categorias_data = [
            {"nombre": "Música"},
            {"nombre": "Literatura"},
            {"nombre": "Artesanías"},
            {"nombre": "Cine y Audiovisual"},
            {"nombre": "Plástica"},
            {"nombre": "Religiosidad"},
            {"nombre": "Teatro"},
            {"nombre": "Mitos y Leyendas"},
            {"nombre": "Lengua Quichua"},
            {"nombre": "Gastronomía"},
            {"nombre": "Identidad"},
        ]

        categorias = {}
        for cat_data in categorias_data:
            categoria, created = Categoria.objects.get_or_create(
                nombre=cat_data["nombre"]
            )
            categorias[cat_data["nombre"]] = categoria
            if created:
                self.stdout.write(f"Categoría creada: {categoria.nombre}")

        # Crear centros culturales
        centros_data = [
            {
                "nombre": "Centro Cultural del Bicentenario",
                "descripcion": "El Centro Cultural del Bicentenario es el principal espacio cultural de Santiago del Estero, ubicado en el corazón de la ciudad. Cuenta con salas de teatro, galerías de arte, auditorio y espacios para talleres culturales.",
                "ubicacion_lat": -27.7951,
                "ubicacion_lon": -64.2615,
                "direccion": "Av. Libertad 439, Santiago del Estero",
                "imagen_keyword": "modern cultural center architecture argentina",
            },
            {
                "nombre": "Casa de la Cultura",
                "descripcion": "Histórica casa colonial que alberga exposiciones de arte local, talleres de artesanías y presentaciones de música folklórica. Un espacio íntimo para la expresión cultural santiagueña.",
                "ubicacion_lat": -27.7965,
                "ubicacion_lon": -64.2630,
                "direccion": "Belgrano 132, Santiago del Estero",
                "imagen_keyword": "colonial house art exhibition",
            },
            {
                "nombre": "Teatro 25 de Mayo",
                "descripcion": "Teatro histórico de la ciudad con capacidad para 800 espectadores. Sede de importantes obras teatrales, conciertos y eventos culturales de la provincia.",
                "ubicacion_lat": -27.7940,
                "ubicacion_lon": -64.2620,
                "direccion": "25 de Mayo 350, Santiago del Estero",
                "imagen_keyword": "historic theater stage audience",
            },
            {
                "nombre": "Museo de Bellas Artes",
                "descripcion": "Museo que alberga una importante colección de arte argentino y latinoamericano, con énfasis en artistas santiagueños. Espacio para exposiciones temporales y talleres de arte.",
                "ubicacion_lat": -27.7970,
                "ubicacion_lon": -64.2640,
                "direccion": "Av. Sarmiento 156, Santiago del Estero",
                "imagen_keyword": "art museum gallery paintings",
            },
            {
                "nombre": "Centro Cultural Municipal",
                "descripcion": "Espacio municipal dedicado a la promoción de artistas locales, con salas de exposición, auditorio y talleres para todas las edades.",
                "ubicacion_lat": -27.7930,
                "ubicacion_lon": -64.2650,
                "direccion": "Independencia 245, Santiago del Estero",
                "imagen_keyword": "community arts center workshop",
            },
            {
                "nombre": "Casa del Artesano",
                "descripcion": "Centro dedicado a la preservación y promoción de las artesanías tradicionales santiagueñas. Talleres de cerámica, tejido, cestería y otros oficios artesanales.",
                "ubicacion_lat": -27.7955,
                "ubicacion_lon": -64.2600,
                "direccion": "San Martín 89, Santiago del Estero",
                "imagen_keyword": "artisan crafts pottery weaving",
            },
            {
                "nombre": "Auditorio Municipal",
                "descripcion": "Moderno auditorio con capacidad para 500 personas, equipado con tecnología de última generación para conciertos, conferencias y eventos culturales.",
                "ubicacion_lat": -27.7920,
                "ubicacion_lon": -64.2660,
                "direccion": "Av. Moreno 234, Santiago del Estero",
                "imagen_keyword": "modern auditorium concert hall",
            },
            {
                "nombre": "Galería de Arte Contemporáneo",
                "descripcion": "Espacio dedicado al arte contemporáneo con exposiciones de artistas emergentes y consagrados. Galería moderna con iluminación profesional.",
                "ubicacion_lat": -27.7960,
                "ubicacion_lon": -64.2590,
                "direccion": "Rivadavia 178, Santiago del Estero",
                "imagen_keyword": "contemporary art gallery exhibition",
            },
            {
                "nombre": "Centro de Danzas Folklóricas",
                "descripcion": "Centro especializado en danzas folklóricas argentinas, especialmente las danzas santiagueñas. Salas de ensayo, vestuarios y auditorio para presentaciones.",
                "ubicacion_lat": -27.7945,
                "ubicacion_lon": -64.2670,
                "direccion": "Mitre 456, Santiago del Estero",
                "imagen_keyword": "folk dance studio rehearsal",
            },
            {
                "nombre": "Biblioteca Popular",
                "descripcion": "Biblioteca pública con amplia colección de literatura regional y nacional. Espacio para clubes de lectura, presentaciones de libros y actividades literarias.",
                "ubicacion_lat": -27.7975,
                "ubicacion_lon": -64.2580,
                "direccion": "Av. Colón 321, Santiago del Estero",
                "imagen_keyword": "public library reading books",
            },
            # CENTROS CULTURALES NO PUBLICADOS (BORRADORES)
            {
                "nombre": "Centro de Música Popular",
                "descripcion": "Nuevo centro especializado en música popular argentina y latinoamericana. Contará con salas de ensayo, estudio de grabación y auditorio para 300 personas. Actualmente en construcción.",
                "ubicacion_lat": -27.7935,
                "ubicacion_lon": -64.2680,
                "direccion": "Av. Roca 567, Santiago del Estero",
                "imagen_keyword": "music center",
                "publicado": False,
            },
            {
                "nombre": "Espacio de Arte Digital",
                "descripcion": "Centro innovador dedicado al arte digital, multimedia y nuevas tecnologías. Incluirá laboratorios de computación, salas de proyección inmersiva y espacios para instalaciones interactivas.",
                "ubicacion_lat": -27.7965,
                "ubicacion_lon": -64.2570,
                "direccion": "San Juan 234, Santiago del Estero",
                "imagen_keyword": "digital art center",
                "publicado": False,
            },
        ]

        centros = {}
        for centro_data in centros_data:
            centro, created = CentroCultural.objects.get_or_create(
                nombre=centro_data["nombre"],
                defaults={
                    "descripcion": centro_data["descripcion"],
                    "ubicacion_lat": centro_data["ubicacion_lat"],
                    "ubicacion_lon": centro_data["ubicacion_lon"],
                    "direccion": centro_data["direccion"],
                    "publicado": centro_data.get("publicado", True),
                    "creado_por": editor,
                },
            )

            if created:
                # Descargar imagen si se proporciona la clave de Unsplash Y el centro está publicado
                if options["unsplash_key"] and centro_data.get("publicado", True):
                    try:
                        imagen = self.descargar_imagen_unsplash(
                            centro_data["imagen_keyword"], options["unsplash_key"]
                        )
                        if imagen:
                            centro.imagen.save(
                                f"{self.limpiar_nombre_archivo(centro_data['nombre'])}.jpg",
                                ContentFile(imagen),
                                save=True,
                            )
                    except Exception as e:
                        self.stdout.write(
                            f"Error descargando imagen para {centro.nombre}: {e}"
                        )

                centros[centro_data["nombre"]] = centro
                self.stdout.write(f"Centro Cultural creado: {centro.nombre}")

        # Crear eventos
        eventos_data = [
            # 15 EVENTOS PUBLICADOS, TODOS DISTINTOS
            {
                "titulo": "Festival de Música Andina",
                "descripcion": "Festival con música andina y artistas invitados de la región.",
                "categoria": "Música",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2024, 8, 10),
                "fecha_fin": datetime(2024, 8, 10),
                "imagen_keyword": "andean music festival live stage",
            },
            {
                "titulo": "Feria del Libro Santiagueño",
                "descripcion": "Feria literaria con presentaciones de autores locales y nacionales.",
                "categoria": "Literatura",
                "centro": "Biblioteca Popular",
                "fecha_inicio": datetime(2024, 9, 5),
                "fecha_fin": datetime(2024, 9, 7),
                "imagen_keyword": "book fair author signing event",
            },
            {
                "titulo": "Expo Artesanías del Norte",
                "descripcion": "Exposición y venta de artesanías tradicionales del norte argentino.",
                "categoria": "Artesanías",
                "centro": "Casa del Artesano",
                "fecha_inicio": datetime(2024, 10, 12),
                "fecha_fin": datetime(2024, 10, 13),
                "imagen_keyword": "handmade crafts market argentina",
            },
            {
                "titulo": "Encuentro de Luthiers",
                "descripcion": "Muestra y taller de construcción de instrumentos musicales típicos y su importancia en la cultura audiovisual.",
                "categoria": "Cine y Audiovisual",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime(2024, 11, 2),
                "fecha_fin": datetime(2024, 11, 2),
                "imagen_keyword": "musical instruments workshop documentary",
            },
            {
                "titulo": "Salón de Pintura Santiagueña",
                "descripcion": "Exposición de obras plásticas de artistas santiagueños.",
                "categoria": "Plástica",
                "centro": "Museo de Bellas Artes",
                "fecha_inicio": datetime(2024, 11, 20),
                "fecha_fin": datetime(2024, 12, 5),
                "imagen_keyword": "art painting exhibition gallery",
            },
            {
                "titulo": "Muestra de Cortometrajes Santiagueños",
                "descripcion": "Proyección de cortometrajes realizados por cineastas locales.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": datetime(2024, 12, 10),
                "fecha_fin": datetime(2024, 12, 10),
                "imagen_keyword": "short film festival cinema audience",
            },
            {
                "titulo": "Procesión de la Virgen del Valle",
                "descripcion": "Tradicional procesión religiosa con música y danzas.",
                "categoria": "Religiosidad",
                "centro": "Casa de la Cultura",
                "fecha_inicio": datetime(2024, 12, 20),
                "fecha_fin": datetime(2024, 12, 20),
                "imagen_keyword": "religious procession argentina faith",
            },
            {
                "titulo": "Obra de Teatro: La Memoria Viva",
                "descripcion": "Obra teatral sobre la historia y la identidad santiagueña.",
                "categoria": "Teatro",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": datetime(2025, 1, 15),
                "fecha_fin": datetime(2025, 1, 15),
                "imagen_keyword": "theater play actors stage drama",
            },
            {
                "titulo": "Noche de Mitos y Leyendas",
                "descripcion": "Narración oral y dramatización de mitos y leyendas santiagueñas.",
                "categoria": "Mitos y Leyendas",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime(2025, 2, 10),
                "fecha_fin": datetime(2025, 2, 10),
                "imagen_keyword": "storytelling myths legends night",
            },
            {
                "titulo": "Festival de la Lengua Quichua",
                "descripcion": "Festival con talleres, música y poesía en lengua quichua.",
                "categoria": "Lengua Quichua",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2025, 3, 7),
                "fecha_fin": datetime(2025, 3, 7),
                "imagen_keyword": "quichua language festival poetry",
            },
            {
                "titulo": "Sabores de Santiago",
                "descripcion": "Feria gastronómica con platos típicos santiagueños.",
                "categoria": "Gastronomía",
                "centro": "Casa del Artesano",
                "fecha_inicio": datetime(2025, 4, 5),
                "fecha_fin": datetime(2025, 4, 5),
                "imagen_keyword": "argentinian food festival traditional",
            },
            {
                "titulo": "Jornada de Identidad Cultural",
                "descripcion": "Charlas y talleres sobre la identidad santiagueña y sus raíces.",
                "categoria": "Identidad",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2025, 5, 10),
                "fecha_fin": datetime(2025, 5, 10),
                "imagen_keyword": "cultural identity workshop argentina",
            },
            {
                "titulo": "Encuentro de Coros Infantiles",
                "descripcion": "Presentación de coros infantiles de distintas escuelas.",
                "categoria": "Música",
                "centro": "Auditorio Municipal",
                "fecha_inicio": datetime(2025, 6, 15),
                "fecha_fin": datetime(2025, 6, 15),
                "imagen_keyword": "children choir concert stage",
            },
            {
                "titulo": "Taller de Cerámica Tradicional",
                "descripcion": "Taller práctico de cerámica con técnicas ancestrales.",
                "categoria": "Artesanías",
                "centro": "Casa del Artesano",
                "fecha_inicio": datetime(2025, 7, 20),
                "fecha_fin": datetime(2025, 7, 20),
                "imagen_keyword": "traditional pottery workshop hands clay",
            },
            {
                "titulo": "Festival de Danzas Folklóricas",
                "descripcion": "Competencia y muestra de danzas folklóricas argentinas.",
                "categoria": "Plástica",
                "centro": "Centro de Danzas Folklóricas",
                "fecha_inicio": datetime(2025, 8, 10),
                "fecha_fin": datetime(2025, 8, 10),
                "imagen_keyword": "folk dance festival argentina stage",
            },
            # 5 EVENTOS NO PUBLICADOS (BORRADORES)
            {
                "titulo": "Laboratorio de Arte Digital",
                "descripcion": "Taller experimental de arte digital y nuevas tecnologías.",
                "categoria": "Plástica",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime(2025, 9, 5),
                "fecha_fin": datetime(2025, 9, 5),
                "publicado": False,
            },
            {
                "titulo": "Seminario de Gastronomía Fusión",
                "descripcion": "Seminario sobre cocina fusión con chefs invitados.",
                "categoria": "Gastronomía",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime(2025, 10, 2),
                "fecha_fin": datetime(2025, 10, 2),
                "publicado": False,
            },
            {
                "titulo": "Encuentro de Narradores Orales",
                "descripcion": "Jornada de narración oral con invitados nacionales.",
                "categoria": "Mitos y Leyendas",
                "centro": "Casa de la Cultura",
                "fecha_inicio": datetime(2025, 11, 12),
                "fecha_fin": datetime(2025, 11, 12),
                "publicado": False,
            },
            {
                "titulo": "Taller de Instrumentos Reciclados",
                "descripcion": "Taller de construcción de instrumentos musicales con materiales reciclados y grabación audiovisual.",
                "categoria": "Cine y Audiovisual",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime(2025, 12, 1),
                "fecha_fin": datetime(2025, 12, 1),
                "publicado": False,
            },
            {
                "titulo": "Mesa de Diálogo sobre Identidad",
                "descripcion": "Espacio de debate sobre identidad y diversidad cultural.",
                "categoria": "Identidad",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2026, 1, 15),
                "fecha_fin": datetime(2026, 1, 15),
                "publicado": False,
            },
        ]

        for evento_data in eventos_data:
            evento, created = Evento.objects.get_or_create(
                titulo=evento_data["titulo"],
                defaults={
                    "descripcion": evento_data["descripcion"],
                    "categoria": categorias.get(evento_data["categoria"]),
                    "centro_cultural": centros.get(evento_data["centro"]),
                    "fecha_inicio": evento_data["fecha_inicio"].date(),
                    "fecha_fin": evento_data["fecha_fin"].date()
                    if evento_data["fecha_fin"]
                    else None,
                    "publicado": evento_data.get("publicado", True),
                    "creado_por": editor,
                },
            )

            if created:
                # Descargar imagen si se proporciona la clave de Unsplash Y el evento está publicado
                if options["unsplash_key"] and evento_data.get("publicado", True):
                    try:
                        imagen = self.descargar_imagen_unsplash(
                            evento_data["imagen_keyword"], options["unsplash_key"]
                        )
                        if imagen:
                            evento.imagen.save(
                                f"{self.limpiar_nombre_archivo(evento_data['titulo'])}.jpg",
                                ContentFile(imagen),
                                save=True,
                            )
                    except Exception as e:
                        self.stdout.write(
                            f"Error descargando imagen para {evento.titulo}: {e}"
                        )

                self.stdout.write(f"Evento creado: {evento.titulo}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Población completada exitosamente:\n"
                f"- {len(categorias)} categorías creadas\n"
                f"- {len(centros)} centros culturales creados\n"
                f"- {len(eventos_data)} eventos creados"
            )
        )

    def descargar_imagen_unsplash(self, keyword, access_key):
        """Descarga una imagen de Unsplash basada en una palabra clave"""
        try:
            # Buscar imagen en Unsplash
            search_url = f"https://api.unsplash.com/search/photos"
            headers = {"Authorization": f"Client-ID {access_key}"}
            params = {"query": keyword, "per_page": 1, "orientation": "landscape"}

            response = requests.get(search_url, headers=headers, params=params)
            response.raise_for_status()

            data = response.json()
            if data["results"]:
                photo = data["results"][0]
                download_url = photo["urls"]["regular"]

                # Descargar la imagen
                img_response = requests.get(download_url)
                img_response.raise_for_status()

                return img_response.content

        except Exception as e:
            self.stdout.write(f"Error descargando imagen de Unsplash: {e}")
            return None
