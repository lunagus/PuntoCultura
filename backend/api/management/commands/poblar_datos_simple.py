import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import datetime, timedelta
import random
from api.models import Categoria, CentroCultural, Evento


class Command(BaseCommand):
    help = "Pobla la base de datos con datos de cultura para Santiago del Estero (sin imágenes)"

    def handle(self, *args, **options):
        self.stdout.write("Iniciando población de datos (versión simple)...")

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
            {"nombre": "Música Folklórica"},
            {"nombre": "Teatro"},
            {"nombre": "Danza Tradicional"},
            {"nombre": "Artes Visuales"},
            {"nombre": "Literatura"},
            {"nombre": "Cine y Audiovisual"},
            {"nombre": "Artesanías"},
            {"nombre": "Festivales Culturales"},
            {"nombre": "Talleres Educativos"},
            {"nombre": "Exposiciones"},
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
            },
            {
                "nombre": "Casa de la Cultura",
                "descripcion": "Histórica casa colonial que alberga exposiciones de arte local, talleres de artesanías y presentaciones de música folklórica. Un espacio íntimo para la expresión cultural santiagueña.",
                "ubicacion_lat": -27.7965,
                "ubicacion_lon": -64.2630,
                "direccion": "Belgrano 132, Santiago del Estero",
            },
            {
                "nombre": "Teatro 25 de Mayo",
                "descripcion": "Teatro histórico de la ciudad con capacidad para 800 espectadores. Sede de importantes obras teatrales, conciertos y eventos culturales de la provincia.",
                "ubicacion_lat": -27.7940,
                "ubicacion_lon": -64.2620,
                "direccion": "25 de Mayo 350, Santiago del Estero",
            },
            {
                "nombre": "Museo de Bellas Artes",
                "descripcion": "Museo que alberga una importante colección de arte argentino y latinoamericano, con énfasis en artistas santiagueños. Espacio para exposiciones temporales y talleres de arte.",
                "ubicacion_lat": -27.7970,
                "ubicacion_lon": -64.2640,
                "direccion": "Av. Sarmiento 156, Santiago del Estero",
            },
            {
                "nombre": "Centro Cultural Municipal",
                "descripcion": "Espacio municipal dedicado a la promoción de artistas locales, con salas de exposición, auditorio y talleres para todas las edades.",
                "ubicacion_lat": -27.7930,
                "ubicacion_lon": -64.2650,
                "direccion": "Independencia 245, Santiago del Estero",
            },
            {
                "nombre": "Casa del Artesano",
                "descripcion": "Centro dedicado a la preservación y promoción de las artesanías tradicionales santiagueñas. Talleres de cerámica, tejido, cestería y otros oficios artesanales.",
                "ubicacion_lat": -27.7955,
                "ubicacion_lon": -64.2600,
                "direccion": "San Martín 89, Santiago del Estero",
            },
            {
                "nombre": "Auditorio Municipal",
                "descripcion": "Moderno auditorio con capacidad para 500 personas, equipado con tecnología de última generación para conciertos, conferencias y eventos culturales.",
                "ubicacion_lat": -27.7920,
                "ubicacion_lon": -64.2660,
                "direccion": "Av. Moreno 234, Santiago del Estero",
            },
            {
                "nombre": "Galería de Arte Contemporáneo",
                "descripcion": "Espacio dedicado al arte contemporáneo con exposiciones de artistas emergentes y consagrados. Galería moderna con iluminación profesional.",
                "ubicacion_lat": -27.7960,
                "ubicacion_lon": -64.2590,
                "direccion": "Rivadavia 178, Santiago del Estero",
            },
            {
                "nombre": "Centro de Danzas Folklóricas",
                "descripcion": "Centro especializado en danzas folklóricas argentinas, especialmente las danzas santiagueñas. Salas de ensayo, vestuarios y auditorio para presentaciones.",
                "ubicacion_lat": -27.7945,
                "ubicacion_lon": -64.2670,
                "direccion": "Mitre 456, Santiago del Estero",
            },
            {
                "nombre": "Biblioteca Popular",
                "descripcion": "Biblioteca pública con amplia colección de literatura regional y nacional. Espacio para clubes de lectura, presentaciones de libros y actividades literarias.",
                "ubicacion_lat": -27.7975,
                "ubicacion_lon": -64.2580,
                "direccion": "Av. Colón 321, Santiago del Estero",
            },
            # CENTROS CULTURALES NO PUBLICADOS (BORRADORES)
            {
                "nombre": "Centro de Música Popular",
                "descripcion": "Nuevo centro especializado en música popular argentina y latinoamericana. Contará con salas de ensayo, estudio de grabación y auditorio para 300 personas. Actualmente en construcción.",
                "ubicacion_lat": -27.7935,
                "ubicacion_lon": -64.2680,
                "direccion": "Av. Roca 567, Santiago del Estero",
                "publicado": False,
            },
            {
                "nombre": "Espacio de Arte Digital",
                "descripcion": "Centro innovador dedicado al arte digital, multimedia y nuevas tecnologías. Incluirá laboratorios de computación, salas de proyección inmersiva y espacios para instalaciones interactivas.",
                "ubicacion_lat": -27.7965,
                "ubicacion_lon": -64.2570,
                "direccion": "San Juan 234, Santiago del Estero",
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
                centros[centro_data["nombre"]] = centro
                self.stdout.write(f"Centro Cultural creado: {centro.nombre}")

        # Crear eventos
        eventos_data = [
            # EVENTOS PASADOS (2020-2023)
            {
                "titulo": 'Festival de Folklore "Santiago Canta" 2020',
                "descripcion": "Gran festival de música folklórica con artistas locales y nacionales. Tres días de música, danza y tradición santiagueña.",
                "categoria": "Música Folklórica",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2020, 8, 15),
                "fecha_fin": datetime(2020, 8, 17),
            },
            {
                "titulo": 'Obra de Teatro "Historias de Santiago" 2021',
                "descripcion": "Obra teatral que narra las historias y leyendas más importantes de Santiago del Estero, interpretada por actores locales.",
                "categoria": "Teatro",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": datetime(2021, 3, 8),
                "fecha_fin": datetime(2021, 3, 8),
            },
            {
                "titulo": 'Exposición "Arte Contemporáneo Santiagueño" 2021',
                "descripcion": "Muestra de arte contemporáneo con obras de artistas santiagueños emergentes y consagrados.",
                "categoria": "Artes Visuales",
                "centro": "Museo de Bellas Artes",
                "fecha_inicio": datetime(2021, 6, 5),
                "fecha_fin": datetime(2021, 7, 30),
            },
            {
                "titulo": "Taller de Danzas Folklóricas 2022",
                "descripcion": "Taller intensivo de danzas folklóricas argentinas, especialmente las danzas típicas de Santiago del Estero.",
                "categoria": "Danza Tradicional",
                "centro": "Centro de Danzas Folklóricas",
                "fecha_inicio": datetime(2022, 4, 12),
                "fecha_fin": datetime(2022, 4, 12),
            },
            {
                "titulo": 'Presentación del Libro "Santiago del Estero: Historia y Cultura" 2022',
                "descripcion": "Presentación del nuevo libro que recopila la rica historia y cultura de Santiago del Estero, con firma de ejemplares.",
                "categoria": "Literatura",
                "centro": "Biblioteca Popular",
                "fecha_inicio": datetime(2022, 9, 10),
                "fecha_fin": datetime(2022, 9, 10),
            },
            {
                "titulo": "Ciclo de Cine Argentino 2022",
                "descripcion": "Proyección de películas argentinas clásicas y contemporáneas, con charlas sobre la historia del cine nacional.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": datetime(2022, 11, 7),
                "fecha_fin": datetime(2022, 11, 14),
            },
            {
                "titulo": "Feria de Artesanías Tradicionales 2023",
                "descripcion": "Feria que reúne a los mejores artesanos de la provincia, mostrando y vendiendo sus creaciones tradicionales.",
                "categoria": "Artesanías",
                "centro": "Casa del Artesano",
                "fecha_inicio": datetime(2023, 5, 20),
                "fecha_fin": datetime(2023, 5, 22),
            },
            {
                "titulo": "Concierto de Música Clásica 2023",
                "descripcion": "Concierto de la Orquesta Sinfónica de Santiago del Estero, interpretando obras de compositores argentinos y clásicos.",
                "categoria": "Música Folklórica",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": datetime(2023, 7, 25),
                "fecha_fin": datetime(2023, 7, 25),
            },
            {
                "titulo": "Taller de Pintura para Niños 2023",
                "descripcion": "Taller creativo de pintura dirigido a niños de 6 a 12 años, donde aprenderán técnicas básicas y desarrollarán su creatividad.",
                "categoria": "Talleres Educativos",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime(2023, 10, 9),
                "fecha_fin": datetime(2023, 10, 9),
            },
            {
                "titulo": 'Exposición Fotográfica "Santiago en Imágenes" 2023',
                "descripcion": "Exposición de fotografías que capturan la belleza y esencia de Santiago del Estero, desde paisajes hasta retratos de su gente.",
                "categoria": "Exposiciones",
                "centro": "Galería de Arte Contemporáneo",
                "fecha_inicio": datetime(2023, 12, 3),
                "fecha_fin": datetime(2023, 12, 25),
            },
            # EVENTOS RECIENTES (últimos meses)
            {
                "titulo": "Recital de Rock Nacional - Diciembre 2024",
                "descripcion": "Noche de rock nacional con bandas locales y regionales, presentando sus nuevos trabajos musicales.",
                "categoria": "Música Folklórica",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2024, 12, 18),
                "fecha_fin": datetime(2024, 12, 18),
            },
            {
                "titulo": 'Obra de Teatro Infantil "El Bosque Mágico" - Enero 2025',
                "descripcion": "Obra de teatro para toda la familia que cuenta la historia de un bosque mágico y sus habitantes fantásticos.",
                "categoria": "Teatro",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": datetime(2025, 1, 11),
                "fecha_fin": datetime(2025, 1, 11),
            },
            # EVENTOS FUTUROS (próximos meses)
            {
                "titulo": "Clase Magistral de Danza Contemporánea",
                "descripcion": "Clase magistral de danza contemporánea a cargo de reconocidos bailarines y coreógrafos nacionales.",
                "categoria": "Danza Tradicional",
                "centro": "Centro de Danzas Folklóricas",
                "fecha_inicio": datetime.now() + timedelta(days=16),
                "fecha_fin": datetime.now() + timedelta(days=16),
            },
            {
                "titulo": "Encuentro de Poetas Santiagueños",
                "descripcion": "Encuentro literario donde poetas locales compartirán sus obras y experiencias, con lectura de poemas en vivo.",
                "categoria": "Literatura",
                "centro": "Casa de la Cultura",
                "fecha_inicio": datetime.now() + timedelta(days=13),
                "fecha_fin": datetime.now() + timedelta(days=13),
            },
            {
                "titulo": "Festival de Cortometrajes",
                "descripcion": "Festival que presenta los mejores cortometrajes realizados por cineastas santiagueños y de la región.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": datetime.now() + timedelta(days=21),
                "fecha_fin": datetime.now() + timedelta(days=23),
            },
            {
                "titulo": "Taller de Cerámica Tradicional",
                "descripcion": "Taller donde se enseñan las técnicas tradicionales de cerámica santiagueña, desde el modelado hasta el esmaltado.",
                "categoria": "Artesanías",
                "centro": "Casa del Artesano",
                "fecha_inicio": datetime.now() + timedelta(days=6),
                "fecha_fin": datetime.now() + timedelta(days=6),
            },
            {
                "titulo": "Concierto de Jazz y Blues",
                "descripcion": "Noche de jazz y blues con músicos locales e invitados especiales, presentando un repertorio variado y emocionante.",
                "categoria": "Música Folklórica",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime.now() + timedelta(days=19),
                "fecha_fin": datetime.now() + timedelta(days=19),
            },
            {
                "titulo": 'Obra de Teatro "La Casa de Bernarda Alba"',
                "descripcion": "Presentación de la obra clásica de Federico García Lorca, interpretada por el elenco estable del teatro.",
                "categoria": "Teatro",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": datetime.now() + timedelta(days=28),
                "fecha_fin": datetime.now() + timedelta(days=28),
            },
            {
                "titulo": "Exposición de Esculturas",
                "descripcion": "Exposición de esculturas de artistas locales, trabajando con diversos materiales como mármol, bronce y madera.",
                "categoria": "Artes Visuales",
                "centro": "Museo de Bellas Artes",
                "fecha_inicio": datetime.now() + timedelta(days=4),
                "fecha_fin": datetime.now() + timedelta(days=20),
            },
            {
                "titulo": "Taller de Danzas Circulares",
                "descripcion": "Taller de danzas circulares del mundo, una experiencia de conexión y movimiento grupal.",
                "categoria": "Danza Tradicional",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime.now() + timedelta(days=14),
                "fecha_fin": datetime.now() + timedelta(days=14),
            },
            {
                "titulo": "Presentación de Revista Cultural",
                "descripcion": "Presentación de la nueva edición de la revista cultural local, con charlas sobre literatura y arte.",
                "categoria": "Literatura",
                "centro": "Biblioteca Popular",
                "fecha_inicio": datetime.now() + timedelta(days=17),
                "fecha_fin": datetime.now() + timedelta(days=17),
            },
            {
                "titulo": "Ciclo de Documentales Argentinos",
                "descripcion": "Proyección de documentales argentinos que abordan temas sociales, históricos y culturales del país.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": datetime.now() + timedelta(days=24),
                "fecha_fin": datetime.now() + timedelta(days=26),
            },
            {
                "titulo": "Feria de Arte y Diseño",
                "descripcion": "Feria que reúne artistas y diseñadores locales, mostrando sus creaciones en diferentes disciplinas artísticas.",
                "categoria": "Artesanías",
                "centro": "Galería de Arte Contemporáneo",
                "fecha_inicio": datetime.now() + timedelta(days=27),
                "fecha_fin": datetime.now() + timedelta(days=29),
            },
            {
                "titulo": "Concierto de Música Andina",
                "descripcion": "Concierto de música andina con instrumentos tradicionales, interpretada por músicos locales.",
                "categoria": "Música Folklórica",
                "centro": "Casa de la Cultura",
                "fecha_inicio": datetime.now() + timedelta(days=22),
                "fecha_fin": datetime.now() + timedelta(days=22),
            },
            {
                "titulo": 'Obra de Teatro "El Principito"',
                "descripcion": "Adaptación teatral de la obra clásica de Antoine de Saint-Exupéry, dirigida a toda la familia.",
                "categoria": "Teatro",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": datetime.now() + timedelta(days=30),
                "fecha_fin": datetime.now() + timedelta(days=30),
            },
            {
                "titulo": "Taller de Pintura al Óleo",
                "descripcion": "Taller de pintura al óleo para adultos, donde se aprenderán técnicas básicas y avanzadas.",
                "categoria": "Talleres Educativos",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime.now() + timedelta(days=26),
                "fecha_fin": datetime.now() + timedelta(days=26),
            },
            {
                "titulo": 'Exposición "Retratos de Santiago"',
                "descripcion": "Exposición de retratos que muestran la diversidad y riqueza cultural de los habitantes de Santiago del Estero.",
                "categoria": "Exposiciones",
                "centro": "Museo de Bellas Artes",
                "fecha_inicio": datetime.now() + timedelta(days=2),
                "fecha_fin": datetime.now() + timedelta(days=18),
            },
            {
                "titulo": "Festival de Folklore 2025",
                "descripcion": "Gran festival anual de música folklórica que celebra las tradiciones musicales de Santiago del Estero y la región.",
                "categoria": "Festivales Culturales",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": datetime(2025, 8, 15),
                "fecha_fin": datetime(2025, 8, 17),
            },
            {
                "titulo": "Semana de las Artes 2025",
                "descripcion": "Semana dedicada a todas las expresiones artísticas con exposiciones, talleres, conciertos y presentaciones especiales.",
                "categoria": "Festivales Culturales",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": datetime(2025, 9, 20),
                "fecha_fin": datetime(2025, 9, 27),
            },
            # EVENTOS NO PUBLICADOS (BORRADORES)
            {
                "titulo": "Festival de Jazz Internacional",
                "descripcion": "Festival internacional de jazz con músicos de renombre mundial. Tres días de música de alta calidad con workshops y jam sessions.",
                "categoria": "Música Folklórica",
                "centro": "Centro de Música Popular",
                "fecha_inicio": datetime.now() + timedelta(days=45),
                "fecha_fin": datetime.now() + timedelta(days=47),
                "publicado": False,
            },
            {
                "titulo": "Exposición de Arte Digital",
                "descripcion": "Muestra pionera de arte digital con obras creadas mediante inteligencia artificial, realidad virtual y tecnologías emergentes.",
                "categoria": "Artes Visuales",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime.now() + timedelta(days=35),
                "fecha_fin": datetime.now() + timedelta(days=60),
                "publicado": False,
            },
            {
                "titulo": "Taller de Composición Musical Digital",
                "descripcion": "Taller avanzado de composición musical usando software profesional y herramientas digitales para músicos y compositores.",
                "categoria": "Talleres Educativos",
                "centro": "Centro de Música Popular",
                "fecha_inicio": datetime.now() + timedelta(days=40),
                "fecha_fin": datetime.now() + timedelta(days=40),
                "publicado": False,
            },
            {
                "titulo": "Obra de Teatro Experimental",
                "descripcion": "Obra de teatro experimental que combina actuación tradicional con elementos multimedia y tecnología interactiva.",
                "categoria": "Teatro",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime.now() + timedelta(days=50),
                "fecha_fin": datetime.now() + timedelta(days=50),
                "publicado": False,
            },
            {
                "titulo": "Conferencia sobre Arte y Tecnología",
                "descripcion": "Conferencia magistral sobre la intersección entre arte y tecnología, con expertos nacionales e internacionales.",
                "categoria": "Artes Visuales",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime.now() + timedelta(days=38),
                "fecha_fin": datetime.now() + timedelta(days=38),
                "publicado": False,
            },
            {
                "titulo": "Recital de Música Electrónica",
                "descripcion": "Noche de música electrónica con DJs locales y nacionales, presentando las últimas tendencias en el género.",
                "categoria": "Música Folklórica",
                "centro": "Centro de Música Popular",
                "fecha_inicio": datetime.now() + timedelta(days=42),
                "fecha_fin": datetime.now() + timedelta(days=42),
                "publicado": False,
            },
            {
                "titulo": "Taller de Programación Creativa",
                "descripcion": "Taller donde se enseñan técnicas de programación para crear arte generativo y visualizaciones interactivas.",
                "categoria": "Talleres Educativos",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime.now() + timedelta(days=44),
                "fecha_fin": datetime.now() + timedelta(days=44),
                "publicado": False,
            },
            {
                "titulo": "Festival de Cine Digital",
                "descripcion": "Festival dedicado al cine digital y producciones audiovisuales realizadas con tecnologías modernas.",
                "categoria": "Cine y Audiovisual",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime.now() + timedelta(days=55),
                "fecha_fin": datetime.now() + timedelta(days=58),
                "publicado": False,
            },
            {
                "titulo": "Concierto de Música Clásica Contemporánea",
                "descripcion": "Concierto de música clásica contemporánea con obras de compositores argentinos del siglo XXI.",
                "categoria": "Música Folklórica",
                "centro": "Centro de Música Popular",
                "fecha_inicio": datetime.now() + timedelta(days=48),
                "fecha_fin": datetime.now() + timedelta(days=48),
                "publicado": False,
            },
            {
                "titulo": "Exposición de Fotografía Digital",
                "descripcion": "Exposición de fotografía digital que explora las nuevas posibilidades creativas de la fotografía en la era digital.",
                "categoria": "Exposiciones",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": datetime.now() + timedelta(days=52),
                "fecha_fin": datetime.now() + timedelta(days=75),
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
                self.stdout.write(f"Evento creado: {evento.titulo}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Población completada exitosamente:\n"
                f"- {len(categorias)} categorías creadas\n"
                f"- {len(centros)} centros culturales creados\n"
                f"- {len(eventos_data)} eventos creados\n\n"
                f'Nota: Esta versión no incluye imágenes. Para agregar imágenes, use el comando "poblar_datos" con la opción --unsplash-key.'
            )
        )
