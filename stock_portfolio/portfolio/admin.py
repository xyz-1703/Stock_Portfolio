from django.contrib import admin
from .models import Portfolio, PortfolioStock

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_active', 'created_at', 'stock_count')
    list_filter = ('is_active', 'created_at', 'user')
    search_fields = ('name', 'user__username', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'description')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def stock_count(self, obj):
        """Display number of stocks in portfolio"""
        return PortfolioStock.objects.filter(portfolio=obj).count()
    stock_count.short_description = 'Number of Stocks'


@admin.register(PortfolioStock)
class PortfolioStockAdmin(admin.ModelAdmin):
    list_display = ('portfolio', 'stock', 'quantity')
    list_filter = ('portfolio__user', 'portfolio', 'stock__sector')
    search_fields = ('portfolio__name', 'stock__name', 'stock__symbol')
    fieldsets = (
        ('Portfolio & Stock', {
            'fields': ('portfolio', 'stock')
        }),
        ('Quantity', {
            'fields': ('quantity',)
        }),
    )