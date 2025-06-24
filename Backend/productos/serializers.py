from .models import Usuario, Cliente, Proveedor, Producto, Categoria, Movimiento, Reporte, ProductoCotizado, Cotizacion
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)  # <-- Agrega esto

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'rol', 'telefono', 'created_at', 'updated_at', 'password', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance



class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'



class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class MovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Movimiento
        fields = ['id', 'tipoMovimiento', 'fecha', 'cantidad', 'producto', 'producto_nombre']

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = ['id', 'archivo', 'fecha_generacion', 'usuario']
        read_only_fields = ['usuario']

class ProductoCotizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoCotizado
        fields = ['producto', 'cantidad', 'precioUnitario', 'subtotal']

class CotizacionSerializer(serializers.ModelSerializer):
    productos_cotizados = ProductoCotizadoSerializer(many=True)

    class Meta:
        model = Cotizacion
        fields = ['id', 'fecha', 'subtotal', 'iva', 'total', 'cliente', 'usuario', 'productos_cotizados']

    def create(self, validated_data):
        productos_data = validated_data.pop('productos_cotizados')
        cotizacion = Cotizacion.objects.create(**validated_data)

        for prod in productos_data:
            ProductoCotizado.objects.create(cotizacion=cotizacion, **prod)

        return cotizacion