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
    UserListSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.timezone import now
import logging
import re


class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["titulo", "descripcion"]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # Admin users can see all events, regular users only see their own
            if user.is_staff:
                return Evento.objects.all()
            else:
                return Evento.objects.filter(creado_por=user)
        return Evento.objects.filter(publicado=True)

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
            # Admin users can see all centers, regular users only see their own
            if user.is_staff:
                return CentroCultural.objects.all()
            else:
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
    permission_classes = [IsAdmin]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            return Response({"username": user.username})
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, user_id):
        admin_password = request.data.get("admin_password")
        if not admin_password or not request.user.check_password(admin_password):
            return Response(
                {"error": "Contraseña de administrador incorrecta."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        data = request.data
        if "email" in data:
            user.email = data["email"]
        if "password" in data and data["password"]:
            user.set_password(data["password"])
        if "username" in data:
            user.username = data["username"]
        # --- Role/group management ---
        from django.contrib.auth.models import Group

        role = data.get("role", "")
        editor_group, _ = Group.objects.get_or_create(name="Editor")
        if role == "editor":
            user.groups.add(editor_group)
            user.is_staff = False
        else:
            user.groups.remove(editor_group)
        if role == "admin":
            user.is_staff = True
        elif role != "admin":
            user.is_staff = False
        user.save()
        from .serializers import UserListSerializer

        return Response(UserListSerializer(user).data)

    def delete(self, request, user_id):
        import json

        try:
            body = (
                request.data
                if hasattr(request, "data") and request.data
                else json.loads(request.body.decode())
            )
        except Exception:
            body = {}
        admin_password = body.get("admin_password")
        if not admin_password or not request.user.check_password(admin_password):
            return Response(
                {"error": "Contraseña de administrador incorrecta."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response(
                {"message": "User deleted"}, status=status.HTTP_204_NO_CONTENT
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


logger = logging.getLogger("login")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token


SQL_PATTERNS = [
    r"(?i)\bSELECT\b",
    r"(?i)\bDROP\b",
    r"(?i)\bINSERT\b",
    r"(?i)\bUPDATE\b",
    r"(?i)\bDELETE\b",
    r"(?i)\bDROP\s+TABLE\b",
    r"(?i)\bDROP\s+TABLE\s+\w+\b",
    r"' OR '1'='1",
    r"--",
    r";",
    r"' --",
    r"\" --",
]

sql_logger = logging.getLogger("sql_injection")


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        ip = request.META.get("REMOTE_ADDR")
        username = request.data.get("username", "<sin-usuario>")

        for field, value in request.data.items():
            for pattern in SQL_PATTERNS:
                if re.search(pattern, str(value)):
                    sql_logger.warning(
                        f"[DETECCIÓN] Posible inyección SQL desde {ip} - parámetro: {field} = {value}"
                    )

        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            logger.info(f"[ÉXITO] Login de '{username}' desde {ip} a las {now()}")
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning(
                f"[FALLO] Login de '{username}' desde {ip} a las {now()} | Motivo: {str(e)}"
            )
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class UserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)
