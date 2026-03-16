from django.urls import path
from . import views

urlpatterns = [
    path('sectors/', views.get_sectors),
    path('stocks/<int:sector_id>/', views.get_stocks_by_sector),
    path('stock/<str:symbol>/', views.get_stock_detail),

    path('auth/signup/', views.signup),
    path('auth/login/', views.login_view),
    path('auth/logout/', views.logout_view),
    path('auth/user/', views.get_user_info),

    path('home/sectors-with-stocks/', views.get_sectors_with_stocks),
    path('debug/all-stocks/', views.debug_all_stocks),
]
