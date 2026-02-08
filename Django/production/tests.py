from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from .models import Product
from .models import RawMaterial
from .models import ProductRawMaterial

from .services import calculate_production_suggestion


class ProductionServiceTest(TestCase):

    def setUp(self):
        self.product = Product.objects.create(
            code="P001",
            name="High Value Product",
            price=100
        )

        self.material = RawMaterial.objects.create(
            code="RM001",
            name="Steel",
            stock_quantity=10
        )

        ProductRawMaterial.objects.create(
            product=self.product,
            raw_material=self.material,
            required_quantity=2
        )

    def test_production_calculation(self):
        result = calculate_production_suggestion()

        self.assertEqual(len(result["items"]), 1)
        self.assertEqual(result["items"][0]["quantity"], 5)
        self.assertEqual(result["total_value"], 500)
