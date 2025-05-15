from rest_framework import routers
from .views import EventoViewSet, CategoriaViewSet, CentroCulturalViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'eventos', EventoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'centros', CentroCulturalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
