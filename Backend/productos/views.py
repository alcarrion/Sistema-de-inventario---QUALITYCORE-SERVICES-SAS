from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Sum, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
# Para reportes PDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.conf import settings
import os
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


from .serializers import (
    UserSerializer, ClienteSerializer, ProveedorSerializer,
    ProductoSerializer, CategoriaSerializer, MovimientoSerializer,
    ReporteSerializer, CotizacionSerializer, ProductoCotizadoSerializer, AlertaSerializer 
)

from .models import (
    Usuario, Cliente, Proveedor, Producto, Categoria, 
    Movimiento, Reporte, Cotizacion, ProductoCotizado, Alerta
)  


User = get_user_model()


# --- Login ---
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


# --- Forgot Password ---
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


# --- Reset Password ---
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


# --- Admin Rol Check ---
class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == "Administrador"


# --- Usuarios ---
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


# --- Clientes ---
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


# --- Proveedores ---
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


# --- Productos ---
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


# --- Categorias ---
class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class CategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


# --- Movimientos ---
class MovimientoListCreateView(generics.ListCreateAPIView):
    queryset = Movimiento.objects.filter(deleted_at__isnull=True).order_by("-id")
    serializer_class = MovimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.rol not in ['Administrador', 'Usuario']:
            raise PermissionDenied("No tienes permiso para registrar movimientos.")

        producto = serializer.validated_data['producto']
        cantidad = serializer.validated_data['cantidad']
        tipo = serializer.validated_data['tipoMovimiento'].lower()

        # Validar si es salida con stock insuficiente
        if tipo == "salida" and cantidad > producto.stockActual:
            raise ValidationError("No hay suficiente stock para esta salida.")

        # Aplicar cambio al stock
        if tipo == "entrada":
            producto.stockActual += cantidad
        elif tipo == "salida":
            producto.stockActual -= cantidad

        # Guardar el movimiento con el stock ya actualizado
        movimiento = serializer.save(
            usuario=self.request.user,
            stockEnMovimiento=producto.stockActual
        )

        # Verificar y crear alerta si el stock está bajo o crítico
        if producto.stockActual <= producto.stockMinimo:
            tipo_alerta = "stock_bajo"
            mensaje = f"⚠️ El producto '{producto.nombre}' está por debajo del stock mínimo ({producto.stockMinimo})."

            if producto.stockActual == 1:
                tipo_alerta = "stock_uno"
                mensaje = f"⚠️ Solo queda 1 unidad del producto '{producto.nombre}'."

            elif producto.stockActual == 0:
                tipo_alerta = "stock_critico"
                mensaje = f"🚨 El producto '{producto.nombre}' se ha quedado sin stock."

            # Evitar alertas duplicadas activas del mismo tipo
            existe = producto.alertas.filter(deleted_at__isnull=True, tipo=tipo_alerta).exists()
            if not existe:
                Alerta.objects.create(
                    producto=producto,
                    tipo=tipo_alerta,
                    mensaje=mensaje
                )

        producto.save()


# # --- Reportes ---
class GenerarReportePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        tipo = request.data.get("tipo", "movimientos")
        fecha_inicio = request.data.get("fecha_inicio")
        fecha_fin = request.data.get("fecha_fin")

        try:
            fi = datetime.strptime(fecha_inicio, "%Y-%m-%d") if fecha_inicio else None
            ff = (
                datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
                if fecha_fin else None
            )
        except Exception:
            return Response({"message": "Fechas inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        fecha_actual = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"reporte_{tipo}_{fecha_actual}.pdf"
        filepath = os.path.join(settings.MEDIA_ROOT, 'reportes', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()

        # Estilos personalizados
        styles.add(ParagraphStyle(name='TituloGrande', fontSize=20, alignment=1, spaceAfter=12))
        styles.add(ParagraphStyle(name='Subinfo', fontSize=10, textColor=colors.gray, spaceAfter=6))
        styles.add(ParagraphStyle(name='Nota', fontSize=9, textColor=colors.HexColor("#256029"), spaceBefore=10))

        elements = []

        # Línea decorativa
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))

        # Logo
        logo_path = os.path.join(settings.BASE_DIR, "static", "images", "logo.png")
        if os.path.exists(logo_path):
            img = Image(logo_path, width=90, height=40)
            img.hAlign = 'RIGHT'
            elements.append(img)

        # Título
        elements.append(Paragraph("REPORTE DE MOVIMIENTOS", styles["TituloGrande"]))
        elements.append(Spacer(1, 6))

        # Subtítulos
        elements.append(Paragraph(f"Generado por: {user.nombre}", styles["Subinfo"]))
        elements.append(Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", styles["Subinfo"]))
        elements.append(Spacer(1, 14))

        # Obtener datos
        movimientos = Movimiento.objects.filter(deleted_at__isnull=True)
        if fi:
            movimientos = movimientos.filter(fecha__gte=fi)
        if ff:
            movimientos = movimientos.filter(fecha__lte=ff)
        movimientos = movimientos.order_by("-fecha")[:50]

        # Encabezados tabla
        data = [["Fecha", "Tipo", "Producto", "Cantidad", "Cliente / Proveedor", "Vendedor"]]
        for m in movimientos:
            fecha = m.fecha.strftime("%d/%m/%Y %H:%M")
            tipo_mov = m.tipoMovimiento.title()
            producto = m.producto.nombre
            cantidad = str(m.cantidad)
            relacionado = ""

            if m.tipoMovimiento == "salida" and m.cliente:
                relacionado = m.cliente.nombre
            elif m.tipoMovimiento == "entrada" and m.producto.proveedor:
                relacionado = m.producto.proveedor.nombre

            vendedor = m.usuario.nombre if m.usuario else "N/A"

            data.append([fecha, tipo_mov, producto, cantidad, relacionado, vendedor])

        # Tabla con estilos
        tabla = Table(data, colWidths=[90, 60, 120, 50, 120, 100])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 0), (-1, 0), 6),
        ]))
        elements.append(tabla)

        # Nota final
        elements.append(Spacer(1, 16))
        elements.append(Paragraph("Este reporte contiene un máximo de 50 movimientos más recientes.", styles["Nota"]))

        doc.build(elements)

        reporte = Reporte.objects.create(
            archivo=f"reportes/{filename}",
            usuario=request.user
        )

        return Response({
            "message": "Reporte generado correctamente",
            "url": f"{settings.MEDIA_URL}{reporte.archivo}"
        })

class ReporteListView(generics.ListAPIView):
    serializer_class = ReporteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reporte.objects.filter(usuario=self.request.user).order_by("-fecha_generacion")
    

# --- Cotizacion ---
class GenerarCotizacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        productos = data.pop('productos_cotizados')

        from decimal import Decimal
        subtotal = sum(Decimal(p['precioUnitario']) * int(p['cantidad']) for p in productos)
        iva = round(subtotal * Decimal('0.15'), 2)
        total = subtotal + iva

        data['subtotal'] = subtotal
        data['iva'] = iva
        data['total'] = total
        data['usuario'] = request.user.id  # asigna automáticamente el usuario actual

        serializer = CotizacionSerializer(data={**data, 'productos_cotizados': productos})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Cotización guardada correctamente', 'cotizacion': serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CotizacionListView(generics.ListAPIView):
    serializer_class = CotizacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == "Administrador":
            return Cotizacion.objects.filter(deleted_at__isnull=True).order_by('-fecha')
        else:
            return Cotizacion.objects.filter(usuario=user, deleted_at__isnull=True).order_by('-fecha')

class CotizacionDetailView(generics.RetrieveAPIView):
    queryset = Cotizacion.objects.filter(deleted_at__isnull=True)
    serializer_class = CotizacionSerializer
    permission_classes = [IsAuthenticated]


class GenerarCotizacionPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, cotizacion_id):
        try:
            cotizacion = Cotizacion.objects.get(id=cotizacion_id, deleted_at__isnull=True)
        except Cotizacion.DoesNotExist:
            return Response({"message": "Cotización no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        fecha_actual = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"cotizacion_{cotizacion.id}_{fecha_actual}.pdf"
        filepath = os.path.join(settings.MEDIA_ROOT, 'reportes', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()

        # Estilos personalizados
        styles.add(ParagraphStyle(name='HeaderTitle', fontSize=22, leading=26, spaceAfter=14, alignment=1))
        styles.add(ParagraphStyle(name='SectionLabel', fontSize=10, spaceAfter=2, textColor=colors.gray))
        totales_style = ParagraphStyle(name='Totales', parent=styles['Normal'], fontSize=11, leading=14, textColor=colors.HexColor("#256029"), spaceAfter=4)
        total_final_style = ParagraphStyle(name='TotalBold', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor("#1f2937"), spaceBefore=5, spaceAfter=10)
        observacion_style = ParagraphStyle(name='ObsStyle', fontSize=10, leading=12, textColor=colors.HexColor("#14532d"), spaceAfter=12)

        elements = []

        # Línea decorativa superior
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))

        # Logo
        logo_path = os.path.join(settings.BASE_DIR, "static", "images", "logo.png")
        if os.path.exists(logo_path):
            img = Image(logo_path, width=90, height=40)
            img.hAlign = 'RIGHT'
            elements.append(img)

        # Título
        elements.append(Paragraph("COTIZACIÓN", styles['HeaderTitle']))
        elements.append(Spacer(1, 8))

        # Datos del cliente y fecha
        elements.append(Paragraph(f"<b>FECHA:</b> {cotizacion.fecha.strftime('%d/%m/%Y')}", styles["Normal"]))
        elements.append(Paragraph(f"<b>CLIENTE:</b> {cotizacion.cliente.nombre}", styles["Normal"]))
        elements.append(Paragraph(f"<b>VENDEDOR:</b> {cotizacion.usuario.nombre}", styles["Normal"]))
        elements.append(Spacer(1, 18))

        # Tabla de productos
        data = [["PRODUCTO", "CANTIDAD", "PRECIO", "TOTAL"]]
        for p in cotizacion.productos_cotizados.all():
            data.append([
                p.producto.nombre,
                p.cantidad,
                f"${p.precioUnitario:.2f}",
                f"${p.subtotal:.2f}"
            ])

        table = Table(data, colWidths=[200, 80, 80, 80])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10b981")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("TOPPADDING", (0, 0), (-1, 0), 6),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey])
        ]))
        elements.append(table)
        elements.append(Spacer(1, 18))

        # Totales
        elements.append(Paragraph(f"<b>Subtotal:</b> ${cotizacion.subtotal:.2f}", totales_style))
        elements.append(Paragraph(f"<b>IVA (15%):</b> ${cotizacion.iva:.2f}", totales_style))
        elements.append(Paragraph(f"<b>Total:</b> <b>${cotizacion.total:.2f}</b>", total_final_style))
        elements.append(Spacer(1, 18))

        # Observaciones
        if cotizacion.observaciones:
            elements.append(Paragraph("<b>OBSERVACIONES:</b>", styles['Normal']))
            elements.append(Spacer(1, 4))
            elements.append(Paragraph(cotizacion.observaciones, observacion_style))

        # Nota final
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("<i>⚠ Cotización válida por 30 días</i>", styles['Normal']))

        # Construir PDF
        doc.build(elements)

        # Guardar en historial
        reporte = Reporte.objects.create(
            archivo=f"reportes/{filename}",
            usuario=request.user
        )

        return Response({
            "message": "PDF generado correctamente",
            "url": f"{settings.MEDIA_URL}{reporte.archivo}"
        })


# --- Alertas ---
class AlertaListView(generics.ListAPIView):
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alerta.objects.filter(deleted_at__isnull=True).order_by("-created_at")

    
class AlertaUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            alerta = Alerta.objects.get(pk=pk, deleted_at__isnull=True)
        except Alerta.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        alerta.deleted_at = timezone.now()
        alerta.save()
        return Response({"message": "Alerta oculta con éxito"})