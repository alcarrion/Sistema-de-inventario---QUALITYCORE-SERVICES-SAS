from django.urls import path, include
from .views import LoginView, ForgotPasswordView, ResetPasswordView, UsuarioListCreateView, UsuarioDetailView, ChangePasswordView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
    path('usuarios/', UsuarioListCreateView.as_view()),         # POST para crear, GET para listar
    path('usuarios/<int:pk>/', UsuarioDetailView.as_view()),    # PATCH para editar perfil
    path('change-password/', ChangePasswordView.as_view()),     # POST para cambiar contraseña
]