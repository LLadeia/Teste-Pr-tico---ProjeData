from django.db import transaction

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Product, RawMaterial, ProductRawMaterial, ProductionLog

from .serializers import (
    ProductSerializer,
    RawMaterialSerializer,
    ProductRawMaterialSerializer,
    ProductionLogSerializer
)


class RawMaterialViewSet(ModelViewSet):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer



class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=['get'])
    def can_produce(self, request, pk=None):
        product = self.get_object()
        relations = ProductRawMaterial.objects.filter(product=product)

        for relation in relations:
            raw_material = relation.raw_material
            required = relation.quantity

            if raw_material.stock < required:
                return Response(
                    {
                        "can_produce": False,
                        "limiting_raw_material": raw_material.name,
                        "required": required,
                        "available": raw_material.stock
                    },
                    status=status.HTTP_200_OK
                )

        return Response({"can_produce": True})

    @action(detail=True, methods=['post'])
    def produce(self, request, pk=None):
        product = self.get_object()
        quantity = int(request.data.get("quantity", 1))

        relations = ProductRawMaterial.objects.filter(product=product)

        for relation in relations:
            raw_material = relation.raw_material
            required = relation.quantity * quantity

            if raw_material.stock < required:
                return Response(
                    {
                        "success": False,
                        "raw_material": raw_material.name
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        with transaction.atomic():
            for relation in relations:
                raw_material = relation.raw_material
                raw_material.stock -= relation.quantity * quantity
                raw_material.save()
            # Registra produção
            ProductionLog.objects.create(product=product, quantity=quantity)

        return Response({"success": True})



class ProductRawMaterialViewSet(ModelViewSet):
    queryset = ProductRawMaterial.objects.all()
    serializer_class = ProductRawMaterialSerializer


class ProductionLogViewSet(ModelViewSet):
    queryset = ProductionLog.objects.all()
    serializer_class = ProductionLogSerializer
    ordering = ['-created_at']

