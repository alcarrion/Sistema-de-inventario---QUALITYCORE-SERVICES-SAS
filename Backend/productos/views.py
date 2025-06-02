from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user:
            serializer = UserSerializer(user)
            return Response({'message': 'Login exitoso', 'user': serializer.data})
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Aquí deberías enviar un correo real, por ahora solo simula
            return Response({'message': f'Se ha enviado un correo a {email} para recuperar la contraseña.'})
        except User.DoesNotExist:
            return Response({'message': 'No existe un usuario con ese correo.'}, status=status.HTTP_400_BAD_REQUEST)
