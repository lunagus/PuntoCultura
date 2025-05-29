# Create your views here.
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Evento, Categoria, CentroCultural
from .serializers import EventoSerializer, CategoriaSerializer, CentroCulturalSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import EditorUserCreateSerializer


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


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class CreateEditorUserView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = EditorUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Editor user created"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
