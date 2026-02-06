from django.db import models

from Product.models import Product
from RawMaterial.models import RawMaterial


class ProductRawMaterial(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    raw_material = models.ForeignKey(RawMaterial, on_delete=models.CASCADE)
    required_quantity = models.PositiveIntegerField()

# Create your models here.
