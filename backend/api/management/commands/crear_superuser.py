from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Crea un superusuario si no existe"

    def handle(self, *args, **options):
        User = get_user_model()

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING("Superusuario ya existe. No se creará uno nuevo.")
            )
            return

        try:
            User.objects.create_superuser("admin", "admin@example.com", "admin123")
            self.stdout.write(self.style.SUCCESS("Superusuario creado exitosamente."))
        except IntegrityError:
            self.stdout.write(
                self.style.WARNING(
                    "El superusuario ya existe con ese nombre de usuario o correo electrónico."
                )
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creando superusuario {str(e)}"))
