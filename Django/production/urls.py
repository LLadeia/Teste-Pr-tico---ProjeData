from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    RawMaterialViewSet,
    ProductRawMaterialViewSet,
    ProductionLogViewSet,
    AuditoryViewSet,
    get_user_info
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'raw-materials', RawMaterialViewSet)
router.register(r'product-raw-materials', ProductRawMaterialViewSet)
router.register(r'production-logs', ProductionLogViewSet, basename='production-log')
router.register(r'auditory', AuditoryViewSet, basename='auditory')

urlpatterns = [
    path('auth/user/', get_user_info, name='user-info'),
    path('', include(router.urls)),
]
