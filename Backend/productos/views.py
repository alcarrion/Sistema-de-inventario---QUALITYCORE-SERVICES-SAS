from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions,viewsets
from rest_framework.permissions import BasePermission
from .serializers import UserSerializer, ClienteSerializer, ProveedorSerializer, ProductoSerializer, CategoriaSerializer
from .models import Usuario, Cliente, Proveedor, Producto, Categoria


User = get_user_model()

# --- LOGIN ---
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user:
            # ⬇️ Verifica si el usuario está inactivo
            if not user.is_active:
                return Response(
                    {'message': 'Usuario inactivo. Contacta al administrador.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            login(request, user)
            serializer = UserSerializer(user)
            return Response({'message': 'Login exitoso', 'user': serializer.data})
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)


# --- RECUPERAR CONTRASEÑA (EMAIL LINK) ---
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = user.pk
            frontend_url = 'http://localhost:3000/reset-password'  # Cambia esto a tu URL del frontend
            reset_url = f"{frontend_url}?uid={uid}&token={token}"

            send_mail(
                subject="Recupera tu contraseña",
                message=(
                    f"Hola,\n\n"
                    f"Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en QualityCore Services.\n\n"
                    f"Para crear una nueva contraseña, haz clic en el siguiente enlace o cópialo y pégalo en tu navegador:\n"
                    f"{reset_url}\n\n"
                    f"Si tú no solicitaste este cambio, puedes ignorar este correo y tu contraseña actual seguirá siendo válida. Si tienes alguna duda o detectas actividad sospechosa, por favor comunícate con la administradora.\n\n"
                    f"Gracias por confiar en nosotros.\n"
                    f"Equipo de QualityCore Services"
                ),
                from_email=None,  # Usa el DEFAULT_FROM_EMAIL de tu settings
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({'message': f'Se ha enviado un correo a {email} para recuperar la contraseña.'})
        except User.DoesNotExist:
            return Response({'message': 'No existe un usuario con ese correo.'}, status=status.HTTP_400_BAD_REQUEST)



# --- RESETEAR CONTRASEÑA (después de hacer click en el enlace del email) ---
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

# --- LISTAR/CREAR USUARIOS (solo admin normalmente) ---
class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        print(f"CHECKING has_permission")
        return request.user and request.user.is_authenticated and request.user.rol == "Administrador"
    
class UsuarioListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdministrador]  # Solo admins pueden crear/consultar

# --- EDITAR PERFIL DE USUARIO ---
class UsuarioDetailView(generics.RetrieveUpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdministrador]

# --- CAMBIAR CONTRASEÑA DESDE PERFIL ---
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
    permission_classes = [permissions.IsAuthenticated]  # Todos pueden ver, solo admins crear

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden crear clientes.")
        serializer.save()

class ClienteDetailView(generics.RetrieveUpdateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]  # Todos pueden ver, solo admins edit

    def perform_update(self, serializer):
        user = self.request.user
        if user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden editar/eliminar clientes.")
        serializer.save()



# --- PROVEEDORES ---
class ProveedorListCreateView(generics.ListCreateAPIView):
    queryset = Proveedor.objects.filter(deleted_at__isnull=True)
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]  # Todos pueden ver, solo admins crear

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden crear proveedores.")
        serializer.save()

class ProveedorDetailView(generics.RetrieveUpdateAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]  # Todos pueden ver, solo admins edit

    def perform_update(self, serializer):
        user = self.request.user
        if user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden editar/eliminar proveedores.")
        serializer.save()


# --- PRODUCTOS ---
class ProductoListCreateView(generics.ListCreateAPIView):
    queryset = Producto.objects.filter(deleted_at__isnull=True)
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]  # Todos pueden ver, solo admins crear

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden crear productos.")
        serializer.save()

class ProductoDetailView(generics.RetrieveUpdateAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]  # Todos pueden ver, solo admins edit

    def perform_update(self, serializer):
        user = self.request.user
        if user.rol != "Administrador":
            raise PermissionDenied("Solo administradores pueden editar/eliminar productos.")
        serializer.save()



# --- CATEGORIAS ---
class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class CategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer