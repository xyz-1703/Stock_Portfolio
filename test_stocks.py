#!/usr/bin/env python
"""
Quick diagnostic script to check what stocks are in the database
"""
import os
import sys
import django

# Setup Django
os.chdir('stock_portfolio')
sys.path.insert(0, os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_portfolio.settings')
django.setup()

from stock.models import Stock, StockDetail

print("=== Stock Database Diagnostic ===\n")

# Check total stocks
total_stocks = Stock.objects.count()
print(f"Total stocks in database: {total_stocks}")

if total_stocks == 0:
    print("No stocks found! Please add stocks first.")
    sys.exit(1)

# List all stocks
print("\n=== All Stocks ===")
for stock in Stock.objects.all()[:20]:
    try:
        detail = stock.detail if hasattr(stock, 'detail') else None
        price = detail.current_price if detail else "N/A"
        market_cap = detail.market_cap if detail else "N/A"
        print(f"{stock.symbol} - {stock.name}")
        print(f"  Price: {price}, Market Cap: {market_cap}")
    except Exception as e:
        print(f"{stock.symbol} - {stock.name} (Error: {e})")

# Check for precious metals
print("\n=== Checking for Precious Metals ===")
from django.db.models import Q

gold = Stock.objects.filter(
    Q(symbol__icontains='gold') | 
    Q(symbol__icontains='gld') |
    Q(symbol__icontains='iau') |
    Q(name__icontains='gold')
).count()

silver = Stock.objects.filter(
    Q(symbol__icontains='silver') |
    Q(symbol__icontains='slv') |
    Q(name__icontains='silver')
).count()

print(f"Gold related stocks: {gold}")
print(f"Silver related stocks: {silver}")

# Check direct symbols
print("\n=== Checking direct symbols ===")
symbols_to_check = ['GLD', 'IAU', 'SLV', 'PSLV', 'AGOL', 'AGQ']
for symbol in symbols_to_check:
    exists = Stock.objects.filter(symbol=symbol).exists()
    print(f"{symbol}: {'YES' if exists else 'NO'}")

# Check stocks with valid data
print("\n=== Stocks with valid detail data (price > 0) ===")
valid_stocks = []
for stock in Stock.objects.all():
    try:
        if hasattr(stock, 'detail') and stock.detail:
            detail = stock.detail
            if detail.current_price and detail.current_price > 0:
                valid_stocks.append(stock)
                print(f"{stock.symbol}: ${detail.current_price}")
    except:
        pass

print(f"\nTotal stocks with valid price data: {len(valid_stocks)}")
print("\n=== Diagnostic complete ===")
