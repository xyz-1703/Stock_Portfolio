import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Trash2, Eye } from "lucide-react";

function Portfolio({ onStockClick }) {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://127.0.0.1:8000/api/portfolio/");
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (stockId) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/remove-stock/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock_id: stockId }),
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
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">My Portfolio</h2>
        <p className="text-slate-400">Your investment portfolio</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {portfolio.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-slate-400 mb-4">Your portfolio is empty</p>
            <p className="text-slate-500 text-sm">Browse sectors and add stocks to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="card bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur border border-slate-700 rounded-xl p-6 group hover:border-blue-500/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.stock.name}
                  </h3>
                  <p className="text-sm text-blue-400 font-semibold">{item.stock.symbol}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.stock.sector.name}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Quantity</p>
                    <p className="text-2xl font-bold text-white">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Units owned</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onStockClick(item.stock.symbol)}
                  className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50 hover:border-slate-500 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => removeStock(item.stock.id)}
                  className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Portfolio;
