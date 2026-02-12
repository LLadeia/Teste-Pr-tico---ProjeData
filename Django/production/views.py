from django.db import transaction
from django.contrib.auth.models import User

from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Product, RawMaterial, ProductRawMaterial, ProductionLog
from simple_history.models import HistoricalRecords

from .serializers import (
    ProductSerializer,
    RawMaterialSerializer,
    ProductRawMaterialSerializer,
    ProductionLogSerializer,
    HistorySerializer,
    UserSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """Endpoint para retornar informações do usuário autenticado"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class RawMaterialViewSet(ModelViewSet):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer
    permission_classes = [IsAuthenticated]



class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

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
            # Atualiza estoque do produto produzido
            try:
                product.stock = (product.stock or 0) + quantity
                product.save()
            except Exception:
                pass

            # Registra produção com preços
            unit_price = product.price or 0
            total_price = unit_price * quantity
            ProductionLog.objects.create(product=product, quantity=quantity, unit_price=unit_price, total_price=total_price)

        return Response({"success": True})



class ProductRawMaterialViewSet(ModelViewSet):
    queryset = ProductRawMaterial.objects.all()
    serializer_class = ProductRawMaterialSerializer
    permission_classes = [IsAuthenticated]


class ProductionLogViewSet(ModelViewSet):
    queryset = ProductionLog.objects.all()
    serializer_class = ProductionLogSerializer
    ordering = ['-created_at']
    permission_classes = [IsAuthenticated]


class IsAdminUser(IsAuthenticated):
    """Permissão customizada para apenas superusuários"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_superuser


class AuditoryViewSet(ViewSet):
    """ViewSet para visualizar histórico de alterações - somente para superusuários"""
    permission_classes = [IsAdminUser]

    def list(self, request):
        """Retorna histórico de todas as alterações"""
        changes = []

        # Histórico de Produtos
        for history in Product.history.all().order_by('-history_date'):
            changes.append({
                "id": history.id,
                "model": "Product",
                "object_id": history.id,
                "object_str": f"Produto: {history.name}",
                "changed_by": history.history_user.username if history.history_user else "Sistema",
                "changed_at": history.history_date,
                "change_reason": history.get_history_type_display(),
                "changes": {
                    "name": history.name,
                    "price": str(history.price) if history.price else None
                }
            })

        # Histórico de Matérias-Primas
        for history in RawMaterial.history.all().order_by('-history_date'):
            changes.append({
                "id": history.id,
                "model": "RawMaterial",
                "object_id": history.id,
                "object_str": f"Matéria-Prima: {history.name}",
                "changed_by": history.history_user.username if history.history_user else "Sistema",
                "changed_at": history.history_date,
                "change_reason": history.get_history_type_display(),
                "changes": {
                    "name": history.name,
                    "stock": history.stock
                }
            })

        # Histórico de Relações Produto-Matéria Prima
        for history in ProductRawMaterial.history.all().order_by('-history_date'):
            product_name = history.product.name if history.product else "Deletado"
            raw_mat_name = history.raw_material.name if history.raw_material else "Deletada"
            changes.append({
                "id": history.id,
                "model": "ProductRawMaterial",
                "object_id": history.id,
                "object_str": f"{product_name} - {raw_mat_name}",
                "changed_by": history.history_user.username if history.history_user else "Sistema",
                "changed_at": history.history_date,
                "change_reason": history.get_history_type_display(),
                "changes": {
                    "quantity": history.quantity
                }
            })

        # Ordenar por data decrescente
        changes.sort(key=lambda x: x['changed_at'], reverse=True)

        return Response(changes)

    @action(detail=False, methods=['get'])
    def by_model(self, request):
        """Retorna histórico filtrado por modelo"""
        model_type = request.query_params.get('model', '')
        
        if model_type == 'Product':
            histories = Product.history.all().order_by('-history_date')
        elif model_type == 'RawMaterial':
            histories = RawMaterial.history.all().order_by('-history_date')
        elif model_type == 'ProductRawMaterial':
            histories = ProductRawMaterial.history.all().order_by('-history_date')
        else:
            return Response({"error": "Model não especificado"}, status=400)

        changes = []
        for history in histories:
            changes.append({
                "id": history.id,
                "object_str": str(history),
                "changed_by": history.history_user.username if history.history_user else "Sistema",
                "changed_at": history.history_date,
                "change_reason": history.get_history_type_display(),
            })

        return Response(changes)