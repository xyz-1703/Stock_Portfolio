import React, { useEffect, useState, useMemo } from "react";
import { Plus, Loader2, AlertCircle, CheckCircle2, Eye, Search, X } from "lucide-react";

function StockList({ sectorId, onStockClick, portfolioId }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [addingStock, setAddingStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPortfolioSelector, setShowPortfolioSelector] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(portfolioId || null);

  useEffect(() => {
    if (sectorId) {
      fetchStocks();
      setCurrentPage(1);
      setSearchQuery("");
    } else {
      setStocks([]);
      setError(null);
    }
  }, [sectorId]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/api/stocks/${sectorId}/`);
      if (!response.ok) throw new Error("Failed to fetch stocks");
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching stocks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) =>
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stocks, searchQuery]);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, startIndex + itemsPerPage);

  const addStock = async (stockId, stockName) => {
    if (portfolioId) {
      setAddingStock(stockId);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/add-stock/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock_id: stockId, portfolio_id: portfolioId }),
        });
        if (!response.ok) throw new Error("Failed to add stock");
        setSuccessMessage(`Added ${stockName} to portfolio`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError(`Failed to add ${stockName}: ${err.message}`);
        setTimeout(() => setError(""), 3000);
      } finally {
        setAddingStock(null);
      }
    } else {
      setSelectedStock({ id: stockId, name: stockName });
      setShowPortfolioSelector(true);
      fetchPortfolios();
    }
  };

  const fetchPortfolios = async () => {
    try {
      setPortfoliosLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/portfolios/");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();
      setPortfolios(data.portfolios || []);
      if (data.portfolios && data.portfolios.length > 0) {
        setSelectedPortfolioId(data.portfolios[0].id);
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
      setError("Failed to load portfolios");
    } finally {
      setPortfoliosLoading(false);
    }
  };

  const confirmAddStock = async () => {
    if (!selectedStock || !selectedPortfolioId) return;
    setAddingStock(selectedStock.id);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/add-stock/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_id: selectedStock.id, portfolio_id: selectedPortfolioId }),
      });
      if (!response.ok) throw new Error("Failed to add stock");
      setSuccessMessage(`Added ${selectedStock.name} to portfolio`);
      setShowPortfolioSelector(false);
      setSelectedStock(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Failed to add ${selectedStock.name}: ${err.message}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setAddingStock(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
          {sectorId ? "Available Stocks" : "Select a Sector"}
        </h2>
        <p className="text-slate-500 text-sm">
          {sectorId
            ? `${filteredStocks.length} stocks available in this sector`
            : "Choose a sector from the sidebar to explore stocks"}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 glass-surface !border-emerald-500/20 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-emerald-300 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 glass-surface !border-red-500/20 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      {sectorId && stocks.length > 0 && (
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <p className="text-slate-500 text-sm">Loading stocks...</p>
          </div>
        </div>
      )}

      {/* No Sector Selected */}
      {!sectorId && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Select a sector to explore</p>
            <p className="text-slate-600 text-sm mt-1">Browse stocks by industry sector</p>
          </div>
        </div>
      )}

      {/* Stocks Grid */}
      {!loading && paginatedStocks.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {paginatedStocks.map((stock, index) => (
              <div
                key={stock.id}
                className="glass-card p-5 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {stock.name}
                    </h3>
                    <p className="text-xs text-blue-400/80 font-semibold mt-0.5">{stock.symbol}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <svg className="w-4.5 h-4.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                <p className="text-slate-600 text-xs mb-5">
                  Add this stock to your portfolio
                </p>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => onStockClick(stock.symbol)}
                    className="flex-1 px-3 py-2 bg-white/[0.04] text-slate-300 font-medium text-sm rounded-lg hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-white/[0.06] hover:border-white/[0.1]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button
                    onClick={() => addStock(stock.id, stock.name)}
                    disabled={addingStock === stock.id}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm rounded-lg hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 btn-glow"
                  >
                    {addingStock === stock.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-8 glass-surface p-4">
              <div className="text-xs text-slate-500 tabular-nums">
                {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredStocks.length)} of {filteredStocks.length}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 bg-white/[0.04] text-slate-300 text-sm rounded-lg hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/[0.06]"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${currentPage === page
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 border border-transparent"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 bg-white/[0.04] text-slate-300 text-sm rounded-lg hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/[0.06]"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredStocks.length === 0 && sectorId && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">
              {searchQuery ? "No stocks match your search" : "No stocks in this sector"}
            </p>
            <p className="text-slate-600 text-sm mt-1">Try a different search term or sector</p>
          </div>
        </div>
      )}

      {/* Portfolio Selector Modal */}
      {showPortfolioSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-surface !rounded-2xl shadow-2xl shadow-black/40 max-w-md w-full animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white">Add to Portfolio</h3>
              <button
                onClick={() => {
                  setShowPortfolioSelector(false);
                  setSelectedStock(null);
                  setSelectedPortfolioId(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {selectedStock && (
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Stock</p>
                  <p className="text-white font-semibold">{selectedStock.name}</p>
                </div>
              )}

              {portfoliosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-2" />
                  <span className="text-slate-500 text-sm">Loading portfolios...</span>
                </div>
              ) : portfolios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-2 font-medium">No portfolios found</p>
                  <p className="text-slate-600 text-sm">Create a portfolio first</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {portfolios.map((portfolio) => (
                    <button
                      key={portfolio.id}
                      onClick={() => setSelectedPortfolioId(portfolio.id)}
                      className={`w-full p-3.5 rounded-xl text-left transition-all border ${selectedPortfolioId === portfolio.id
                          ? "bg-blue-500/15 border-blue-500/30 text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{portfolio.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {portfolio.stocks_count} {portfolio.stocks_count === 1 ? "stock" : "stocks"}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedPortfolioId === portfolio.id
                              ? "bg-blue-500 border-blue-500"
                              : "border-white/10"
                            }`}
                        >
                          {selectedPortfolioId === portfolio.id && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  setShowPortfolioSelector(false);
                  setSelectedStock(null);
                  setSelectedPortfolioId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] font-medium text-sm rounded-xl transition-colors border border-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddStock}
                disabled={!selectedPortfolioId || addingStock === selectedStock?.id}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 btn-glow"
              >
                {addingStock === selectedStock?.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockList;
