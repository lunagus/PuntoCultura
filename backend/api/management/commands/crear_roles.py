from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from api.models import Evento, CentroCultural, Categoria


class Command(BaseCommand):
    help = "Crea el grupo 'Editor' con permisos CRUD sobre Evento, CentroCultural y Categoria."

    def handle(self, *args, **kwargs):
        editor_group, created = Group.objects.get_or_create(name="Editor")
        if created:
            self.stdout.write(self.style.SUCCESS("Grupo 'Editor' creado."))
        else:
            self.stdout.write("Grupo 'Editor' ya existe.")

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

        editor_group.permissions.set(permissions)
        self.stdout.write(
            self.style.SUCCESS("Permisos asignados correctamente al grupo 'Editor'.")
        )
