import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, TrendingUp, RefreshCw, ChevronDown } from "lucide-react";
import { apiUrl } from "../utils/api";

function Home({ onStockClick }) {
  const [sectorsWithStocks, setSectorsWithStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSector, setExpandedSector] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSectorsWithStocks();
    const interval = setInterval(fetchSectorsWithStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSectorsWithStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(apiUrl("/api/home/sectors-with-stocks/"));
      if (!response.ok) throw new Error("Failed to fetch sectors");
      const data = await response.json();
      setSectorsWithStocks(data);
      setLastUpdated(new Date());
      if (data.length > 0) {
        setExpandedSector(data[0].id);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sectors:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSectorsWithStocks();
  };

  const toggleSector = (sectorId) => {
    setExpandedSector(expandedSector === sectorId ? null : sectorId);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    return `$${price.toFixed(2)}`;
  };

  const getFormattedTime = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
          <p className="text-slate-400 font-medium">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-surface p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-red-300 font-semibold">Error loading market data</p>
          <p className="text-red-200/60 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Home Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 text-glow">
            Market Overview
          </h1>
          <p className="text-slate-400 text-lg font-light">
            Explore sector-wise stocks with live pricing and discount data
          </p>
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-slate-500 text-sm">
                Updated <span className="text-slate-400 font-medium">{getFormattedTime()}</span>
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Sectors with Stocks */}
      <div className="space-y-4">
        {sectorsWithStocks.map((sector, sectorIndex) => (
          <div
            key={sector.id}
            className="glass-surface overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${sectorIndex * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}
          >
            {/* Sector Header */}
            <button
              onClick={() => toggleSector(sector.id)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">{sector.name}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {sector.stock_count} {sector.stock_count === 1 ? "stock" : "stocks"}
                  </p>
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center transition-transform duration-300 ${expandedSector === sector.id ? "rotate-180" : ""
                  }`}
              >
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {/* Stocks Table */}
            {expandedSector === sector.id && (
              <div className="px-6 pb-6 overflow-x-auto">
                <div className="divider-gradient mb-6"></div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        52W High
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {sector.stocks.map((stock, index) => (
                      <tr
                        key={stock.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-bold text-blue-400 group-hover:text-blue-300">
                            {stock.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-slate-300">{stock.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${stock.current_price ? "text-white" : "text-slate-600"}`}>
                            {formatPrice(stock.current_price)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`text-sm tabular-nums ${stock.max_price ? "text-slate-400" : "text-slate-600"}`}>
                            {formatPrice(stock.max_price)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end">
                            {stock.discount !== null && stock.discount !== undefined ? (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tabular-nums ${stock.discount >= 20
                                ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
                                : stock.discount >= 10
                                  ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20"
                                  : "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20"
                                }`}>
                                {stock.discount > 0 ? "-" : ""}{stock.discount.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => onStockClick(stock.symbol)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-blue-500/30 text-slate-300 hover:text-blue-300 font-medium text-xs rounded-lg transition-all"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sectorsWithStocks.length === 0 && !loading && (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-slate-400 text-lg font-medium">No market data available</p>
            <p className="text-slate-600 text-sm mt-2">Check back later for updates</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
