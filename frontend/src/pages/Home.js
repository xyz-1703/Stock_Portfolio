import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

function Home({ onStockClick }) {
  const [sectorsWithStocks, setSectorsWithStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSector, setExpandedSector] = useState(null);

  useEffect(() => {
    fetchSectorsWithStocks();
  }, []);

  const fetchSectorsWithStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://127.0.0.1:8000/api/home/sectors-with-stocks/");
      if (!response.ok) throw new Error("Failed to fetch sectors");
      const data = await response.json();
      setSectorsWithStocks(data);
      // Auto-expand first sector
      if (data.length > 0) {
        setExpandedSector(data[0].id);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sectors:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSector = (sectorId) => {
    setExpandedSector(expandedSector === sectorId ? null : sectorId);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    return `₹${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading market data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-semibold">Error loading market data</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Home Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Market Overview</h1>
        <p className="text-slate-400 text-lg">
          Explore sector-wise stocks with live pricing and discount information
        </p>
      </div>

      {/* Sectors with Stocks */}
      <div className="space-y-6">
        {sectorsWithStocks.map((sector) => (
          <div
            key={sector.id}
            className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-lg hover:shadow-blue-500/10 transition-all"
          >
            {/* Sector Header */}
            <button
              onClick={() => toggleSector(sector.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-white">{sector.name}</h2>
                  <p className="text-sm text-slate-400">
                    {sector.stock_count} {sector.stock_count === 1 ? "stock" : "stocks"}
                  </p>
                </div>
              </div>
              <div
                className={`p-2 rounded-lg bg-slate-700/50 transition-transform duration-300 ${
                  expandedSector === sector.id ? "rotate-180" : ""
                }`}
              >
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </button>

            {/* Stocks Table */}
            {expandedSector === sector.id && (
              <div className="px-6 pb-6 border-t border-slate-700/50 pt-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 bg-slate-800/30">
                        Symbol
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 bg-slate-800/30">
                        Company Name
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300 bg-slate-800/30">
                        Current Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300 bg-slate-800/30">
                        52-Week High
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300 bg-slate-800/30">
                        Discount
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300 bg-slate-800/30">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sector.stocks.map((stock, index) => (
                      <tr
                        key={stock.id}
                        className="border-b border-slate-700/30 hover:bg-slate-700/40 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-blue-300 group-hover:text-blue-200">
                            {stock.symbol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">{stock.name}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold ${stock.current_price ? "text-white" : "text-slate-500"}`}>
                            {formatPrice(stock.current_price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold ${stock.max_price ? "text-slate-300" : "text-slate-500"}`}>
                            {formatPrice(stock.max_price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            {stock.discount !== null && stock.discount !== undefined ? (
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                stock.discount >= 20
                                  ? "bg-green-500/20 text-green-300"
                                  : stock.discount >= 10
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}>
                                {stock.discount > 0 ? "-" : ""}{stock.discount.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-sm text-slate-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => onStockClick(stock.symbol)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/40 hover:to-blue-600/40 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 hover:text-blue-200 font-medium text-sm rounded transition-all"
                          >
                            <TrendingUp className="w-4 h-4" />
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
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400 text-lg">No sectors or stocks available</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
