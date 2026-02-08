from rest_framework import serializers
from .models import Product, RawMaterial, ProductRawMaterial

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class ProductRawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRawMaterial
        fields = '__all__'
