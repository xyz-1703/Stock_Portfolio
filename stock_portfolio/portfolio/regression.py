import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import io
import base64
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import yfinance as yf

# Use non-interactive backend for matplotlib
matplotlib.use('Agg')


def get_gold_silver_stocks(metal_type='gold'):
    """
    Fetch gold or silver stocks directly from yfinance.
    
    Args:
        metal_type: 'gold' or 'silver'
    
    Returns:
        DataFrame with stock info including current price, market cap, etc.
    """
    try:
        if metal_type.lower() == 'gold':
            symbols = ['GLD', 'IAU', 'AAAU', 'NEM', 'GOLD', 'ABX']  # Gold ETFs and miners
        else:
            symbols = ['SLV', 'PSLV', 'SIVR', 'AGQ', 'PAAS', 'HL']  # Silver ETFs and miners
        
        data = []
        
        for symbol in symbols:
            try:
                print(f"Fetching {symbol}...")
                ticker = yf.Ticker(symbol)
                
                # Get current info
                info = ticker.info
                hist = ticker.history(period='1y')
                
                if hist.empty:
                    print(f"No historical data for {symbol}")
                    continue
                
                current_price = info.get('currentPrice') or info.get('regularMarketPrice') or hist['Close'].iloc[-1]
                market_cap = info.get('marketCap') or info.get('marketCap', 0)
                
                if not current_price or current_price <= 0:
                    print(f"Invalid price for {symbol}: {current_price}")
                    continue
                
                # Get more price data for better regression
                high_52 = info.get('fiftyTwoWeekHigh') or hist['High'].max()
                low_52 = info.get('fiftyTwoWeekLow') or hist['Low'].min()
                
                data.append({
                    'symbol': symbol,
                    'name': info.get('longName', symbol),
                    'current_price': float(current_price),
                    'market_cap': float(market_cap) if market_cap else 50000000000,
                    'pe_ratio': float(info.get('trailingPE', 0)) or None,
                    'fifty_two_week_high': float(high_52),
                    'fifty_two_week_low': float(low_52),
                    'volume': float(info.get('volume', 0)) or 0,
                    'beta': float(info.get('beta', 1.0)) or 1.0,
                })
            
            except Exception as e:
                print(f"Error fetching {symbol}: {str(e)}")
                continue
        
        return pd.DataFrame(data) if data else pd.DataFrame()
    
    except Exception as e:
        print(f"Error fetching precious metals data: {str(e)}")
        return pd.DataFrame()


def prepare_stock_data(stocks):
    """
    Ensure stock data is in the right format for regression.
    This function is kept for compatibility but data should already be prepared by yfinance.
    """
    if isinstance(stocks, pd.DataFrame):
        return stocks
    
    # If it's a list, convert to DataFrame
    if isinstance(stocks, list):
        return pd.DataFrame(stocks)
    
    return stocks


def perform_linear_regression(stocks_data, feature='market_cap', target='current_price'):
    """
    DEPRECATED: Perform linear regression on stock data.
    Kept for backward compatibility - use generate_regression_plot instead.
    """
    if stocks_data.empty or len(stocks_data) < 2:
        return None, None, None, None
    
    X = stocks_data[[feature]].fillna(0).values
    y = stocks_data[target].fillna(0).values
    
    model = LinearRegression()
    model.fit(X, y)
    y_pred = model.predict(X)
    
    r2 = r2_score(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    
    return model, y_pred, r2, rmse


def generate_regression_plot(metal_type='gold'):
    """
    Generate linear regression plot showing correlation between gold and silver prices.
    Uses historical price data from GLD and SLV ETFs to analyze real price movement correlation.
    
    Args:
        metal_type: ignored - analyzes both gold and silver historical data together
    
    Returns:
        dict with plot image, statistics, and insights
    """
    try:
        print("Fetching historical price data for GLD (gold) and SLV (silver)...")
        
        # Download historical closing prices for gold (GLD) and silver (SLV) ETFs
        data = yf.download(['GLD', 'SLV'], period='2y', progress=False)['Close']
        
        # Remove any missing values
        data = data.dropna()
        
        if data.empty or len(data) < 10:
            return {
                'error': 'Insufficient historical data: Could not fetch enough price data for analysis.',
                'plot_image': None,
                'statistics': {}
            }
        
        # Extract gold and silver prices
        gold_prices = data['GLD'].values
        silver_prices = data['SLV'].values
        
        print(f"Data points collected: {len(gold_prices)}")
        print(f"Gold price range: ${gold_prices.min():.2f} - ${gold_prices.max():.2f}")
        print(f"Silver price range: ${silver_prices.min():.2f} - ${silver_prices.max():.2f}")
        
        # Calculate Pearson correlation
        correlation = np.corrcoef(gold_prices, silver_prices)[0, 1]
        
        # Prepare data for regression (gold price as X, silver price as Y)
        X = gold_prices.reshape(-1, 1)  # 2D array for sklearn
        y = silver_prices
        
        # Perform regression
        model = LinearRegression()
        model.fit(X, y)
        y_pred = model.predict(X)
        
        # Calculate metrics
        r2 = r2_score(y, y_pred)
        rmse = np.sqrt(np.mean((y - y_pred) ** 2))
        
        # Create single visualization: Gold vs Silver Price Correlation
        fig = plt.figure(figsize=(6, 3.5), facecolor='#1a1a2e')
        ax = fig.add_subplot(111)
        
        # Scatter plot of gold-silver prices with regression line
        ax.set_facecolor('#16213e')
        ax.scatter(gold_prices, silver_prices, c='#FFD700', s=200, alpha=0.7, edgecolors='white', linewidth=2, label='Historical GLD-SLV Prices')
        
        # Sort for smooth regression line
        sort_indices = np.argsort(gold_prices)
        X_sorted = gold_prices[sort_indices].reshape(-1, 1)
        y_pred_sorted = model.predict(X_sorted)
        
        ax.plot(X_sorted, y_pred_sorted, color='#ff006e', linewidth=4, label='Regression Line', alpha=0.9)
        
        ax.set_xlabel('Gold Price - GLD ($)', color='white', fontsize=14, fontweight='bold')
        ax.set_ylabel('Silver Price - SLV ($)', color='white', fontsize=14, fontweight='bold')
        ax.set_title('Gold vs Silver Price Correlation (2-Year Historical Data)', color='white', fontsize=16, fontweight='bold', pad=20)
        ax.legend(loc='best', framealpha=0.95, facecolor='#16213e', edgecolor='white', fontsize=11)
        ax.grid(True, alpha=0.3, color='white', linestyle='--')
        ax.tick_params(colors='white', labelsize=10)
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', facecolor='#1a1a2e')
        buffer.seek(0)
        plot_image = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)
        
        # Prepare statistics
        slope = float(model.coef_[0])
        intercept = float(model.intercept_)
        mean_gold = float(gold_prices.mean())
        mean_silver = float(silver_prices.mean())
        r_squared = float(r2)
        rmse_val = float(rmse)
        correlation_val = float(correlation) if not np.isnan(correlation) and not np.isinf(correlation) else 0
        
        # Create mock stock data for display
        all_stocks = [
            {
                'symbol': 'GLD',
                'name': 'SPDR Gold Shares',
                'type': 'Gold',
                'price': float(gold_prices[-1]),
                'market_cap': None,
                'pe_ratio': None,
            },
            {
                'symbol': 'SLV',
                'name': 'iShares Silver Trust',
                'type': 'Silver',
                'price': float(silver_prices[-1]),
                'market_cap': None,
                'pe_ratio': None,
            }
        ]
        
        statistics = {
            'analysis_type': 'Gold vs Silver Correlation (Historical Data)',
            'gold_avg_price': mean_gold,
            'silver_avg_price': mean_silver,
            'data_points': len(data),
            'r_squared': r_squared if not np.isnan(r_squared) and not np.isinf(r_squared) else 0,
            'rmse': rmse_val if not np.isnan(rmse_val) and not np.isinf(rmse_val) else 0,
            'slope': slope if not np.isnan(slope) and not np.isinf(slope) else 0,
            'intercept': intercept if not np.isnan(intercept) and not np.isinf(intercept) else 0,
            'pearson_correlation': correlation_val,
            'equation': f'Silver = {intercept:.2f} + {slope:.6f} × Gold',
            'insights': [
                f'Pearson Correlation: {correlation_val:.4f} - {"Strong positive" if correlation_val > 0.7 else "Moderate positive" if correlation_val > 0.5 else "Weak"}',
                f'R² = {r_squared:.4f}: Model explains {r_squared*100:.2f}% of silver price variance',
                f'RMSE = ${rmse_val:.2f}: Average prediction error',
                f'Slope = {slope:.6f}: For every $1 increase in gold, silver increases by ${slope:.4f}',
                f'Gold (GLD) range: ${gold_prices.min():.2f} - ${gold_prices.max():.2f}',
                f'Silver (SLV) range: ${silver_prices.min():.2f} - ${silver_prices.max():.2f}',
                f'Analysis period: 2 years of daily historical price data',
            ]
        }

        # Plotly payload for interactive frontend chart
        plotly_data = {
            'gold_prices': [float(v) for v in gold_prices.tolist()],
            'silver_prices': [float(v) for v in silver_prices.tolist()],
            'regression_x': [float(v) for v in X_sorted.flatten().tolist()],
            'regression_y': [float(v) for v in y_pred_sorted.tolist()],
            'period': '2y'
        }
        
        return {
            'plot_image': f'data:image/png;base64,{plot_image}',
            'plotly_data': plotly_data,
            'statistics': statistics,
            'stocks': all_stocks
        }
    
    except Exception as e:
        print(f"Error generating regression plot: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'error': f'Error generating analysis: {str(e)}',
            'plot_image': None,
            'statistics': {}
        }
