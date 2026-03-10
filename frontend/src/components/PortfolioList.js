import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";

function PortfolioList({ selectedPortfolioId, onSelectPortfolio, onRefresh }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolios();
  }, [onRefresh]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://127.0.0.1:8000/api/portfolios/");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();
      setPortfolios(data.portfolios || []);

      if (selectedPortfolioId === null && data.portfolios?.length > 0) {
        onSelectPortfolio(data.portfolios[0].id);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching portfolios:", err);
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolio = async (portfolioId) => {
    if (!window.confirm("Are you sure you want to delete this portfolio?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/portfolios/${portfolioId}/delete/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete portfolio");
      await fetchPortfolios();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting portfolio:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        {portfolios.length === 0 ? (
          <p className="text-slate-500 text-sm">No portfolios yet</p>
        ) : (
          portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              onClick={() => onSelectPortfolio(portfolio.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${selectedPortfolioId === portfolio.id
                  ? "bg-emerald-500/10 border-emerald-500/25 text-white"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{portfolio.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{portfolio.stocks_count} stocks</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePortfolio(portfolio.id);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition-colors"
                  title="Delete portfolio"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400/70 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PortfolioList;
