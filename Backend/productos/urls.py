from django.urls import path, include
from .views import LoginView, ForgotPasswordView, ResetPasswordView, UsuarioListCreateView, UsuarioDetailView, ChangePasswordView, ClienteListCreateView, ClienteDetailView, ProveedorListCreateView, ProveedorDetailView, ProductoListCreateView, ProductoDetailView, CategoriaListCreateView, CategoriaDetailView, MovimientoListCreateView, ReporteListView,  GenerarReportePDFView, GenerarCotizacionView, CotizacionListView, CotizacionDetailView, GenerarCotizacionPDFView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
    path('usuarios/', UsuarioListCreateView.as_view()),         # POST para crear, GET para listar
    path('usuarios/<int:pk>/', UsuarioDetailView.as_view()),    # PATCH para editar perfil
    path('change-password/', ChangePasswordView.as_view()),     # POST para cambiar contraseña


    path('customers/', ClienteListCreateView.as_view()),
    path('customers/<int:pk>/', ClienteDetailView.as_view()),


    path('suppliers/', ProveedorListCreateView.as_view()),
    path('suppliers/<int:pk>/', ProveedorDetailView.as_view()),

    path('products/', ProductoListCreateView.as_view()),
    path('products/<int:pk>/', ProductoDetailView.as_view()),


    path('categories/', CategoriaListCreateView.as_view()),
    path('categories/<int:pk>/', CategoriaDetailView.as_view()),

    path('movimientos/', MovimientoListCreateView.as_view()),

    path('reportes/generar/', GenerarReportePDFView.as_view()),
    path('reportes/', ReporteListView.as_view()),  # ← para historial

    path('cotizaciones/generar/', GenerarCotizacionView.as_view()),
    path('cotizaciones/', CotizacionListView.as_view()),
    path('cotizaciones/<int:pk>/', CotizacionDetailView.as_view()),
    path('cotizaciones/<int:cotizacion_id>/pdf/', GenerarCotizacionPDFView.as_view(), name='cotizacion-pdf'),



]
