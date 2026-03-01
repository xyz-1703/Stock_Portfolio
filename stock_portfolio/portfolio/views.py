from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Portfolio, PortfolioStock
from stock.models import Stock
from .serializers import PortfolioStockSerializer


def get_or_create_demo_user():
    """Get or create a demo user for development purposes"""
    user, created = User.objects.get_or_create(
        username='demo_user',
        defaults={
            'email': 'demo@example.com',
            'first_name': 'Demo',
            'last_name': 'User'
        }
    )
    return user


@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_portfolio(request):
    # Use demo user for development, or authenticated user if available
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        user = get_or_create_demo_user()
    
    stock_id = request.data.get("stock_id")

    if not stock_id:
        return Response({"error": "stock_id is required"}, status=400)

    try:
        portfolio = Portfolio.objects.get(user=user)
    except Portfolio.DoesNotExist:
        portfolio = Portfolio.objects.create(user=user)

    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        return Response({"error": "Stock not found"}, status=404)

    obj, created = PortfolioStock.objects.get_or_create(
        portfolio=portfolio,
        stock=stock
    )

    if not created:
        obj.quantity += 1
        obj.save()

    return Response({"message": "Stock added successfully", "created": created})



@api_view(['POST'])
@permission_classes([AllowAny])
def remove_from_portfolio(request):
    # Use demo user for development, or authenticated user if available
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        user = get_or_create_demo_user()
    
    stock_id = request.data.get("stock_id")

    if not stock_id:
        return Response({"error": "stock_id is required"}, status=400)

    try:
        portfolio = Portfolio.objects.get(user=user)
        stock = Stock.objects.get(id=stock_id)
        portfolio_stock = PortfolioStock.objects.get(portfolio=portfolio, stock=stock)
        portfolio_stock.delete()
        return Response({"message": "Stock removed successfully"})
    except (Portfolio.DoesNotExist, Stock.DoesNotExist, PortfolioStock.DoesNotExist) as e:
        return Response({"error": str(e)}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_portfolio(request):
    # Use demo user for development, or authenticated user if available
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        user = get_or_create_demo_user()

    try:
        portfolio = Portfolio.objects.get(user=user)
        portfolio_stocks = PortfolioStock.objects.filter(portfolio=portfolio)
        serializer = PortfolioStockSerializer(portfolio_stocks, many=True)
        return Response(serializer.data)
    except Portfolio.DoesNotExist:
        return Response([])

