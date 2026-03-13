from django.apps import AppConfig


class StockConfig(AppConfig):
    name = 'stock'

    def ready(self):
        import threading

        def prefetch_all_stocks():
            # Wait until the app is fully loaded before accessing the DB
            import time
            time.sleep(2)
            try:
                from stock.models import Stock, StockDetail
                from stock.fetch_data import StockDataFetcher
                symbols = list(Stock.objects.values_list('symbol', flat=True))
                print(f"[Startup] Pre-fetching data for {len(symbols)} stocks...")
                for symbol in symbols:
                    try:
                        stock_data = StockDataFetcher.fetch_stock_data(symbol)
                        if not stock_data:
                            continue
                        # Save into StockDetail so the home page shows prices immediately
                        stock = Stock.objects.get(symbol=symbol)
                        StockDetail.objects.update_or_create(
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
                    except Exception as e:
                        print(f"[Startup] Failed to fetch {symbol}: {e}")
                print("[Startup] Stock data pre-fetch and DB update complete.")
            except Exception as e:
                print(f"[Startup] Pre-fetch error: {e}")

        thread = threading.Thread(target=prefetch_all_stocks, daemon=True)
        thread.start()
