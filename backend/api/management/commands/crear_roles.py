from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from api.models import Evento, CentroCultural, Categoria


class Command(BaseCommand):
    help = "Crea el grupo 'Editor' con permisos CRUD sobre Evento, CentroCultural y Categoria."

    def handle(self, *args, **kwargs):
        # Check if Editor group already exists with all required permissions
        try:
            editor_group = Group.objects.get(name="Editor")

            # Get all required permissions
            models = [Evento, CentroCultural, Categoria]
            required_permissions = set()

            for model in models:
                content_type = ContentType.objects.get_for_model(model)
                for codename in ["add", "change", "delete", "view"]:
                    try:
                        perm = Permission.objects.get(
                            codename=f"{codename}_{model._meta.model_name}",
                            content_type=content_type,
                        )
                        required_permissions.add(perm)
                    except Permission.DoesNotExist:
                        self.stdout.write(
                            self.style.WARNING(
                                f"Permiso {codename} para {model.__name__} no encontrado."
                            )
                        )

            # Check if group already has all required permissions
            current_permissions = set(editor_group.permissions.all())
            missing_permissions = required_permissions - current_permissions

            if not missing_permissions:
                self.stdout.write(
                    self.style.SUCCESS(
                        "Grupo 'Editor' ya existe con todos los permisos necesarios. Saltando..."
                    )
                )
                return
            else:
                self.stdout.write(
                    f"Grupo 'Editor' existe pero faltan {len(missing_permissions)} permisos. Agregando..."
                )

        except Group.DoesNotExist:
            self.stdout.write("Grupo 'Editor' no existe. Creando...")
            editor_group = Group.objects.create(name="Editor")

        # Add missing permissions
        models = [Evento, CentroCultural, Categoria]
        permissions = []

        for model in models:
            content_type = ContentType.objects.get_for_model(model)
            for codename in ["add", "change", "delete", "view"]:
                try:
                    perm = Permission.objects.get(
                        codename=f"{codename}_{model._meta.model_name}",
                        content_type=content_type,
                    )
                    permissions.append(perm)
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Permiso {codename} para {model.__name__} no encontrado."
                        )
                    )

        # Get current permissions for the group
        current_permissions = set(editor_group.permissions.all())
        new_permissions = set(permissions)

        # Only add permissions that aren't already assigned
        permissions_to_add = new_permissions - current_permissions

        if permissions_to_add:
            editor_group.permissions.add(*permissions_to_add)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Se agregaron {len(permissions_to_add)} permisos al grupo 'Editor'."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    "Todos los permisos ya estaban asignados al grupo 'Editor'."
                )
            )
