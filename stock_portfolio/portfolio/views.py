from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db import transaction
from .models import Portfolio, PortfolioStock
from stock.models import Stock
from .serializers import (
    PortfolioStockSerializer, 
    PortfolioSerializer,
    PortfolioCreateUpdateSerializer,
    UserPortfoliosSerializer
)
from .clustering import generate_clustering_plot
from .regression import generate_regression_plot


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


def get_user_from_request(request):
    """Get user from request - either authenticated or demo user"""
    if request.user and request.user.is_authenticated:
        return request.user
    else:
        return get_or_create_demo_user()


# ==================== Portfolio Management Endpoints ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_user_portfolios(request):
    """
    List all portfolios for the current user
    """
    user = get_user_from_request(request)
    
    try:
        portfolios = Portfolio.objects.filter(user=user, is_active=True)
        serializer = UserPortfoliosSerializer(portfolios, many=True)
        return Response({
            "user": user.username,
            "count": portfolios.count(),
            "portfolios": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_portfolio(request):
    """
    Create a new portfolio for the current user
    Expected data: {
        "name": "Portfolio Name",
        "description": "Optional description"
    }
    """
    user = get_user_from_request(request)
    
    name = request.data.get('name', f"Portfolio {user.portfolios.count() + 1}")
    description = request.data.get('description', '')
    
    if not name or not name.strip():
        return Response(
            {"error": "Portfolio name is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        portfolio = Portfolio.objects.create(
            user=user,
            name=name.strip(),
            description=description
        )
        serializer = PortfolioCreateUpdateSerializer(portfolio)
        return Response(
            {
                "message": "Portfolio created successfully",
                "portfolio": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        if "unique_together" in str(e):
            return Response(
                {"error": f"Portfolio with name '{name}' already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_portfolio_detail(request, portfolio_id):
    """
    Get detailed information about a specific portfolio
    """
    user = get_user_from_request(request)
    
    try:
        portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Portfolio.DoesNotExist:
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_portfolio(request, portfolio_id):
    """
    Update portfolio details (name, description, is_active)
    """
    user = get_user_from_request(request)
    
    try:
        portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        serializer = PortfolioCreateUpdateSerializer(portfolio, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Portfolio updated successfully",
                    "portfolio": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Portfolio.DoesNotExist:
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_portfolio(request, portfolio_id):
    """
    Soft delete a portfolio (mark as inactive) or permanently delete
    Query param: permanent=true for permanent deletion
    """
    user = get_user_from_request(request)
    
    try:
        portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        permanent = request.query_params.get('permanent', False)
        
        if permanent == 'true':
            # Permanently delete the portfolio and all its stocks
            portfolio.delete()
            return Response(
                {"message": "Portfolio deleted permanently"},
                status=status.HTTP_200_OK
            )
        else:
            # Soft delete - just mark as inactive
            portfolio.is_active = False
            portfolio.save()
            return Response(
                {"message": "Portfolio marked as inactive"},
                status=status.HTTP_200_OK
            )
    except Portfolio.DoesNotExist:
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== Stock Management Endpoints ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_portfolio(request):
    """
    Add stock to a portfolio
    Expected data: {
        "portfolio_id": 1,
        "stock_id": 5,
        "quantity": 10
    }
    If portfolio_id not provided, uses the first active portfolio or creates one
    """
    user = get_user_from_request(request)
    
    stock_id = request.data.get("stock_id")
    portfolio_id = request.data.get("portfolio_id")
    quantity = request.data.get("quantity", 1)

    if not stock_id:
        return Response(
            {"error": "stock_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get or create portfolio
        if portfolio_id:
            portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        else:
            # Use first active portfolio or create a default one
            portfolio = Portfolio.objects.filter(user=user, is_active=True).first()
            if not portfolio:
                portfolio, _ = Portfolio.objects.get_or_create(
                    user=user,
                    name="My Portfolio",
                    defaults={"is_active": True}
                )

        # Get stock
        stock = Stock.objects.get(id=stock_id)

        # Add or update stock in portfolio
        obj, created = PortfolioStock.objects.get_or_create(
            portfolio=portfolio,
            stock=stock
        )

        if not created:
            obj.quantity += int(quantity)
            obj.save()
        else:
            obj.quantity = int(quantity)
            obj.save()

        return Response(
            {
                "message": "Stock added to portfolio successfully",
                "portfolio_id": portfolio.id,
                "stock_id": stock_id,
                "quantity": obj.quantity,
                "created": created
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    except Portfolio.DoesNotExist:
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Stock.DoesNotExist:
        return Response(
            {"error": "Stock not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def remove_from_portfolio(request):
    """
    Remove stock from a portfolio
    Expected data: {
        "portfolio_id": 1,
        "stock_id": 5
    }
    """
    user = get_user_from_request(request)
    
    stock_id = request.data.get("stock_id")
    portfolio_id = request.data.get("portfolio_id")

    if not stock_id or not portfolio_id:
        return Response(
            {"error": "stock_id and portfolio_id are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        stock = Stock.objects.get(id=stock_id)
        portfolio_stock = PortfolioStock.objects.get(portfolio=portfolio, stock=stock)
        portfolio_stock.delete()
        return Response(
            {
                "message": "Stock removed from portfolio successfully",
                "portfolio_id": portfolio_id,
                "stock_id": stock_id
            },
            status=status.HTTP_200_OK
        )
    except (Portfolio.DoesNotExist, Stock.DoesNotExist, PortfolioStock.DoesNotExist) as e:
        return Response(
            {"error": "Portfolio or Stock not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_portfolio_stock(request):
    """
    Update quantity of stock in a portfolio
    Expected data: {
        "portfolio_id": 1,
        "stock_id": 5,
        "quantity": 15
    }
    """
    user = get_user_from_request(request)
    
    stock_id = request.data.get("stock_id")
    portfolio_id = request.data.get("portfolio_id")
    quantity = request.data.get("quantity")

    if not all([stock_id, portfolio_id, quantity]):
        return Response(
            {"error": "stock_id, portfolio_id, and quantity are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        stock = Stock.objects.get(id=stock_id)
        portfolio_stock = PortfolioStock.objects.get(portfolio=portfolio, stock=stock)
        
        portfolio_stock.quantity = int(quantity)
        portfolio_stock.save()
        
        return Response(
            {
                "message": "Stock quantity updated successfully",
                "portfolio_id": portfolio_id,
                "stock_id": stock_id,
                "quantity": portfolio_stock.quantity
            },
            status=status.HTTP_200_OK
        )
    except (Portfolio.DoesNotExist, Stock.DoesNotExist, PortfolioStock.DoesNotExist):
        return Response(
            {"error": "Portfolio or Stock not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_portfolio(request, portfolio_id=None):
    """
    Get stocks in a specific portfolio
    If portfolio_id is not provided, returns stocks from the first active portfolio
    """
    user = get_user_from_request(request)

    try:
        if portfolio_id:
            portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        else:
            portfolio = Portfolio.objects.filter(user=user, is_active=True).first()
            if not portfolio:
                return Response([], status=status.HTTP_200_OK)

        portfolio_stocks = PortfolioStock.objects.filter(portfolio=portfolio)
        serializer = PortfolioStockSerializer(portfolio_stocks, many=True)
        return Response(
            {
                "portfolio": portfolio.name,
                "portfolio_id": portfolio.id,
                "stocks": serializer.data
            },
            status=status.HTTP_200_OK
        )
    except Portfolio.DoesNotExist:
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_portfolio_clustering(request, portfolio_id):
    """
    Get clustering visualization and analysis for a portfolio.
    Query params:
        - n_clusters: Number of clusters (default: 3)
    
    Returns:
        {
            "plot_image": "data:image/png;base64,...",
            "cluster_info": {...},
            "stock_clusters": [...],
            "n_clusters": 3,
            "explained_variance": {"pc1": 0.45, "pc2": 0.25}
        }
    """
    user = get_user_from_request(request)
    
    try:
        # Verify portfolio belongs to user
        portfolio = Portfolio.objects.get(id=portfolio_id, user=user)
        
        # Check if portfolio has stocks
        if not PortfolioStock.objects.filter(portfolio=portfolio).exists():
            return Response(
                {
                    "error": "Portfolio has no stocks to cluster",
                    "plot_image": None,
                    "cluster_info": {}
                },
                status=status.HTTP_200_OK
            )
        
        # Get n_clusters from query params
        n_clusters = int(request.query_params.get('n_clusters', 3))
        
        # Validate n_clusters
        stock_count = PortfolioStock.objects.filter(portfolio=portfolio).count()
        if n_clusters < 2:
            n_clusters = 2
        elif n_clusters > stock_count:
            n_clusters = max(2, stock_count - 1)
        
        # Generate clustering plot
        result = generate_clustering_plot(portfolio_id, n_clusters=n_clusters)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Portfolio.DoesNotExist:
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError:
        return Response(
            {"error": "Invalid n_clusters parameter"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Linear Regression Analysis Endpoints ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_regression_analysis(request):
    """
    Get linear regression analysis for gold or silver stocks.
    Query params:
        - metal: 'gold' or 'silver' (default: 'gold')
    
    Returns:
        {
            "plot_image": "data:image/png;base64,...",
            "statistics": {
                "metal_type": "Gold",
                "r_squared": 0.85,
                "rmse": 15.5,
                "slope": 0.000025,
                "insights": [...],
                "stocks": [...]
            }
        }
    """
    try:
        metal = request.query_params.get('metal', 'gold').lower()
        
        if metal not in ['gold', 'silver']:
            return Response(
                {"error": "Invalid metal type. Use 'gold' or 'silver'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate regression plot
        result = generate_regression_plot(metal_type=metal)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


