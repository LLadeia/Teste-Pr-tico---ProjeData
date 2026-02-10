from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, RawMaterial, ProductRawMaterial, ProductionLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_superuser', 'is_staff', 'first_name', 'last_name']

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price']

class ProductRawMaterialSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    raw_material_name = serializers.CharField(source='raw_material.name', read_only=True)

    class Meta:
        model = ProductRawMaterial
        fields = ['id', 'product', 'product_name', 'raw_material', 'raw_material_name', 'quantity']

class ProductionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionLog
        fields = '__all__'


class HistorySerializer(serializers.Serializer):
    """Serializer para histórico de alterações"""
    id = serializers.IntegerField()
    model = serializers.CharField()
    object_id = serializers.IntegerField()
    object_str = serializers.CharField()
    changed_by = serializers.CharField()
    changed_at = serializers.DateTimeField()
    change_reason = serializers.CharField()
    changes = serializers.JSONField()

class ProductionLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductionLog
        fields = ['id', 'product', 'product_name', 'quantity', 'created_at']
