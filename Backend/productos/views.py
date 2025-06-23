from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .serializers import (
    UserSerializer, ClienteSerializer, ProveedorSerializer,
    ProductoSerializer, CategoriaSerializer, MovimientoSerializer,
    ReporteSerializer  # <- NUEVO
)
from .models import Usuario, Cliente, Proveedor, Producto, Categoria, Movimiento, Reporte  # <- INCLUYE Reporte

# Para reportes PDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.conf import settings
import os
from datetime import datetime
from django.db.models import Sum, F


User = get_user_model()

# --- LOGIN ---
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user:
            if not user.is_active:
                return Response({'message': 'Usuario inactivo. Contacta al administrador.'}, status=status.HTTP_403_FORBIDDEN)
            login(request, user)
            serializer = UserSerializer(user)
            return Response({'message': 'Login exitoso', 'user': serializer.data})
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

# --- RECUPERAR CONTRASEÑA ---
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = user.pk
            frontend_url = 'http://localhost:3000/reset-password'
            reset_url = f"{frontend_url}?uid={uid}&token={token}"

            send_mail(
                subject="Recupera tu contraseña",
                message=(
                    f"Hola,\n\nHemos recibido una solicitud para restablecer tu contraseña.\n"
                    f"Enlace: {reset_url}\n\n"
                    f"Si no solicitaste esto, ignora el mensaje."
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({'message': f'Se ha enviado un correo a {email} para recuperar la contraseña.'})
        except User.DoesNotExist:
            return Response({'message': 'No existe un usuario con ese correo.'}, status=status.HTTP_400_BAD_REQUEST)

# --- RESET PASSWORD ---
class ResetPasswordView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        try:
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Contraseña cambiada correctamente'})
            else:
                return Response({'message': 'Token inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'message': 'Usuario no encontrado'}, status=status.HTTP_400_BAD_REQUEST)

# --- ADMIN ROL CHECK ---
class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == "Administrador"

# --- USUARIOS ---
class UsuarioListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdministrador]

class UsuarioDetailView(generics.RetrieveUpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdministrador]

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not user.check_password(old_password):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Contraseña cambiada correctamente'}, status=status.HTTP_200_OK)

# --- CLIENTES ---
class ClienteListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.filter(deleted_at__isnull=True)
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        if self.request.user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden crear clientes.")
        serializer.save()

class ClienteDetailView(generics.RetrieveUpdateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_update(self, serializer):
        if self.request.user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden editar clientes.")
        serializer.save()

# --- PROVEEDORES ---
class ProveedorListCreateView(generics.ListCreateAPIView):
    queryset = Proveedor.objects.filter(deleted_at__isnull=True)
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        if self.request.user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden crear proveedores.")
        serializer.save()

class ProveedorDetailView(generics.RetrieveUpdateAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_update(self, serializer):
        if self.request.user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden editar proveedores.")
        serializer.save()

# --- PRODUCTOS ---
class ProductoListCreateView(generics.ListCreateAPIView):
    queryset = Producto.objects.filter(deleted_at__isnull=True)
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        if self.request.user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden crear productos.")
        serializer.save()

class ProductoDetailView(generics.RetrieveUpdateAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_update(self, serializer):
        if self.request.user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden editar productos.")
        serializer.save()

# --- CATEGORÍAS ---
class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class CategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

# --- MOVIMIENTOS ---
class MovimientoListCreateView(generics.ListCreateAPIView):
    queryset = Movimiento.objects.filter(deleted_at__isnull=True).order_by('-fecha')
    serializer_class = MovimientoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        if self.request.user.rol not in ['Administrador', 'Usuario']:
            raise PermissionDenied("No tienes permiso para registrar movimientos.")
        serializer.save(usuario=self.request.user)

# --- REPORTES PDF ---
class GenerarReportePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        tipo = request.data.get('tipo', 'movimientos')  # Por defecto genera de movimientos

        fecha_actual = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"reporte_{tipo}_{fecha_actual}.pdf"
        filepath = os.path.join(settings.MEDIA_ROOT, 'reportes', filename)

        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        c = canvas.Canvas(filepath, pagesize=letter)
        c.setFont("Helvetica", 12)
        c.drawString(100, 750, f"Reporte: {tipo.upper()}")
        c.drawString(100, 730, f"Generado por: {user.nombre}")
        c.drawString(100, 710, f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        y = 680

        if tipo == 'movimientos':
            movimientos = Movimiento.objects.filter(deleted_at__isnull=True).order_by('-fecha')[:30]
            for mov in movimientos:
                linea = f"{mov.fecha} | {mov.tipoMovimiento} | {mov.producto.nombre} | {mov.cantidad}"
                c.drawString(100, y, linea)
                y -= 20
                if y < 100:
                    c.showPage()
                    y = 750

        elif tipo == 'top_vendidos':
            top = (
                Movimiento.objects
                .filter(tipoMovimiento='Salida')
                .values('producto__nombre')
                .annotate(total=Sum('cantidad'))
                .order_by('-total')[:10]
            )
            for item in top:
                linea = f"{item['producto__nombre']} - {item['total']} unidades vendidas"
                c.drawString(100, y, linea)
                y -= 20
                if y < 100:
                    c.showPage()
                    y = 750

        elif tipo == 'bajo_stock':
            productos = Producto.objects.filter(stockActual__lt=F('stockMinimo'), deleted_at__isnull=True)
            for p in productos:
                linea = f"{p.nombre} - Stock actual: {p.stockActual}, mínimo requerido: {p.stockMinimo}"
                c.drawString(100, y, linea)
                y -= 20
                if y < 100:
                    c.showPage()
                    y = 750

        else:
            return Response({'message': 'Tipo de reporte no válido'}, status=status.HTTP_400_BAD_REQUEST)

        c.save()

        reporte = Reporte.objects.create(
            archivo=f"reportes/{filename}",
            usuario=user
        )

        return Response({
            'message': 'Reporte generado correctamente',
            'url': f"{settings.MEDIA_URL}{reporte.archivo}"
        })


class ReporteListView(generics.ListAPIView):
    serializer_class = ReporteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reporte.objects.filter(usuario=self.request.user).order_by('-fecha_generacion')
