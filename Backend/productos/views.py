from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from .serializers import UserSerializer
from .models import Usuario

User = get_user_model()

# --- LOGIN ---
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        # Nota: Si tu modelo de usuario tiene USERNAME_FIELD = 'email'
        user = authenticate(request, username=email, password=password)
        if user:
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
class UsuarioListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # Solo admins pueden crear/consultar

# --- EDITAR PERFIL DE USUARIO ---
class UsuarioDetailView(generics.RetrieveUpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Si quieres que solo el usuario pueda editar su perfil, usa:
    # def get_object(self):
    #     obj = super().get_object()
    #     if self.request.user != obj:
    #         raise PermissionDenied("No puedes editar otro usuario.")
    #     return obj

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
