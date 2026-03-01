from django.shortcuts import render

# Create your views here.
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Sector, Stock, StockDetail
from .serializers import SectorSerializer, StockSerializer
from .fetch_data import StockDataFetcher


@api_view(['GET'])
def get_sectors(request):
    sectors = Sector.objects.all()
    serializer = SectorSerializer(sectors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_stocks_by_sector(request, sector_id):
    stocks = Stock.objects.filter(sector_id=sector_id)
    serializer = StockSerializer(stocks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_stock_detail(request, symbol):
    """Get detailed stock information including chart data"""
    try:
        symbol_upper = symbol.upper()
        stock_data = StockDataFetcher.fetch_stock_data(symbol_upper)
        
        if not stock_data:
            return Response({"error": "Could not fetch stock data"}, status=404)
        
        # Get or create stock in database
        stock, created = Stock.objects.get_or_create(
            symbol=symbol_upper,
            defaults={
                'name': stock_data.get('name', symbol_upper),
                'description': stock_data.get('description', ''),
                'sector_id': 1,  # Default to first sector
            }
        )
        
        # Update or create stock detail
        detail_obj, created = StockDetail.objects.update_or_create(
            stock=stock,
            defaults={
                'current_price': stock_data.get('current_price'),
                'pe_ratio': stock_data.get('pe_ratio'),
                'forward_pe': stock_data.get('forward_pe'),
                'peg_ratio': stock_data.get('peg_ratio'),
                'price_to_book': stock_data.get('price_to_book'),
                'profit_margin': stock_data.get('profit_margin'),
                'operating_margin': stock_data.get('operating_margin'),
                'return_on_equity': stock_data.get('return_on_equity'),
                'debt_to_equity': stock_data.get('debt_to_equity'),
                'dividend_yield': stock_data.get('dividend_yield'),
                'dividend_rate': stock_data.get('dividend_rate'),
                'payout_ratio': stock_data.get('payout_ratio'),
                'market_cap': stock_data.get('market_cap'),
                'enterprise_value': stock_data.get('enterprise_value'),
                'beta': stock_data.get('beta'),
                'day_high': stock_data.get('day_high'),
                'day_low': stock_data.get('day_low'),
                'fifty_two_week_high': stock_data.get('fifty_two_week_high'),
                'fifty_two_week_low': stock_data.get('fifty_two_week_low'),
                'industry': stock_data.get('industry'),
                'description_full': stock_data.get('description'),
            }
        )
        
        serializer = StockSerializer(stock)
        response_data = serializer.data
        response_data['chart_data'] = stock_data.get('historical_data', [])
        response_data['opportunities'] = StockDataFetcher.calculate_opportunities(stock_data)
        
        return Response(response_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """User registration endpoint"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        password2 = request.data.get('password2')
        
        if not all([username, email, password, password2]):
            return Response({"error": "All fields are required"}, status=400)
        
        if password != password2:
            return Response({"error": "Passwords do not match"}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)
        
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=400)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "User created successfully", "user_id": user.id, "username": user.username}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)
        
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=401)
        
        login(request, user)
        return Response({"message": "Login successful", "user_id": user.id, "username": user.username, "email": user.email})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def logout_view(request):
    """User logout endpoint"""
    try:
        logout(request)
        return Response({"message": "Logout successful"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def get_user_info(request):
    """Get current logged-in user information"""
    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)
    
    user = request.user
    return Response({"user_id": user.id, "username": user.username, "email": user.email, "is_authenticated": True})
