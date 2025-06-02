from django.urls import path
from .views import LoginView, ForgotPasswordView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
]
