from rest_framework import serializers
from .models import Portfolio, PortfolioStock
from stock.serializers import StockSerializer


class PortfolioStockSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    
    class Meta:
        model = PortfolioStock
        fields = ['id', 'stock', 'quantity']


class PortfolioSerializer(serializers.ModelSerializer):
    stocks = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = ['id', 'user', 'user_username', 'name', 'description', 'stocks', 
                  'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_stocks(self, obj):
        portfolio_stocks = PortfolioStock.objects.filter(portfolio=obj)
        return PortfolioStockSerializer(portfolio_stocks, many=True).data


class PortfolioCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating portfolios"""
    
    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserPortfoliosSerializer(serializers.ModelSerializer):
    """Serializer for listing all portfolios of a user"""
    stocks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'description', 'created_at', 'is_active', 'stocks_count']
    
    def get_stocks_count(self, obj):
        return PortfolioStock.objects.filter(portfolio=obj).count()
