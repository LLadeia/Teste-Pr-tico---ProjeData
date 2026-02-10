from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    RawMaterialViewSet,
    ProductRawMaterialViewSet,
    ProductionLogViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'raw-materials', RawMaterialViewSet)
router.register(r'product-raw-materials', ProductRawMaterialViewSet)
router.register(r'production-logs', ProductionLogViewSet, basename='production-log')

urlpatterns = [
    path('', include(router.urls)),
]
