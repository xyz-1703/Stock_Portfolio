"""
Stock data fetching utility using yfinance
Fetches and caches stock data temporarily
"""
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
import yfinance as yf
from django.conf import settings

# Create data directory for storing stock data
DATA_DIR = Path(settings.BASE_DIR) / 'data' / 'stocks'
DATA_DIR.mkdir(parents=True, exist_ok=True)


class StockDataFetcher:
    """Fetch and cache stock data from yfinance"""
    
    CACHE_DURATION = 3600  # 1 hour in seconds
    
    @staticmethod
    def get_stock_file_path(symbol):
        """Get the file path for a stock's cached data"""
        return DATA_DIR / f"{symbol.upper()}.json"
    
    @staticmethod
    def is_cache_valid(file_path):
        """Check if cached data is still valid"""
        if not file_path.exists():
            return False
        
        file_age = datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)
        return file_age < timedelta(seconds=StockDataFetcher.CACHE_DURATION)
    
    @staticmethod
    def fetch_stock_data(symbol):
        """
        Fetch stock data from yfinance and cache it
        Returns dict with stock summary information
        """
        try:
            file_path = StockDataFetcher.get_stock_file_path(symbol)
            
            # Check cache first
            if StockDataFetcher.is_cache_valid(file_path):
                with open(file_path, 'r') as f:
                    return json.load(f)
            
            # Fetch fresh data from yfinance
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get historical data for charts (last 90 days)
            hist = ticker.history(period="3mo")
            
            # Extract key information
            stock_data = {
                'symbol': symbol.upper(),
                'name': info.get('longName', symbol),
                'current_price': info.get('currentPrice', 0),
                'pe_ratio': info.get('trailingPE'),
                'forward_pe': info.get('forwardPE'),
                'peg_ratio': info.get('pegRatio'),
                'price_to_book': info.get('priceToBook'),
                'profit_margin': info.get('profitMargins'),
                'operating_margin': info.get('operatingMargins'),
                'return_on_equity': info.get('returnOnEquity'),
                'debt_to_equity': info.get('debtToEquity'),
                'fifty_two_week_high': info.get('fiftyTwoWeekHigh'),
                'fifty_two_week_low': info.get('fiftyTwoWeekLow'),
                'three_month_average_volume': info.get('averageVolume', 0),
                'market_cap': info.get('marketCap'),
                'enterprise_value': info.get('enterpriseValue'),
                'dividend_yield': info.get('dividendYield'),
                'dividend_rate': info.get('dividendRate'),
                'payout_ratio': info.get('payoutRatio'),
                'five_year_avg_dividend_yield': info.get('fiveYearAvgDividendYield'),
                'beta': info.get('beta'),
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'website': info.get('website'),
                'description': info.get('longBusinessSummary', ''),
                'previous_close': info.get('previousClose'),
                'open_price': info.get('open'),
                'day_high': info.get('dayHigh'),
                'day_low': info.get('dayLow'),
                'fifty_day_average': info.get('fiftyDayAverage'),
                'two_hundred_day_average': info.get('twoHundredDayAverage'),
                'stock_splits': info.get('stockSplits'),
                'last_updated': datetime.now().isoformat(),
                'historical_data': []
            }
            
            # Add historical price data for charts
            if not hist.empty:
                stock_data['historical_data'] = [
                    {
                        'date': date.strftime('%Y-%m-%d'),
                        'close': float(row['Close']),
                        'open': float(row['Open']),
                        'high': float(row['High']),
                        'low': float(row['Low']),
                        'volume': int(row['Volume'])
                    }
                    for date, row in hist.iterrows()
                ]
            
            # Cache the data
            with open(file_path, 'w') as f:
                json.dump(stock_data, f, indent=2)
            
            return stock_data
        
        except Exception as e:
            print(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    @staticmethod
    def calculate_opportunities(stock_data):
        """
        Calculate investment opportunities based on stock metrics
        Returns a dict with opportunity indicators
        """
        if not stock_data:
            return None
        
        opportunities = {
            'symbol': stock_data.get('symbol'),
            'current_price': stock_data.get('current_price', 0),
            'pe_ratio_score': None,
            'price_to_book_score': None,
            'dividend_score': None,
            'technical_score': None,
            'overall_score': 0,
            'opportunities': []
        }
        
        score_count = 0
        total_score = 0
        
        # PE Ratio Analysis (lower is better, typical range 15-25)
        pe = stock_data.get('pe_ratio')
        if pe and pe > 0:
            if pe < 15:
                opportunities['pe_ratio_score'] = 'Undervalued'
                opportunities['opportunities'].append(f"Low PE ratio ({pe:.2f}) - potentially undervalued")
                score = 80
            elif pe < 25:
                opportunities['pe_ratio_score'] = 'Fair'
                score = 50
            else:
                opportunities['pe_ratio_score'] = 'Overvalued'
                opportunities['opportunities'].append(f"High PE ratio ({pe:.2f}) - might be overvalued")
                score = 20
            total_score += score
            score_count += 1
        
        # Price to Book Analysis
        pb = stock_data.get('price_to_book')
        if pb and pb > 0:
            if pb < 1:
                opportunities['price_to_book_score'] = 'Excellent'
                opportunities['opportunities'].append(f"Low Price-to-Book ({pb:.2f}) - trading below book value")
                score = 90
            elif pb < 3:
                opportunities['price_to_book_score'] = 'Good'
                score = 60
            else:
                opportunities['price_to_book_score'] = 'High'
                score = 30
            total_score += score
            score_count += 1
        
        # Dividend Analysis
        dividend_yield = stock_data.get('dividend_yield')
        if dividend_yield and dividend_yield > 0:
            opportunities['dividend_score'] = 'Yes'
            if dividend_yield > 0.03:  # 3%+
                opportunities['opportunities'].append(f"Attractive dividend yield ({dividend_yield*100:.2f}%)")
            score = min(80, 40 + (dividend_yield * 500))  # Scale dividend yield
            total_score += score
            score_count += 1
        
        # Technical Analysis (52-week high/low)
        high = stock_data.get('fifty_two_week_high')
        low = stock_data.get('fifty_two_week_low')
        current = stock_data.get('current_price', 0)
        
        if high and low and current:
            position = (current - low) / (high - low) if (high - low) > 0 else 0.5
            if position < 0.3:
                opportunities['technical_score'] = 'Buy Signal'
                opportunities['opportunities'].append("Near 52-week low - potential buy opportunity")
                score = 85
            elif position > 0.7:
                opportunities['technical_score'] = 'High'
                opportunities['opportunities'].append("Near 52-week high - consider caution")
                score = 30
            else:
                opportunities['technical_score'] = 'Neutral'
                score = 50
            total_score += score
            score_count += 1
        
        # Calculate overall score
        if score_count > 0:
            opportunities['overall_score'] = int(total_score / score_count)
        
        return opportunities
    
    @staticmethod
    def get_disk_usage():
        """Get the size of cached data"""
        total_size = 0
        if DATA_DIR.exists():
            for file in DATA_DIR.glob('*.json'):
                total_size += file.stat().st_size
        return total_size
    
    @staticmethod
    def clear_cache():
        """Clear all cached stock data"""
        if DATA_DIR.exists():
            for file in DATA_DIR.glob('*.json'):
                file.unlink()
        return True
    
    @staticmethod
    def clear_old_cache(hours=1):
        """Clear cache older than specified hours"""
        if DATA_DIR.exists():
            cutoff_time = datetime.now() - timedelta(hours=hours)
            for file in DATA_DIR.glob('*.json'):
                if datetime.fromtimestamp(file.stat().st_mtime) < cutoff_time:
                    file.unlink()
        return True
