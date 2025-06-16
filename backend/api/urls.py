from rest_framework import routers
from django.urls import path, include
from .views import (
    EventoViewSet,
    CategoriaViewSet,
    CentroCulturalViewSet,
    CreateEditorUserView,
    UserDetailView,
    admin_panel,
    CustomTokenObtainPairView,
)

# DRF router for viewsets
router = routers.DefaultRouter()
router.register(r"eventos", EventoViewSet)
router.register(r"categorias", CategoriaViewSet)
router.register(r"centros", CentroCulturalViewSet)

urlpatterns = [
    path("create-editor/", CreateEditorUserView.as_view(), name="create-editor"),
    path("users/<int:user_id>/", UserDetailView.as_view(), name="user-detail"),
    path("admin.html", admin_panel, name="admin-panel"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("", include(router.urls)),
]
