from django.db import models


class RawMaterial(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    stock_quantity = models.PositiveIntegerField()

    def __str__(self):
        return self.name

# Create your models here.
