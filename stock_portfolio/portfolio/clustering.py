import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import io
import base64
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from .models import Portfolio, PortfolioStock
from stock.models import Stock, StockDetail

# Use non-interactive backend for matplotlib
matplotlib.use('Agg')


def fetch_stocks_by_portfolio(portfolio_id):
    """
    Fetch all stocks info associated with a portfolio and store into a DataFrame.
    
    Args:
        portfolio_id (int): The ID of the portfolio
    
    Returns:
        pandas.DataFrame: DataFrame containing stocks info with the following columns:
            - stock_id: Stock ID
            - stock_name: Stock name
            - symbol: Stock symbol
            - sector: Sector name
            - quantity: Quantity in portfolio
            - current_price: Current stock price
            - market_cap: Market capitalization
            - pe_ratio: Price to Earnings ratio
            - dividend_yield: Dividend yield
            - profit_margin: Profit margin
            - beta: Stock beta
            - sector: Industry sector
    
    Raises:
        Portfolio.DoesNotExist: If portfolio with given ID doesn't exist
    """
    try:
        # Get the portfolio
        portfolio = Portfolio.objects.get(id=portfolio_id)
        
        # Get all stocks in the portfolio with their details
        portfolio_stocks = PortfolioStock.objects.filter(portfolio=portfolio).select_related(
            'stock', 
            'stock__sector', 
            'stock__detail'
        )
        
        if not portfolio_stocks.exists():
            print(f"No stocks found for portfolio ID: {portfolio_id}")
            return pd.DataFrame()
        
        # Prepare data for DataFrame
        stocks_data = []
        
        for ps in portfolio_stocks:
            stock = ps.stock
            detail = stock.detail if hasattr(stock, 'detail') else None
            
            stock_info = {
                'stock_id': stock.id,
                'stock_name': stock.name,
                'symbol': stock.symbol,
                'sector': stock.sector.name if stock.sector else 'N/A',
                'quantity': ps.quantity,
                'current_price': detail.current_price if detail else None,
                'previous_close': detail.previous_close if detail else None,
                'open_price': detail.open_price if detail else None,
                'day_high': detail.day_high if detail else None,
                'day_low': detail.day_low if detail else None,
                '52_week_high': detail.fifty_two_week_high if detail else None,
                '52_week_low': detail.fifty_two_week_low if detail else None,
                'pe_ratio': detail.pe_ratio if detail else None,
                'forward_pe': detail.forward_pe if detail else None,
                'peg_ratio': detail.peg_ratio if detail else None,
                'price_to_book': detail.price_to_book if detail else None,
                'market_cap': detail.market_cap if detail else None,
                'enterprise_value': detail.enterprise_value if detail else None,
                'profit_margin': detail.profit_margin if detail else None,
                'operating_margin': detail.operating_margin if detail else None,
                'return_on_equity': detail.return_on_equity if detail else None,
                'debt_to_equity': detail.debt_to_equity if detail else None,
                'dividend_yield': detail.dividend_yield if detail else None,
                'dividend_rate': detail.dividend_rate if detail else None,
                'payout_ratio': detail.payout_ratio if detail else None,
                'beta': detail.beta if detail else None,
                'three_month_avg_volume': detail.three_month_average_volume if detail else None,
                'industry': detail.industry if detail else 'N/A',
                'last_updated': detail.last_updated if detail else None,
            }
            stocks_data.append(stock_info)
        
        # Create DataFrame
        df = pd.DataFrame(stocks_data)
        
        # Remove columns that are all NaN
        df = df.dropna(axis=1, how='all')
        
        print(f"Successfully fetched {len(df)} stocks for portfolio ID: {portfolio_id}")
        return df
    
    except Portfolio.DoesNotExist:
        print(f"Portfolio with ID {portfolio_id} does not exist.")
        raise
    except Exception as e:
        print(f"Error fetching stocks: {str(e)}")
        raise


def perform_kmeans_clustering_on_portfolio(portfolio_id, n_clusters=3, feature_columns=None):
    """
    Perform KMeans clustering on stocks in a portfolio.
    Args:
        portfolio_id (int): Portfolio ID
        n_clusters (int): Number of clusters
        feature_columns (list): List of feature columns to use for clustering
    Returns:
        DataFrame: Original DataFrame with cluster labels
    """
    df = fetch_stocks_by_portfolio(portfolio_id)
    if df.empty:
        print("No stocks to cluster.")
        return df

    # Default features if not provided
    if feature_columns is None:
        # Use numeric columns except identifiers and names
        exclude = ['stock_id', 'stock_name', 'symbol', 'sector', 'industry', 'last_updated', 'quantity']
        feature_columns = [col for col in df.columns if df[col].dtype in ['float64', 'int64'] and col not in exclude]

    if not feature_columns:
        print("No numeric features available for clustering.")
        return df

    X = df[feature_columns].fillna(0)
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Perform KMeans
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    print(f"KMeans clustering complete. Assigned clusters: {df['cluster'].unique()}")
    return df, kmeans, scaler, feature_columns


def generate_clustering_plot(portfolio_id, n_clusters=3, feature_columns=None):
    """
    Generate a clustering visualization plot as base64 encoded image.
    
    Args:
        portfolio_id (int): Portfolio ID
        n_clusters (int): Number of clusters
        feature_columns (list): List of feature columns to use for clustering
    
    Returns:
        dict: Contains plot_image (base64), cluster_info, and stock_clusters
    """
    try:
        df = fetch_stocks_by_portfolio(portfolio_id)
        if df.empty:
            return {
                'error': 'No stocks found in portfolio',
                'plot_image': None,
                'cluster_info': {}
            }

        # Default features if not provided
        if feature_columns is None:
            exclude = ['stock_id', 'stock_name', 'symbol', 'sector', 'industry', 'last_updated', 'quantity']
            feature_columns = [col for col in df.columns if df[col].dtype in ['float64', 'int64'] and col not in exclude]

        if not feature_columns:
            return {
                'error': 'No numeric features available for clustering',
                'plot_image': None,
                'cluster_info': {}
            }

        # Prepare data
        X = df[feature_columns].fillna(0).values
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform KMeans clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        df['cluster'] = clusters
        
        # Perform PCA for 2D visualization
        pca = PCA(n_components=2, random_state=42)
        X_pca = pca.fit_transform(X_scaled)
        
        # Create plot
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='#1a1a2e')
        ax.set_facecolor('#16213e')
        
        # Define colors for clusters
        colors = ['#00d4ff', '#ff006e', '#8338ec', '#fb5607', '#ffbe0b', '#3a86ff']
        cluster_colors = [colors[i % len(colors)] for i in range(n_clusters)]
        
        # Plot clusters
        for cluster_id in range(n_clusters):
            mask = clusters == cluster_id
            ax.scatter(X_pca[mask, 0], X_pca[mask, 1], 
                      c=cluster_colors[cluster_id], 
                      label=f'Cluster {cluster_id}',
                      s=200, alpha=0.7, edgecolors='white', linewidth=1.5)
        
        # Plot cluster centers
        centers_pca = pca.transform(kmeans.cluster_centers_)
        ax.scatter(centers_pca[:, 0], centers_pca[:, 1],
                  c='yellow', marker='*', s=1000, 
                  edgecolors='white', linewidth=2, label='Centroids')
        
        # Add stock labels
        for idx, (x, y) in enumerate(X_pca):
            ax.annotate(df.iloc[idx]['symbol'], 
                       (x, y), 
                       fontsize=9, 
                       color='white',
                       fontweight='bold',
                       ha='center',
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='black', alpha=0.3))
        
        ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)', 
                     color='white', fontsize=12, fontweight='bold')
        ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)', 
                     color='white', fontsize=12, fontweight='bold')
        ax.set_title('Stock Portfolio Clustering Analysis (PCA)', 
                    color='white', fontsize=14, fontweight='bold', pad=20)
        
        ax.legend(loc='best', framealpha=0.9, facecolor='#16213e', edgecolor='white')
        ax.grid(True, alpha=0.2, color='white')
        ax.tick_params(colors='white')
        
        # Convert plot to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', facecolor='#1a1a2e')
        buffer.seek(0)
        plot_image = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)
        
        # Prepare cluster information
        cluster_info = {}
        stock_clusters = []
        
        for cluster_id in range(n_clusters):
            cluster_stocks = df[df['cluster'] == cluster_id]
            cluster_info[f'cluster_{cluster_id}'] = {
                'count': len(cluster_stocks),
                'stocks': cluster_stocks[['symbol', 'stock_name']].to_dict('records'),
                'avg_pe_ratio': float(cluster_stocks['pe_ratio'].mean()) if 'pe_ratio' in cluster_stocks.columns and not cluster_stocks['pe_ratio'].isna().all() else None,
                'avg_market_cap': float(cluster_stocks['market_cap'].mean()) if 'market_cap' in cluster_stocks.columns and not cluster_stocks['market_cap'].isna().all() else None,
            }
            
            for _, row in cluster_stocks.iterrows():
                stock_clusters.append({
                    'symbol': row['symbol'],
                    'name': row['stock_name'],
                    'cluster': int(cluster_id),
                    'sector': row['sector']
                })
        
        # Calculate feature loadings (contributions to each PC)
        loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
        
        # Get top 5 features for PC1 and PC2
        pc1_loadings = abs(loadings[:, 0])
        pc2_loadings = abs(loadings[:, 1])
        
        top_pc1_indices = np.argsort(pc1_loadings)[-5:][::-1]
        top_pc2_indices = np.argsort(pc2_loadings)[-5:][::-1]
        
        pc1_features = [
            {
                'name': feature_columns[i].replace('_', ' ').title(),
                'contribution': float(pc1_loadings[i])
            }
            for i in top_pc1_indices
        ]
        
        pc2_features = [
            {
                'name': feature_columns[i].replace('_', ' ').title(),
                'contribution': float(pc2_loadings[i])
            }
            for i in top_pc2_indices
        ]

        # Plotly payload for interactive clustering chart in frontend
        plotly_data = {
            'pc1': [float(v) for v in X_pca[:, 0].tolist()],
            'pc2': [float(v) for v in X_pca[:, 1].tolist()],
            'symbols': df['symbol'].tolist(),
            'stock_names': df['stock_name'].tolist(),
            'clusters': [int(v) for v in clusters.tolist()],
            'cluster_colors': cluster_colors,
            'centers_pc1': [float(v) for v in centers_pca[:, 0].tolist()],
            'centers_pc2': [float(v) for v in centers_pca[:, 1].tolist()]
        }
        
        return {
            'plot_image': f'data:image/png;base64,{plot_image}',
            'plotly_data': plotly_data,
            'cluster_info': cluster_info,
            'stock_clusters': stock_clusters,
            'n_clusters': n_clusters,
            'explained_variance': {
                'pc1': float(pca.explained_variance_ratio_[0]),
                'pc2': float(pca.explained_variance_ratio_[1])
            },
            'feature_contributions': {
                'pc1': pc1_features,
                'pc2': pc2_features
            }
        }
    
    except Exception as e:
        print(f"Error generating clustering plot: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'error': str(e),
            'plot_image': None,
            'cluster_info': {}
        }
