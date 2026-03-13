from django.db import models
from django.contrib.auth.models import User
from stock.models import Stock
from django.utils import timezone

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'name')  # Prevent duplicate portfolio names per user
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class PortfolioStock(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    class Meta:
        unique_together = ('portfolio', 'stock')   # avoid duplicates

    def __str__(self):
        return f"{self.stock.name} - {self.portfolio.user.username}"