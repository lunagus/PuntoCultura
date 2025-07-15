import requests
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from datetime import datetime, time
from api.models import Categoria, CentroCultural, Evento


class Command(BaseCommand):
    help = "Poblar la base de datos con datos de cultura para Santiago del Estero"

    def add_arguments(self, parser):
        parser.add_argument(
            "--unsplash-key",
            type=str,
            help="Unsplash access key para descargar imágenes",
        )
        parser.add_argument(
            "--solo-eventos",
            action="store_true",
            help="Poblar solo eventos (sin categorías ni centros)",
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

        editor = None

        try:
            editor, created = User.objects.get_or_create(
                username="editor",
                defaults={
                    "email": "editor@cultura.santiago.gob.ar",
                    "first_name": "Editor",
                    "last_name": "Cultural",
                },
            )
            if created:
                # Set password properly (hashed)
                editor.set_password("editor123")
                editor.save()
                self.stdout.write(self.style.SUCCESS("Usuario 'editor' creado."))
            else:
                self.stdout.write(self.style.SUCCESS("Usuario 'editor' ya existía."))
        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f"Error al obtener o crear el usuario: {e}")
            )
            return

        # Crear categorías (solo si no es --solo-eventos)
        if not options["solo_eventos"]:
            categorias_data = [
                {"nombre": "Música", "color": "#FF6B6B"},
                {"nombre": "Literatura", "color": "#4ECDC4"},
                {"nombre": "Artesanías", "color": "#45B7D1"},
                {"nombre": "Cine y Audiovisual", "color": "#96CEB4"},
                {"nombre": "Plástica", "color": "#FFEAA7"},
                {"nombre": "Religiosidad", "color": "#DDA0DD"},
                {"nombre": "Teatro", "color": "#98D8C8"},
                {"nombre": "Mitos y Leyendas", "color": "#F7DC6F"},
                {"nombre": "Lengua Quichua", "color": "#BB8FCE"},
                {"nombre": "Gastronomía", "color": "#F8C471"},
                {"nombre": "Identidad", "color": "#85C1E9"},
            ]

            categorias = {}
            for cat_data in categorias_data:
                categoria, created = Categoria.objects.get_or_create(
                    nombre=cat_data["nombre"], defaults={"color": cat_data["color"]}
                )
                categorias[cat_data["nombre"]] = categoria
                if created:
                    self.stdout.write(f"Categoría creada: {categoria.nombre}")
        else:
            # Si es solo eventos, obtener categorías existentes
            categorias = {cat.nombre: cat for cat in Categoria.objects.all()}

        # Crear centros culturales (solo si no es --solo-eventos)
        if not options["solo_eventos"]:
            centros_data = [
                {
                    "nombre": "Centro Cultural del Bicentenario",
                    "descripcion": "El Centro Cultural del Bicentenario es el principal espacio cultural de Santiago del Estero, ubicado en el corazón de la ciudad. Cuenta con salas de teatro, galerías de arte, auditorio y espacios para talleres culturales.",
                    "ubicacion_lat": -27.7951,
                    "ubicacion_lon": -64.2615,
                    "direccion": "Av. Libertad 439, Santiago del Estero",
                    "imagen_keyword": "modern cultural center architecture argentina",
                    "horario_apertura": "09:00",
                    "horario_cierre": "18:00",
                },
                {
                    "nombre": "Casa de la Cultura",
                    "descripcion": "Histórica casa colonial que alberga exposiciones de arte local, talleres de artesanías y presentaciones de música folklórica. Un espacio íntimo para la expresión cultural santiagueña.",
                    "ubicacion_lat": -27.7965,
                    "ubicacion_lon": -64.2630,
                    "direccion": "Belgrano 132, Santiago del Estero",
                    "imagen_keyword": "colonial house art exhibition",
                    "horario_apertura": "10:00",
                    "horario_cierre": "17:00",
                },
                {
                    "nombre": "Teatro 25 de Mayo",
                    "descripcion": "Teatro histórico de la ciudad con capacidad para 800 espectadores. Sede de importantes obras teatrales, conciertos y eventos culturales de la provincia.",
                    "ubicacion_lat": -27.7940,
                    "ubicacion_lon": -64.2620,
                    "direccion": "25 de Mayo 350, Santiago del Estero",
                    "imagen_keyword": "historic theater stage audience",
                    "horario_apertura": "09:00",
                    "horario_cierre": "20:00",
                },
                {
                    "nombre": "Museo de Bellas Artes",
                    "descripcion": "Museo que alberga una importante colección de arte argentino y latinoamericano, con énfasis en artistas santiagueños. Espacio para exposiciones temporales y talleres de arte.",
                    "ubicacion_lat": -27.7970,
                    "ubicacion_lon": -64.2640,
                    "direccion": "Av. Sarmiento 156, Santiago del Estero",
                    "imagen_keyword": "art museum gallery paintings",
                    "horario_apertura": "10:00",
                    "horario_cierre": "18:00",
                },
                {
                    "nombre": "Centro Cultural Municipal",
                    "descripcion": "Espacio municipal dedicado a la promoción de artistas locales, con salas de exposición, auditorio y talleres para todas las edades.",
                    "ubicacion_lat": -27.7930,
                    "ubicacion_lon": -64.2650,
                    "direccion": "Independencia 245, Santiago del Estero",
                    "imagen_keyword": "community arts center workshop",
                    "horario_apertura": "08:00",
                    "horario_cierre": "18:00",
                },
                {
                    "nombre": "Casa del Artesano",
                    "descripcion": "Centro dedicado a la preservación y promoción de las artesanías tradicionales santiagueñas. Talleres de cerámica, tejido, cestería y otros oficios artesanales.",
                    "ubicacion_lat": -27.7955,
                    "ubicacion_lon": -64.2600,
                    "direccion": "San Martín 89, Santiago del Estero",
                    "imagen_keyword": "artisan crafts pottery weaving",
                    "horario_apertura": "09:00",
                    "horario_cierre": "17:00",
                },
                {
                    "nombre": "Auditorio Municipal",
                    "descripcion": "Moderno auditorio con capacidad para 500 personas, equipado con tecnología de última generación para conciertos, conferencias y eventos culturales.",
                    "ubicacion_lat": -27.7920,
                    "ubicacion_lon": -64.2660,
                    "direccion": "Av. Moreno 234, Santiago del Estero",
                    "imagen_keyword": "modern auditorium concert hall",
                    "horario_apertura": "07:00",
                    "horario_cierre": "22:00",
                },
                {
                    "nombre": "Galería de Arte Contemporáneo",
                    "descripcion": "Espacio dedicado al arte contemporáneo con exposiciones de artistas emergentes y consagrados. Galería moderna con iluminación profesional.",
                    "ubicacion_lat": -27.7960,
                    "ubicacion_lon": -64.2590,
                    "direccion": "Rivadavia 178, Santiago del Estero",
                    "imagen_keyword": "contemporary art gallery exhibition",
                    "horario_apertura": "10:00",
                    "horario_cierre": "18:00",
                },
                {
                    "nombre": "Centro de Danzas Folklóricas",
                    "descripcion": "Centro especializado en danzas folklóricas argentinas, especialmente las danzas santiagueñas. Salas de ensayo, vestuarios y auditorio para presentaciones.",
                    "ubicacion_lat": -27.7945,
                    "ubicacion_lon": -64.2670,
                    "direccion": "Mitre 456, Santiago del Estero",
                    "imagen_keyword": "folk dance studio rehearsal",
                    "horario_apertura": "09:00",
                    "horario_cierre": "17:00",
                },
                {
                    "nombre": "Biblioteca Popular",
                    "descripcion": "Biblioteca pública con amplia colección de literatura regional y nacional. Espacio para clubes de lectura, presentaciones de libros y actividades literarias.",
                    "ubicacion_lat": -27.7975,
                    "ubicacion_lon": -64.2580,
                    "direccion": "Av. Colón 321, Santiago del Estero",
                    "imagen_keyword": "public library reading books",
                    "horario_apertura": "09:00",
                    "horario_cierre": "18:00",
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
                    "horario_apertura": "10:00",
                    "horario_cierre": "19:00",
                },
                {
                    "nombre": "Espacio de Arte Digital",
                    "descripcion": "Centro innovador dedicado al arte digital, multimedia y nuevas tecnologías. Incluirá laboratorios de computación, salas de proyección inmersiva y espacios para instalaciones interactivas.",
                    "ubicacion_lat": -27.7965,
                    "ubicacion_lon": -64.2570,
                    "direccion": "San Juan 234, Santiago del Estero",
                    "imagen_keyword": "digital art center",
                    "publicado": False,
                    "horario_apertura": "09:00",
                    "horario_cierre": "18:00",
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
                        "horario_apertura": time.fromisoformat(
                            centro_data["horario_apertura"]
                        ),
                        "horario_cierre": time.fromisoformat(
                            centro_data["horario_cierre"]
                        ),
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
        else:
            # Si es solo eventos, obtener centros existentes
            centros = {centro.nombre: centro for centro in CentroCultural.objects.all()}

        # Crear eventos
        eventos_data = [
            # EVENTOS PASADOS (2024)
            {
                "titulo": "Festival de Música Andina",
                "descripcion": "Festival que reúne a músicos andinos de la región para celebrar la música tradicional con instrumentos autóctonos.",
                "categoria": "Música",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": "2024-06-15",
                "fecha_fin": "2024-06-17",
                "imagen_keyword": "andean pan flute musicians traditional",
                "horario_apertura": "10:00",
                "horario_cierre": "20:00",
            },
            {
                "titulo": "Feria del Libro Santiagueño",
                "descripcion": "Feria que promueve la literatura local con presentaciones de libros, charlas con autores y actividades para niños.",
                "categoria": "Literatura",
                "centro": "Casa de la Cultura",
                "fecha_inicio": "2024-07-20",
                "fecha_fin": "2024-07-25",
                "imagen_keyword": "book signing author reading library",
                "horario_apertura": "09:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Expo Artesanías del Norte",
                "descripcion": "Exposición de artesanías tradicionales del norte argentino, con demostraciones en vivo y venta de productos.",
                "categoria": "Artesanías",
                "centro": "Casa del Artesano",
                "fecha_inicio": "2024-08-10",
                "fecha_fin": "2024-08-15",
                "imagen_keyword": "handmade wool textiles weaving",
                "horario_apertura": "10:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Encuentro de Luthiers",
                "descripcion": "Encuentro de fabricantes de instrumentos musicales tradicionales, con talleres y exposiciones de guitarras criollas.",
                "categoria": "Artesanías",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": "2024-09-05",
                "fecha_fin": "2024-09-07",
                "imagen_keyword": "guitar making workshop woodcraft",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Salón de Pintura Santiagueña",
                "descripcion": "Exposición anual de pintores locales con obras que reflejan la identidad y paisajes de Santiago del Estero.",
                "categoria": "Plástica",
                "centro": "Museo de Bellas Artes",
                "fecha_inicio": "2024-10-12",
                "fecha_fin": "2024-11-15",
                "imagen_keyword": "oil painting canvas artist studio",
                "horario_apertura": "09:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Muestra de Cortometrajes Santiagueños",
                "descripcion": "Festival de cortometrajes realizados por cineastas locales, con proyecciones y charlas con los directores.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": "2024-11-08",
                "fecha_fin": "2024-11-10",
                "imagen_keyword": "film projector cinema screen",
                "horario_apertura": "10:00",
                "horario_cierre": "22:00",
            },
            {
                "titulo": "Procesión de la Virgen del Valle",
                "descripcion": "Procesión religiosa tradicional que reúne a miles de fieles en honor a la patrona de Santiago del Estero.",
                "categoria": "Religiosidad",
                "centro": "Casa de la Cultura",
                "fecha_inicio": "2024-12-08",
                "fecha_fin": "2024-12-08",
                "imagen_keyword": "religious candlelight procession",
                "horario_apertura": "06:00",
                "horario_cierre": "19:00",
            },
            {
                "titulo": "Obra de Teatro: La Memoria Viva",
                "descripcion": "Obra teatral que narra la historia de Santiago del Estero a través de relatos y leyendas populares.",
                "categoria": "Teatro",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": "2024-12-15",
                "fecha_fin": "2024-12-20",
                "imagen_keyword": "theater masks dramatic performance",
                "horario_apertura": "09:00",
                "horario_cierre": "20:00",
            },
            {
                "titulo": "Noche de Mitos y Leyendas",
                "descripcion": "Noche especial dedicada a los mitos y leyendas del norte argentino, con narradores orales y música tradicional.",
                "categoria": "Mitos y Leyendas",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": "2024-12-21",
                "fecha_fin": "2024-12-21",
                "imagen_keyword": "campfire storytelling night",
                "horario_apertura": "19:00",
                "horario_cierre": "23:00",
            },
            {
                "titulo": "Torneo de Ajedrez Provincial",
                "descripcion": "Torneo de ajedrez que reúne a jugadores de toda la provincia en diferentes categorías, desde principiantes hasta expertos.",
                "categoria": "Identidad",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": "2024-12-28",
                "fecha_fin": "2024-12-30",
                "imagen_keyword": "chess tournament players strategy",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            # EVENTOS RECIENTES (2025 - ya pasaron)
            {
                "titulo": "Sabores de Santiago",
                "descripcion": "Festival gastronómico que celebra la cocina tradicional santiagueña con degustaciones y talleres de cocina.",
                "categoria": "Gastronomía",
                "centro": "Casa de la Cultura",
                "fecha_inicio": "2025-01-15",
                "fecha_fin": "2025-01-17",
                "imagen_keyword": "empanadas argentinian food cooking",
                "horario_apertura": "10:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Jornada de Identidad Cultural",
                "descripcion": "Jornada de reflexión sobre la identidad cultural santiagueña con charlas, talleres y exposiciones.",
                "categoria": "Identidad",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": "2025-02-20",
                "fecha_fin": "2025-02-22",
                "imagen_keyword": "cultural heritage workshop discussion",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Festival de Cantantes Populares",
                "descripcion": "Festival que reúne a cantantes populares de la región para celebrar la música vocal y las tradiciones cantadas.",
                "categoria": "Música",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": "2025-03-10",
                "fecha_fin": "2025-03-12",
                "imagen_keyword": "folk singers vocal performance stage",
                "horario_apertura": "10:00",
                "horario_cierre": "20:00",
            },
            {
                "titulo": "Taller de Cerámica Tradicional",
                "descripcion": "Taller intensivo de cerámica tradicional santiagueña, enseñando técnicas ancestrales de modelado y decoración.",
                "categoria": "Artesanías",
                "centro": "Casa del Artesano",
                "fecha_inicio": "2025-03-25",
                "fecha_fin": "2025-03-27",
                "imagen_keyword": "pottery wheel clay hands crafting",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Festival de Danzas Folklóricas",
                "descripcion": "Festival que reúne a bailarines y grupos de danzas folklóricas de toda la provincia.",
                "categoria": "Música",
                "centro": "Centro de Danzas Folklóricas",
                "fecha_inicio": "2025-04-05",
                "fecha_fin": "2025-04-07",
                "imagen_keyword": "folk dance traditional costumes",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            # EVENTOS FUTUROS (2025 - próximos)
            {
                "titulo": "Festival de Música Electrónica",
                "descripcion": "Festival de música electrónica que fusiona ritmos tradicionales con sonidos modernos y tecnología.",
                "categoria": "Música",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": "2025-05-15",
                "fecha_fin": "2025-05-17",
                "imagen_keyword": "electronic music festival dj lights",
                "horario_apertura": "10:00",
                "horario_cierre": "22:00",
            },
            {
                "titulo": "Torneo de Fútbol Cultural",
                "descripcion": "Torneo de fútbol que promueve valores culturales y comunitarios, con equipos representando diferentes barrios.",
                "categoria": "Identidad",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": "2025-06-20",
                "fecha_fin": "2025-06-22",
                "imagen_keyword": "community soccer tournament field",
                "horario_apertura": "08:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Exposición de Arte Digital",
                "descripcion": "Exposición de arte digital y multimedia que explora las nuevas formas de expresión artística.",
                "categoria": "Plástica",
                "centro": "Galería de Arte Contemporáneo",
                "fecha_inicio": "2025-07-10",
                "fecha_fin": "2025-08-15",
                "imagen_keyword": "digital art installation multimedia",
                "horario_apertura": "10:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Festival de Videojuegos Indie",
                "descripcion": "Festival que celebra los videojuegos independientes con demostraciones, competencias y charlas sobre desarrollo.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": "2025-08-05",
                "fecha_fin": "2025-08-07",
                "imagen_keyword": "indie video games development showcase",
                "horario_apertura": "10:00",
                "horario_cierre": "22:00",
            },
            {
                "titulo": "Encuentro de Poetas Urbanos",
                "descripcion": "Encuentro de poetas que exploran la vida urbana y las realidades contemporáneas a través de la poesía.",
                "categoria": "Literatura",
                "centro": "Biblioteca Popular",
                "fecha_inicio": "2025-09-12",
                "fecha_fin": "2025-09-14",
                "imagen_keyword": "urban poetry slam performance",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Teatro Callejero",
                "descripcion": "Festival de teatro callejero que lleva el arte dramático a los espacios públicos de la ciudad.",
                "categoria": "Teatro",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": "2025-10-18",
                "fecha_fin": "2025-10-20",
                "imagen_keyword": "street theater performance public space",
                "horario_apertura": "19:00",
                "horario_cierre": "23:00",
            },
            # 5 EVENTOS ADICIONALES PUBLICADOS
            {
                "titulo": "Festival de Cine Independiente",
                "descripcion": "Festival dedicado al cine independiente argentino con proyecciones, charlas con directores y talleres de realización.",
                "categoria": "Cine y Audiovisual",
                "centro": "Auditorio Municipal",
                "fecha_inicio": "2025-11-05",
                "fecha_fin": "2025-11-08",
                "imagen_keyword": "independent film festival cinema",
                "horario_apertura": "10:00",
                "horario_cierre": "22:00",
            },
            {
                "titulo": "Exposición de Esculturas Monumentales",
                "descripcion": "Exposición al aire libre de esculturas monumentales de artistas locales e internacionales en espacios públicos.",
                "categoria": "Plástica",
                "centro": "Centro Cultural del Bicentenario",
                "fecha_inicio": "2025-11-15",
                "fecha_fin": "2025-12-15",
                "imagen_keyword": "monumental sculptures outdoor art",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Festival de Música Clásica",
                "descripcion": "Festival de música clásica con orquestas, solistas y coros interpretando obras de compositores argentinos y universales.",
                "categoria": "Música",
                "centro": "Teatro 25 de Mayo",
                "fecha_inicio": "2025-12-01",
                "fecha_fin": "2025-12-03",
                "imagen_keyword": "classical music orchestra symphony",
                "horario_apertura": "10:00",
                "horario_cierre": "20:00",
            },
            {
                "titulo": "Encuentro de Narradores Orales",
                "descripcion": "Encuentro de narradores orales que comparten historias, cuentos y leyendas de la tradición popular.",
                "categoria": "Mitos y Leyendas",
                "centro": "Casa de la Cultura",
                "fecha_inicio": "2025-12-10",
                "fecha_fin": "2025-12-12",
                "imagen_keyword": "oral storytelling traditional tales",
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Festival de Gastronomía Regional",
                "descripcion": "Festival que celebra la diversidad gastronómica del norte argentino con chefs locales y regionales.",
                "categoria": "Gastronomía",
                "centro": "Centro Cultural Municipal",
                "fecha_inicio": "2025-12-20",
                "fecha_fin": "2025-12-22",
                "imagen_keyword": "regional gastronomy food festival",
                "horario_apertura": "10:00",
                "horario_cierre": "18:00",
            },
            # EVENTOS NO PUBLICADOS (BORRADORES) - SOLO 5
            {
                "titulo": "Festival de Jazz Internacional",
                "descripcion": "Festival de jazz que traerá músicos internacionales y nacionales para celebrar este género musical.",
                "categoria": "Música",
                "centro": "Centro de Música Popular",
                "fecha_inicio": "2025-11-15",
                "fecha_fin": "2025-11-17",
                "imagen_keyword": "jazz festival saxophone musicians",
                "publicado": False,
                "horario_apertura": "10:00",
                "horario_cierre": "22:00",
            },
            {
                "titulo": "Exposición de Arte Digital",
                "descripcion": "Exposición de arte digital y multimedia que explorará las nuevas tecnologías en el arte contemporáneo.",
                "categoria": "Plástica",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": "2025-12-01",
                "fecha_fin": "2025-12-31",
                "imagen_keyword": "digital art virtual reality installation",
                "publicado": False,
                "horario_apertura": "09:00",
                "horario_cierre": "18:00",
            },
            {
                "titulo": "Festival de Cine Documental",
                "descripcion": "Festival dedicado al cine documental con enfoque en historias locales y regionales.",
                "categoria": "Cine y Audiovisual",
                "centro": "Centro de Música Popular",
                "fecha_inicio": "2025-12-10",
                "fecha_fin": "2025-12-12",
                "imagen_keyword": "documentary film festival screening",
                "publicado": False,
                "horario_apertura": "10:00",
                "horario_cierre": "22:00",
            },
            {
                "titulo": "Encuentro de Escritores Jóvenes",
                "descripcion": "Encuentro de escritores jóvenes que compartirán sus obras y experiencias literarias.",
                "categoria": "Literatura",
                "centro": "Espacio de Arte Digital",
                "fecha_inicio": "2025-12-15",
                "fecha_fin": "2025-12-17",
                "imagen_keyword": "young writers workshop literature",
                "publicado": False,
                "horario_apertura": "09:00",
                "horario_cierre": "17:00",
            },
            {
                "titulo": "Festival de Teatro Experimental",
                "descripcion": "Festival de teatro experimental que explorará nuevas formas de expresión dramática.",
                "categoria": "Teatro",
                "centro": "Centro de Música Popular",
                "fecha_inicio": "2026-01-10",
                "fecha_fin": "2026-01-12",
                "imagen_keyword": "experimental theater performance",
                "publicado": False,
                "horario_apertura": "10:00",
                "horario_cierre": "20:00",
            },
        ]

        for evento_data in eventos_data:
            # Verificar que la categoría y centro existan
            categoria_nombre = evento_data["categoria"]
            centro_nombre = evento_data["centro"]

            if categoria_nombre not in categorias:
                self.stdout.write(
                    self.style.WARNING(
                        f"Categoría '{categoria_nombre}' no encontrada, saltando evento: {evento_data['titulo']}"
                    )
                )
                continue

            if centro_nombre not in centros:
                self.stdout.write(
                    self.style.WARNING(
                        f"Centro '{centro_nombre}' no encontrado, saltando evento: {evento_data['titulo']}"
                    )
                )
                continue

            # Convertir fechas de string a datetime
            fecha_inicio = datetime.strptime(evento_data["fecha_inicio"], "%Y-%m-%d")
            fecha_fin = datetime.strptime(evento_data["fecha_fin"], "%Y-%m-%d")

            evento, created = Evento.objects.get_or_create(
                titulo=evento_data["titulo"],
                defaults={
                    "descripcion": evento_data["descripcion"],
                    "categoria": categorias[categoria_nombre],
                    "centro_cultural": centros[centro_nombre],
                    "fecha_inicio": fecha_inicio,
                    "fecha_fin": fecha_fin,
                    "publicado": evento_data.get("publicado", True),
                    "creado_por": editor,
                    "horario_apertura": time.fromisoformat(
                        evento_data["horario_apertura"]
                    ),
                    "horario_cierre": time.fromisoformat(evento_data["horario_cierre"]),
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
            else:
                self.stdout.write(f"Evento ya existe: {evento.titulo}")

        self.stdout.write(
            self.style.SUCCESS("¡Población de datos completada exitosamente!")
        )

    def descargar_imagen_unsplash(self, keyword, access_key):
        """Descarga una imagen de Unsplash basada en una palabra clave"""
        try:
            # Buscar imagen en Unsplash
            search_url = "https://api.unsplash.com/search/photos"
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

        except Exception:
            self.stdout.write("Error descargando imagen de Unsplash")
            return None
