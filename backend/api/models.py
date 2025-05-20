from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class CentroCultural(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to="centros/")
    ubicacion_lat = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    ubicacion_lon = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    direccion = models.CharField(max_length=255, null=True, blank=True)
    publicado = models.BooleanField(default=False)
    creado_por = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.nombre


class Evento(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to="eventos/")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, blank=True
    )
    centro_cultural = models.ForeignKey(
        CentroCultural, on_delete=models.SET_NULL, null=True, blank=True
    )
    publicado = models.BooleanField(default=False)
    creado_por = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.titulo
