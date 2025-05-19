from rest_framework import serializers
from .models import Evento, Categoria, CentroCultural


class EventoSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(required=False)

    class Meta:
        model = Evento
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        if instance.imagen and request:
            representation["imagen"] = request.build_absolute_uri(instance.imagen.url)
        return representation

    def validate(self, data):
        fecha_inicio = data.get("fecha_inicio")
        fecha_fin = data.get("fecha_fin")

        if fecha_inicio and not fecha_fin:
            data["fecha_fin"] = fecha_inicio

        if fecha_inicio and fecha_fin:
            if fecha_inicio > fecha_fin:
                raise serializers.ValidationError(
                    "La fecha de inicio no puede ser posterior a la fecha de fin."
                )
        return data


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"

    def validate_nombre(self, value):
        if Categoria.objects.filter(nombre__iexact=value).exists():
            raise serializers.ValidationError("Esta categoría ya existe.")
        return value


class CentroCulturalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentroCultural
        fields = "__all__"
