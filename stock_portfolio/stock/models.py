from django.db import models

# Create your models here.
class Sector(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Stock(models.Model):
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=20, unique=True)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.symbol})"


class StockDetail(models.Model):
    """Store detailed stock information from yfinance"""
    stock = models.OneToOneField(Stock, on_delete=models.CASCADE, related_name='detail')
    
    # Price Information
    current_price = models.FloatField(null=True, blank=True)
    previous_close = models.FloatField(null=True, blank=True)
    open_price = models.FloatField(null=True, blank=True)
    day_high = models.FloatField(null=True, blank=True)
    day_low = models.FloatField(null=True, blank=True)
    fifty_two_week_high = models.FloatField(null=True, blank=True)
    fifty_two_week_low = models.FloatField(null=True, blank=True)
    fifty_day_average = models.FloatField(null=True, blank=True)
    two_hundred_day_average = models.FloatField(null=True, blank=True)
    
    # Valuation Metrics
    pe_ratio = models.FloatField(null=True, blank=True)
    forward_pe = models.FloatField(null=True, blank=True)
    peg_ratio = models.FloatField(null=True, blank=True)
    price_to_book = models.FloatField(null=True, blank=True)
    
    # Profitability Metrics
    profit_margin = models.FloatField(null=True, blank=True)
    operating_margin = models.FloatField(null=True, blank=True)
    return_on_equity = models.FloatField(null=True, blank=True)
    debt_to_equity = models.FloatField(null=True, blank=True)
    
    # Dividend Information
    dividend_yield = models.FloatField(null=True, blank=True)
    dividend_rate = models.FloatField(null=True, blank=True)
    payout_ratio = models.FloatField(null=True, blank=True)
    five_year_avg_dividend_yield = models.FloatField(null=True, blank=True)
    
    # Market Data
    market_cap = models.BigIntegerField(null=True, blank=True)
    enterprise_value = models.BigIntegerField(null=True, blank=True)
    three_month_average_volume = models.BigIntegerField(null=True, blank=True)
    beta = models.FloatField(null=True, blank=True)
    
    # Additional Info
    industry = models.CharField(max_length=100, blank=True)
    description_full = models.TextField(blank=True)
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Details for {self.stock.symbol}"
    
    class Meta:
        verbose_name_plural = "Stock Details"


class StockHistoricalData(models.Model):
    """Store historical price data for charting"""
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='historical_data')
    date = models.DateField()
    
    # OHLCV data
    open_price = models.FloatField()
    high_price = models.FloatField()
    low_price = models.FloatField()
    close_price = models.FloatField()
    volume = models.IntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.stock.symbol} - {self.date}"
    
    class Meta:
        ordering = ['date']
        unique_together = ('stock', 'date')
        verbose_name_plural = "Stock Historical Data"
