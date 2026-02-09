from rest_framework import serializers
from .models import Product, RawMaterial, ProductRawMaterial

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name']

class ProductRawMaterialSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    raw_material_name = serializers.CharField(source='raw_material.name', read_only=True)

    class Meta:
        model = ProductRawMaterial
        fields = ['id', 'product', 'product_name', 'raw_material', 'raw_material_name', 'quantity']
