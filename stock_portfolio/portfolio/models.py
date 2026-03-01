from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from stock.models import Stock

class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username


class PortfolioStock(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    class Meta:
        unique_together = ('portfolio', 'stock')   # avoid duplicates

    def __str__(self):
        return f"{self.stock.name} - {self.portfolio.user.username}"