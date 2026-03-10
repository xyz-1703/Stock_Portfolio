import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Trash2, Eye, Package } from "lucide-react";
import ClusteringPlot from "./ClusteringPlot";

function Portfolio({ portfolioId, onStockClick, onPortfolioUpdate }) {
  const [stocks, setStocks] = useState([]);
  const [portfolioInfo, setPortfolioInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolio();
    }
  }, [portfolioId]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/api/portfolio/${portfolioId}/`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      const data = await response.json();

      if (data.stocks) {
        setStocks(data.stocks);
        setPortfolioInfo({
          portfolio: data.portfolio,
          portfolio_id: data.portfolio_id,
          description: data.description
        });
      } else if (Array.isArray(data)) {
        setStocks(data);
        setPortfolioInfo(null);
      } else {
        setStocks([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (stockId) => {
    try {
      if (!portfolioInfo) {
        setError("Portfolio information not available");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/remove-stock/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioInfo.portfolio_id,
          stock_id: stockId
        }),
      });

      if (!response.ok) throw new Error("Failed to remove stock");
      await fetchPortfolio();
    } catch (err) {
      setError(err.message);
      console.error("Error removing stock:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
          {portfolioInfo?.portfolio || "My Portfolio"}
        </h2>
        {portfolioInfo?.description && (
          <p className="text-slate-500 text-sm">{portfolioInfo.description}</p>
        )}
      </div>

      {error && (
        <div className="mb-6 glass-surface !border-red-500/20 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {stocks.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium mb-2">Portfolio is empty</p>
            <p className="text-slate-600 text-sm">Browse sectors and add stocks to get started</p>
          </div>
        </div>
      ) : (
        <>
          {/* Clustering Analysis */}
          <div className="mb-10 glass-surface p-6">
            <ClusteringPlot portfolioId={portfolioInfo?.portfolio_id} />
          </div>

          {/* Stocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((item, index) => (
              <div
                key={item.id}
                className="glass-card p-5 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {item.stock.name}
                    </h3>
                    <p className="text-xs text-blue-400/80 font-semibold mt-0.5">{item.stock.symbol}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.stock.sector.name}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-3.5 mb-4 border border-white/[0.04]">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Quantity</p>
                      <p className="text-xl font-bold text-white tabular-nums">{item.quantity}</p>
                    </div>
                    <p className="text-xs text-slate-600">units</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => onStockClick(item.stock.symbol)}
                    className="flex-1 px-3 py-2 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06] hover:border-white/[0.1] font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>
                  <button
                    onClick={() => removeStock(item.stock.id)}
                    className="flex-1 px-3 py-2 bg-red-500/8 text-red-400 hover:bg-red-500/15 border border-red-500/15 hover:border-red-500/30 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Portfolio;
