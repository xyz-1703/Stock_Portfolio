from django.urls import path
from . import views

urlpatterns = [
    # Portfolio Management Endpoints
    path('api/portfolios/', views.list_user_portfolios, name='list_portfolios'),
    path('api/portfolios/create/', views.create_portfolio, name='create_portfolio'),
    path('api/portfolios/<int:portfolio_id>/', views.get_portfolio_detail, name='get_portfolio_detail'),
    path('api/portfolios/<int:portfolio_id>/update/', views.update_portfolio, name='update_portfolio'),
    path('api/portfolios/<int:portfolio_id>/delete/', views.delete_portfolio, name='delete_portfolio'),
    path('api/portfolios/<int:portfolio_id>/clustering/', views.get_portfolio_clustering, name='get_portfolio_clustering'),
    
    # Linear Regression Analysis Endpoints
    path('api/regression/precious-metals/', views.get_regression_analysis, name='get_regression_analysis'),
    
    # Stock Management Endpoints
    path('api/add-stock/', views.add_to_portfolio, name='add_to_portfolio'),
    path('api/remove-stock/', views.remove_from_portfolio, name='remove_from_portfolio'),
    path('api/update-stock/', views.update_portfolio_stock, name='update_portfolio_stock'),
    path('api/portfolio/', views.get_portfolio, name='get_portfolio'),
    path('api/portfolio/<int:portfolio_id>/', views.get_portfolio, name='get_portfolio_by_id'),
]