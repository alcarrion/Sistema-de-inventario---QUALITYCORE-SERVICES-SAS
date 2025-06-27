from django.urls import path, include
from .views import (
    LoginView, ForgotPasswordView, ResetPasswordView, UsuarioListCreateView, 
    UsuarioDetailView, ChangePasswordView, ClienteListCreateView, ClienteDetailView, 
    ProveedorListCreateView, ProveedorDetailView, ProductoListCreateView, ProductoDetailView, 
    CategoriaListCreateView, CategoriaDetailView, MovimientoListCreateView, ReporteListView,  
    GenerarReportePDFView, GenerarCotizacionView, CotizacionListView, CotizacionDetailView, 
    GenerarCotizacionPDFView, AlertaListView, AlertaUpdateView
)

urlpatterns = [
    # Auth
    path('login/', LoginView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
    path('change-password/', ChangePasswordView.as_view()), 

    # Users
    path('users/', UsuarioListCreateView.as_view()),         
    path('users/<int:pk>/', UsuarioDetailView.as_view()),    
    
    # Customers
    path('customers/', ClienteListCreateView.as_view()),
    path('customers/<int:pk>/', ClienteDetailView.as_view()),

    # Suppliers
    path('suppliers/', ProveedorListCreateView.as_view()),
    path('suppliers/<int:pk>/', ProveedorDetailView.as_view()),
    
    # Products
    path('products/', ProductoListCreateView.as_view()),
    path('products/<int:pk>/', ProductoDetailView.as_view()),

    # Categories
    path('categories/', CategoriaListCreateView.as_view()),
    path('categories/<int:pk>/', CategoriaDetailView.as_view()),

    # Movements
    path('movements/', MovimientoListCreateView.as_view()),

    # Reports
    path('reports/generate/', GenerarReportePDFView.as_view()),
    path('reports/', ReporteListView.as_view()),  # ← para historial
    
    # Quotations
    path('quotations/generate/', GenerarCotizacionView.as_view()),
    path('quotations/', CotizacionListView.as_view()),
    path('quotations/<int:pk>/', CotizacionDetailView.as_view()),
    path('quotations/<int:cotizacion_id>/pdf/', GenerarCotizacionPDFView.as_view(), name='quotation-pdf'),

    # Alerts
    path('alerts/', AlertaListView.as_view(), name='alerts-list'),
    path("alerts/<int:pk>/", AlertaUpdateView.as_view(), name="alert-update"),
]
