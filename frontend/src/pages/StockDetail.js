import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import PriceChart from "../components/PriceChart";
import StockMetrics from "../components/StockMetrics";
import OpportunityScore from "../components/OpportunityScore";
import { apiUrl } from "../utils/api";

function StockDetail({ symbol, onBack }) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(apiUrl(`/api/stock/${symbol}/`));
        if (!response.ok) throw new Error("Failed to fetch stock details");
        const data = await response.json();
        setStock(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching stock details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockDetail();
    }
  }, [symbol]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading stock details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-semibold">Error loading stock</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return null;
  }

  const detail = stock.detail || {};
  const opportunities = stock.opportunities || {};

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Browse
      </button>

      {/* Stock Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{stock.name}</h1>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                {stock.symbol}
              </span>
            </div>
            {stock.sector && (
              <p className="text-slate-400">
                Sector: <span className="text-slate-200 font-medium">{stock.sector.name}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">${detail.current_price?.toFixed(2) || "N/A"}</div>
            <p className="text-slate-400 text-sm">Current Price</p>
          </div>
        </div>

        {stock.description && (
          <p className="text-slate-400 text-lg max-w-3xl">{stock.description}</p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Opportunity Score - Featured */}
        <div className="lg:col-span-1">
          <OpportunityScore opportunities={opportunities} />
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2">
          <StockMetrics stock={stock} detail={detail} />
        </div>
      </div>

      {/* Price Chart */}
      {stock.chart_data && stock.chart_data.length > 0 && (
        <div className="mb-8">
          <div className="card bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Price History</h2>
            </div>
            <PriceChart data={stock.chart_data} symbol={stock.symbol} />
          </div>
        </div>
      )}

      {/* Opportunities List */}
      {opportunities.opportunities && opportunities.opportunities.length > 0 && (
        <div className="card bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Investment Insights</h2>
          <div className="space-y-4">
            {opportunities.opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-slate-300">{opp}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockDetail;
