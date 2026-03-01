from rest_framework import serializers
from .models import Sector, Stock, StockDetail, StockHistoricalData

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = '__all__'


class StockHistoricalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHistoricalData
        fields = ['date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']


class StockDetailSerializer(serializers.ModelSerializer):
    historical_data = StockHistoricalDataSerializer(many=True, read_only=True)
    
    class Meta:
        model = StockDetail
        fields = [
            'current_price', 'pe_ratio', 'forward_pe', 'peg_ratio', 'price_to_book',
            'profit_margin', 'operating_margin', 'return_on_equity', 'debt_to_equity',
            'dividend_yield', 'dividend_rate', 'payout_ratio',
            'market_cap', 'enterprise_value', 'beta',
            'day_high', 'day_low', 'fifty_two_week_high', 'fifty_two_week_low',
            'fifty_day_average', 'two_hundred_day_average', 'industry',
            'last_updated', 'historical_data'
        ]


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = '__all__'


class StockSerializer(serializers.ModelSerializer):
    sector = SectorSerializer(read_only=True)
    detail = StockDetailSerializer(read_only=True)
    
    class Meta:
        model = Stock
        fields = '__all__'