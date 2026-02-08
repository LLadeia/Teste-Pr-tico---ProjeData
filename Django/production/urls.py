from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    RawMaterialViewSet,
    ProductRawMaterialViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'raw-materials', RawMaterialViewSet)
router.register(r'product-raw-materials', ProductRawMaterialViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
