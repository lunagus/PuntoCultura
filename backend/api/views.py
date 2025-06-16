from rest_framework import filters, viewsets, status, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Evento, Categoria, CentroCultural
from .serializers import (
    EventoSerializer,
    CategoriaSerializer,
    CentroCulturalSerializer,
    EditorUserCreateSerializer,
)


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
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


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


def admin_panel(request):
    return render(request, "adminpanel.html")


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            return Response({"username": user.username})
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
