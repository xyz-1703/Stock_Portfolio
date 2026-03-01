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
    
    class Meta:
        model = Portfolio
        fields = ['id', 'user', 'stocks']
    
    def get_stocks(self, obj):
        portfolio_stocks = PortfolioStock.objects.filter(portfolio=obj)
        return PortfolioStockSerializer(portfolio_stocks, many=True).data
