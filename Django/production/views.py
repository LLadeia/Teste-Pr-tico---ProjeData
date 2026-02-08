from rest_framework.viewsets import ModelViewSet
from .models import Product, RawMaterial, ProductRawMaterial
from .serializers import (
    ProductSerializer,
    RawMaterialSerializer,
    ProductRawMaterialSerializer
)

class RawMaterialViewSet(ModelViewSet):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductRawMaterialViewSet(ModelViewSet):
    queryset = ProductRawMaterial.objects.all()
    serializer_class = ProductRawMaterialSerializer
