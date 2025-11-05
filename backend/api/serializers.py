from rest_framework import serializers
from .models import Evento, Categoria, CentroCultural
from django.contrib.auth.models import User, Group


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"

    def validate_nombre(self, value):
        # Si estamos editando una instancia, self.instance estará presente
        categoria_id = self.instance.id if self.instance else None
        if (
            Categoria.objects.exclude(id=categoria_id)
            .filter(nombre__iexact=value)
            .exists()
        ):
            raise serializers.ValidationError("Esta categoría ya existe.")
        return value


class CentroCulturalSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(required=False)
    # Custom time fields to ensure consistent formatting
    horario_apertura = serializers.TimeField(
        format="%H:%M",
        input_formats=["%H:%M", "%H:%M:%S"],
        required=False,
        allow_null=True,
    )
    horario_cierre = serializers.TimeField(
        format="%H:%M",
        input_formats=["%H:%M", "%H:%M:%S"],
        required=False,
        allow_null=True,
    )

    class Meta:
        model = CentroCultural
        fields = "__all__"
        read_only_fields = ("creado_por",)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        if instance.imagen and request:
            representation["imagen"] = request.build_absolute_uri(instance.imagen.url)
        return representation


class EventoSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(required=False)
    categoria = CategoriaSerializer(read_only=True)
    centro_cultural = CentroCulturalSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source="categoria",
        write_only=True,
        required=False,
        allow_null=True,  # Allow setting to None
    )
    centro_cultural_id = serializers.PrimaryKeyRelatedField(
        queryset=CentroCultural.objects.all(),
        source="centro_cultural",
        write_only=True,
        required=False,
        allow_null=True,  # Allow setting to None
    )
    # Custom date fields to ensure consistent formatting
    fecha_inicio = serializers.DateField(
        format="%Y-%m-%d", input_formats=["%Y-%m-%d", "%d/%m/%Y"]
    )
    fecha_fin = serializers.DateField(
        format="%Y-%m-%d",
        input_formats=["%Y-%m-%d", "%d/%m/%Y"],
        required=False,
        allow_null=True,
    )
    # Custom time fields to ensure consistent formatting
    horario_apertura = serializers.TimeField(
        format="%H:%M",
        input_formats=["%H:%M", "%H:%M:%S"],
        required=False,
        allow_null=True,
    )
    horario_cierre = serializers.TimeField(
        format="%H:%M",
        input_formats=["%H:%M", "%H:%M:%S"],
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Evento
        fields = "__all__"
        read_only_fields = ("creado_por",)

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


class EditorUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
        user.is_staff = True
        editor_group = Group.objects.get(name="Editor")
        user.groups.add(editor_group)
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, slug_field="name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "groups"]
