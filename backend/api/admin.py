from django.contrib import admin
from .models import Evento, Categoria, CentroCultural

admin.site.register(Evento)
admin.site.register(Categoria)
admin.site.register(CentroCultural)
