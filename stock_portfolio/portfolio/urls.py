from django.urls import path
from . import views

urlpatterns = [
    # Portfolio Management Endpoints
    path('portfolios/', views.list_user_portfolios, name='list_portfolios'),
    path('portfolios/create/', views.create_portfolio, name='create_portfolio'),
    path('portfolios/<int:portfolio_id>/', views.get_portfolio_detail, name='get_portfolio_detail'),
    path('portfolios/<int:portfolio_id>/update/', views.update_portfolio, name='update_portfolio'),
    path('portfolios/<int:portfolio_id>/delete/', views.delete_portfolio, name='delete_portfolio'),
    path('portfolios/<int:portfolio_id>/clustering/', views.get_portfolio_clustering, name='get_portfolio_clustering'),
    
    # Linear Regression Analysis Endpoints
    path('regression/precious-metals/', views.get_regression_analysis, name='get_regression_analysis'),
    
    # Stock Management Endpoints
    path('add-stock/', views.add_to_portfolio, name='add_to_portfolio'),
    path('remove-stock/', views.remove_from_portfolio, name='remove_from_portfolio'),
    path('update-stock/', views.update_portfolio_stock, name='update_portfolio_stock'),
    path('portfolio/', views.get_portfolio, name='get_portfolio'),
    path('portfolio/<int:portfolio_id>/', views.get_portfolio, name='get_portfolio_by_id'),
]
