from django.urls import path
from . import views

urlpatterns = [
    path('api/sectors/', views.get_sectors),
    path('api/stocks/<int:sector_id>/', views.get_stocks_by_sector),
    path('api/stock/<str:symbol>/', views.get_stock_detail),
    path('api/auth/signup/', views.signup),
    path('api/auth/login/', views.login_view),
    path('api/auth/logout/', views.logout_view),
    path('api/auth/user/', views.get_user_info),
    path('api/home/sectors-with-stocks/', views.get_sectors_with_stocks),
]