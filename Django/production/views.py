from django.db import transaction

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

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

        return Response(
            {"can_produce": True},
            status=status.HTTP_200_OK
        )



    @action(detail=True, methods=['post'])
    def produce(self, request, pk=None):
        product = self.get_object()
        quantity = int(request.data.get("quantity", 1))

        relations = ProductRawMaterial.objects.filter(product=product)

        # 1️⃣ Verificação (NÃO altera nada)
        for relation in relations:
            raw_material = relation.raw_material
            required = relation.quantity * quantity

            if raw_material.stock < required:
                return Response(
                    {
                        "success": False,
                        "message": "Insufficient stock",
                        "raw_material": raw_material.name,
                        "required": required,
                        "available": raw_material.stock
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 2️⃣ Produção (transação)
        with transaction.atomic():
            for relation in relations:
                raw_material = relation.raw_material
                required = relation.quantity * quantity

                raw_material.stock -= required
                raw_material.save()

        return Response(
            {
                "success": True,
                "product": product.name,
                "quantity_produced": quantity
            },
            status=status.HTTP_200_OK
        )
