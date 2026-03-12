import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { apiUrl } from "../utils/api";

function RegressionAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputGoldPrice, setInputGoldPrice] = useState("");

  useEffect(() => {
    fetchRegressionData();
  }, []);

  const fetchRegressionData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Metal type parameter is ignored - always analyzes both gold and silver together
      const response = await fetch(
        apiUrl("/api/regression/precious-metals/?metal=gold")
      );
      if (!response.ok) throw new Error("Failed to fetch regression data");
      const result = await response.json();
      setData(result);
      if (result?.statistics?.gold_avg_price) {
        setInputGoldPrice(result.statistics.gold_avg_price.toFixed(2));
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching regression data:", err);
      setData(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRegressionData();
  };

  const goldPriceNumeric = Number(inputGoldPrice);
  const slope = Number(data?.statistics?.slope ?? 0);
  const intercept = Number(data?.statistics?.intercept ?? 0);
  const hasPredictionInput = Number.isFinite(goldPriceNumeric) && goldPriceNumeric > 0;
  const predictedSilverPrice = hasPredictionInput
    ? intercept + slope * goldPriceNumeric
    : null;

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading regression analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 font-semibold">Error loading analysis</p>
            <p className="text-red-200 text-sm mt-1 mb-3">
              {error || data?.error}
            </p>
            <div className="bg-red-900/30 rounded p-3 text-red-200 text-xs space-y-2">
              <p className="font-semibold">Possible solutions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure your internet connection is working</li>
                <li>yfinance may be temporarily unavailable</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-yellow-500/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full" />
      {/* Page Header */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Precious Metals Model
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-yellow-400" />
              Gold & Silver Correlation
            </h1>
            <p className="text-slate-300 text-base sm:text-lg">
              Analyzing how gold and silver prices move together
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      {data && !data.error && (
        <div className="space-y-6 relative z-10">
          {/* Main Correlation Plot */}
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/40 backdrop-blur-sm">
            <div className="p-5 sm:p-6 border-b border-slate-700/70 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Gold & Silver Price Correlation
              </h2>
            </div>
            <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-900/40 to-slate-950/60">
              {data.plotly_data ? (
                <div className="w-full max-w-4xl mx-auto rounded-xl border border-slate-700 shadow-lg overflow-hidden bg-slate-950/70">
                  <Plot
                    data={[
                      {
                        x: data.plotly_data.gold_prices,
                        y: data.plotly_data.silver_prices,
                        mode: "markers",
                        type: "scatter",
                        name: "Historical GLD-SLV Prices",
                        marker: {
                          color: "#FACC15",
                          size: 7,
                          opacity: 0.7,
                          line: { color: "#FFFFFF", width: 1 },
                        },
                      },
                      {
                        x: data.plotly_data.regression_x,
                        y: data.plotly_data.regression_y,
                        mode: "lines",
                        type: "scatter",
                        name: "Regression Line",
                        line: { color: "#FF006E", width: 3 },
                      },
                      ...(predictedSilverPrice !== null
                        ? [
                            {
                              x: [goldPriceNumeric],
                              y: [predictedSilverPrice],
                              mode: "markers",
                              type: "scatter",
                              name: "Predicted Point",
                              marker: {
                                color: "#22D3EE",
                                size: 11,
                                symbol: "diamond",
                                line: { color: "#FFFFFF", width: 1.5 },
                              },
                            },
                          ]
                        : []),
                    ]}
                    layout={{
                      autosize: true,
                      height: 360,
                      margin: { l: 56, r: 24, t: 30, b: 52 },
                      paper_bgcolor: "#0f172a",
                      plot_bgcolor: "#16213e",
                      font: { color: "#e2e8f0" },
                      xaxis: {
                        title: "Gold Price - GLD ($)",
                        gridcolor: "rgba(148,163,184,0.25)",
                        zeroline: false,
                      },
                      yaxis: {
                        title: "Silver Price - SLV ($)",
                        gridcolor: "rgba(148,163,184,0.25)",
                        zeroline: false,
                      },
                      legend: {
                        orientation: "h",
                        yanchor: "bottom",
                        y: 1.02,
                        xanchor: "left",
                        x: 0,
                        bgcolor: "rgba(15,23,42,0.65)",
                      },
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: "100%" }}
                    useResizeHandler
                  />
                </div>
              ) : data.plot_image ? (
                <img
                  src={data.plot_image}
                  alt="Gold-Silver Correlation Plot"
                  className="w-full max-w-4xl mx-auto h-auto rounded-xl border border-slate-700 shadow-lg"
                />
              ) : (
                <div className="text-slate-400 text-center py-20">
                  No plot available
                </div>
              )}
            </div>
          </div>

          {/* Key Statistics Cards */}
          {data.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pearson Correlation */}
              <div className="bg-gradient-to-br from-indigo-900/35 to-violet-900/25 border border-indigo-500/35 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-200 text-sm font-semibold">Pearson Correlation</span>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-purple-300">
                  {data.statistics.pearson_correlation?.toFixed(4)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Range: -1 to +1
                </div>
                <div className="text-xs text-slate-300 mt-1 font-medium">
                  {data.statistics.pearson_correlation > 0.9
                    ? "Very strong positive correlation"
                    : data.statistics.pearson_correlation > 0.7
                      ? "Strong positive correlation"
                      : "Moderate correlation"}
                </div>
              </div>

              {/* R² Score */}
              <div className="bg-gradient-to-br from-blue-900/35 to-cyan-900/25 border border-blue-500/35 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-200 text-sm font-semibold">R² Score</span>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-300">
                  {(data.statistics.r_squared * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Model fit quality
                </div>
                <div className="text-xs text-slate-300 mt-1 font-medium">
                  {(data.statistics.r_squared * 100).toFixed(2)}% variance explained
                </div>
              </div>

              {/* RMSE */}
              <div className="bg-gradient-to-br from-emerald-900/35 to-green-900/25 border border-emerald-500/35 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-200 text-sm font-semibold">RMSE</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-green-300">
                  ${data.statistics.rmse.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Average prediction error
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {data.statistics && (
            <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-950/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Regression Model
              </h3>
              <div className="bg-slate-950/70 border border-slate-700 rounded-lg p-4 mb-4 overflow-x-auto">
                <code className="text-emerald-300 font-mono text-sm sm:text-base whitespace-nowrap">
                  Silver = {data.statistics.intercept?.toFixed(2)} + {data.statistics.slope?.toFixed(6)} × Gold
                </code>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Avg Gold Price:</span>
                  <div className="text-yellow-300 font-semibold text-xl">
                    ${data.statistics.gold_avg_price?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Avg Silver Price:</span>
                  <div className="text-slate-200 font-semibold text-xl">
                    ${data.statistics.silver_avg_price?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Panel */}
          {data.statistics && (
            <div className="bg-slate-900/80 border border-cyan-700/40 rounded-2xl p-5 sm:p-6 shadow-xl shadow-cyan-950/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Silver Price Prediction (Linear Regression)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <label className="block">
                  <span className="text-slate-300 text-sm">Gold Price Input ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inputGoldPrice}
                    onChange={(e) => setInputGoldPrice(e.target.value)}
                    className="mt-2 w-full bg-slate-950/70 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter gold price"
                  />
                </label>
                <div className="bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-400">Model Equation</p>
                  <p className="text-sm text-emerald-300 font-mono truncate">
                    Silver = {intercept.toFixed(2)} + {slope.toFixed(6)} * Gold
                  </p>
                </div>
                <div className="bg-cyan-900/20 border border-cyan-600/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-300">Predicted Silver Price</p>
                  <p className="text-2xl font-bold text-cyan-300">
                    {predictedSilverPrice !== null ? `$${predictedSilverPrice.toFixed(2)}` : "--"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Enter a gold price to estimate silver price using the fitted linear regression model.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RegressionAnalysis;
