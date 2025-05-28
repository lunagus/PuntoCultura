from django.contrib import admin

# Register your models here.

from .models import Evento, Categoria, CentroCultural
from django.contrib.auth.models import Group, Permission

admin.site.register(Evento)
admin.site.register(Categoria)
admin.site.register(CentroCultural)

editor_group, created = Group.objects.get_or_create(name="editor")

permisos = Permission.objects.filter(
    content_type__model__in=["evento", "centrocultural"],
    codename__in=[
        "add_evento",
        "change_evento",
        "add_centrocultural",
        "change_centrocultural",
    ],
)

editor_group.permissions.set(permisos)
