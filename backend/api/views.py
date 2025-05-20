# Create your views here.
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Evento, Categoria, CentroCultural
from .serializers import EventoSerializer, CategoriaSerializer, CentroCulturalSerializer


class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["titulo", "descripcion"]

    def get_serializer_context(self):
        return {"request": self.request}


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class CentroCulturalViewSet(viewsets.ModelViewSet):
    queryset = CentroCultural.objects.all()
    serializer_class = CentroCulturalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return CentroCultural.objects.filter(creado_por=user)
        return CentroCultural.objects.filter(publicado=True)

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
