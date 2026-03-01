from django.urls import path
from . import views

urlpatterns = [
    path('api/add-stock/', views.add_to_portfolio),
    path('api/remove-stock/', views.remove_from_portfolio),
    path('api/portfolio/', views.get_portfolio),
]