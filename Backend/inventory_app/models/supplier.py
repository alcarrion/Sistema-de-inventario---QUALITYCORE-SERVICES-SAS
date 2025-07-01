from django.db import models
from django.core.validators import RegexValidator

class Supplier(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, blank=True, null=True)
    tax_id = models.CharField(max_length=20)
    phone = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='El teléfono debe tener exactamente 10 dígitos.',
                code='invalid_phone'
            )
        ]
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
