from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator

# --- Usuario ---
class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email debe ser obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    username = None  # Elimina el username
    email = models.EmailField('email address', unique=True)
    nombre = models.CharField(max_length=100)

    # Agrega los choices para rol
    ROL_CHOICES = [
        ('Administrador', 'Administrador'),
        ('Usuario', 'Usuario'),
    ]
    rol = models.CharField(max_length=50, choices=ROL_CHOICES)

    # Agrega la validación de teléfono
    telefono = models.CharField(
        max_length=10,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='El teléfono debe tener exactamente 10 dígitos.',
                code='invalid_telefono'
            )
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'rol']

    objects = UsuarioManager()

    def __str__(self):
        return self.email


# --- Proveedor ---
class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(max_length=100, blank=True, null=True)
    RUC = models.CharField(max_length=20)
    telefono = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='El teléfono debe tener exactamente 10 dígitos.',
                code='invalid_telefono'
            )
        ]
    )
    direccion = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.nombre


# --- Cliente ---
class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(max_length=100, blank=True, null=True)
    cedulaRUC = models.CharField(max_length=20)
    telefono = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='El teléfono debe tener exactamente 10 dígitos.',
                code='invalid_telefono'
            )
        ]
    )
    direccion = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.nombre


# --- Categoria ---
class Categoria(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return self.nombre


# --- Producto ---
class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stockActual = models.IntegerField(default=0)
    stockMinimo = models.IntegerField()
    estado = models.CharField(max_length=50)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name='productos')
    imagen = models.ImageField(upload_to="productos/", null=True, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.nombre


# --- Alerta ---
class Alerta(models.Model):
    TIPO_CHOICES = [
        ('stock_bajo', 'Stock bajo'),
        ('stock_uno', 'Solo una unidad'),
        ('stock_critico', 'Sin stock'),
    ]

    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='stock_bajo')
    mensaje = models.TextField()
    producto = models.ForeignKey('Producto', on_delete=models.CASCADE, related_name='alertas')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"[{self.get_tipo_display()}] {self.producto.nombre}"


# --- Movimiento ---
class Movimiento(models.Model):
    tipoMovimiento = models.CharField(max_length=50)
    fecha = models.DateTimeField()
    cantidad = models.IntegerField()
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='movimientos')
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='movimientos')
    stockEnMovimiento = models.IntegerField(default=0)
    cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=models.SET_NULL, related_name="movimientos") 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.tipoMovimiento} - {self.cantidad} de {self.producto.nombre}"


# --- Cotizacion ---
class Cotizacion(models.Model):
    fecha = models.DateField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    iva = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # 15% del subtotal
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # subtotal + iva
    observaciones = models.TextField(blank=True, null=True)

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='cotizaciones')
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='cotizaciones')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Cotización {self.id}"


# --- Producto Cotizado ---
class ProductoCotizado(models.Model):
    cantidad = models.IntegerField()
    precioUnitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  

    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='productos_cotizados')
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name='productos_cotizados')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} en cotización {self.cotizacion.id}"


# --- Reporte ---
class Reporte(models.Model):
    archivo = models.FileField(upload_to='reportes/')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    fecha_generacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reporte de {self.usuario.nombre} el {self.fecha_generacion.strftime('%Y-%m-%d %H:%M')}"
