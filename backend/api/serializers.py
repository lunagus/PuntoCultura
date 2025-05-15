from rest_framework import serializers
from .models import Evento, Categoria, CentroCultural

class EventoSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = '__all__'

    def get_imagen(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class CentroCulturalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentroCultural
        fields = '__all__'
