import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { Loader2, AlertCircle, RefreshCw, Info } from "lucide-react";
import { apiUrl } from "../utils/api";

function ClusteringPlot({ portfolioId }) {
  const [clusteringData, setClusteringData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nClusters, setNClusters] = useState(3);
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredAxis, setHoveredAxis] = useState(null);

  useEffect(() => {
    if (portfolioId) {
      fetchClusteringData();
    }
  }, [portfolioId]);

  const fetchClusteringData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        apiUrl(`/api/portfolios/${portfolioId}/clustering/?n_clusters=${nClusters}`)
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch clustering data");
      }
      
      const data = await response.json();
      setClusteringData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching clustering data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchClusteringData();
  };

  const handleNClustersChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 2 && value <= 10) {
      setNClusters(value);
    }
  };

  const applyNClusters = () => {
    fetchClusteringData();
  };

  const clusterPlotTraces = clusteringData?.plotly_data
    ? Array.from({ length: clusteringData.n_clusters }, (_, clusterId) => {
        const points = clusteringData.plotly_data.pc1
          .map((pc1, idx) => ({
            pc1,
            pc2: clusteringData.plotly_data.pc2[idx],
            symbol: clusteringData.plotly_data.symbols[idx],
            stockName: clusteringData.plotly_data.stock_names[idx],
            cluster: clusteringData.plotly_data.clusters[idx],
          }))
          .filter((p) => p.cluster === clusterId);

        return {
          x: points.map((p) => p.pc1),
          y: points.map((p) => p.pc2),
          mode: "markers+text",
          type: "scatter",
          name: `Cluster ${clusterId}`,
          text: points.map((p) => p.symbol),
          textposition: "top center",
          hovertemplate:
            "<b>%{text}</b><br>PC1: %{x:.2f}<br>PC2: %{y:.2f}<extra></extra>",
          marker: {
            color: clusteringData.plotly_data.cluster_colors[clusterId],
            size: 12,
            opacity: 0.85,
            line: { color: "#FFFFFF", width: 1.2 },
          },
          textfont: { color: "#E2E8F0", size: 10 },
        };
      })
    : [];

  const centroidTrace = clusteringData?.plotly_data
    ? {
        x: clusteringData.plotly_data.centers_pc1,
        y: clusteringData.plotly_data.centers_pc2,
        mode: "markers",
        type: "scatter",
        name: "Centroids",
        marker: {
          color: "#FACC15",
          size: 18,
          symbol: "star",
          line: { color: "#FFFFFF", width: 1.5 },
        },
        hovertemplate:
          "<b>Centroid</b><br>PC1: %{x:.2f}<br>PC2: %{y:.2f}<extra></extra>",
      }
    : null;

  if (error && !clusteringData) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!clusteringData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            Clustering Analysis
          </h3>
          <p className="text-slate-400 text-sm">
            PCA visualization of stock clusters in your portfolio
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="nClusters" className="text-slate-300 font-medium">
              Clusters:
            </label>
            <input
              id="nClusters"
              type="number"
              min="2"
              max="10"
              value={nClusters}
              onChange={handleNClustersChange}
              className="w-16 px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={applyNClusters}
            disabled={nClusters === clusteringData.n_clusters || loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed font-semibold rounded-lg transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:bg-slate-800 disabled:cursor-not-allowed border border-slate-600 font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Plot Image */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-slate-800/20 rounded-lg border border-slate-700">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Generating clustering plot...</p>
          </div>
        </div>
      ) : clusteringData.plotly_data ? (
        <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900/30">
          <Plot
            data={centroidTrace ? [...clusterPlotTraces, centroidTrace] : clusterPlotTraces}
            layout={{
              autosize: true,
              height: 460,
              margin: { l: 56, r: 24, t: 36, b: 54 },
              paper_bgcolor: "#0f172a",
              plot_bgcolor: "#16213e",
              font: { color: "#e2e8f0" },
              xaxis: {
                title: `PC1 (${(clusteringData.explained_variance.pc1 * 100).toFixed(1)}% variance)`,
                gridcolor: "rgba(148,163,184,0.25)",
                zeroline: false,
              },
              yaxis: {
                title: `PC2 (${(clusteringData.explained_variance.pc2 * 100).toFixed(1)}% variance)`,
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
      ) : clusteringData.plot_image ? (
        <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900/30">
          <img
            src={clusteringData.plot_image}
            alt="Clustering Plot"
            className="w-full h-auto"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 bg-slate-800/20 rounded-lg border border-slate-700">
          <p className="text-slate-400">No clustering plot available</p>
        </div>
      )}

      {/* Feature Contributions Tooltips */}
      {clusteringData.feature_contributions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PC1 Tooltip */}
          <div
            onMouseEnter={() => setHoveredAxis("pc1")}
            onMouseLeave={() => setHoveredAxis(null)}
            className="relative"
          >
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 cursor-help hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-400" />
                <h4 className="text-white font-semibold">
                  PC1 ({(clusteringData.explained_variance.pc1 * 100).toFixed(1)}% variance)
                </h4>
              </div>
              <p className="text-slate-400 text-xs mb-3">
                Hover to see top contributing features
              </p>
              {hoveredAxis === "pc1" && (
                <div className="space-y-2 bg-slate-900/50 rounded p-3 border-l-2 border-blue-500">
                  <p className="text-slate-300 text-xs font-semibold mb-2">Top Features:</p>
                  {clusteringData.feature_contributions.pc1.map((feature, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (feature.contribution /
                                  clusteringData.feature_contributions.pc1[0].contribution) *
                                  100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs">{feature.contribution.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PC2 Tooltip */}
          <div
            onMouseEnter={() => setHoveredAxis("pc2")}
            onMouseLeave={() => setHoveredAxis(null)}
            className="relative"
          >
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 cursor-help hover:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-purple-400" />
                <h4 className="text-white font-semibold">
                  PC2 ({(clusteringData.explained_variance.pc2 * 100).toFixed(1)}% variance)
                </h4>
              </div>
              <p className="text-slate-400 text-xs mb-3">
                Hover to see top contributing features
              </p>
              {hoveredAxis === "pc2" && (
                <div className="space-y-2 bg-slate-900/50 rounded p-3 border-l-2 border-purple-500">
                  <p className="text-slate-300 text-xs font-semibold mb-2">Top Features:</p>
                  {clusteringData.feature_contributions.pc2.map((feature, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (feature.contribution /
                                  clusteringData.feature_contributions.pc2[0].contribution) *
                                  100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs">{feature.contribution.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {clusteringData.cluster_info && Object.keys(clusteringData.cluster_info).length > 0 && (
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300 font-semibold text-sm mb-4 transition-colors"
          >
            {showDetails ? "Hide" : "Show"} Cluster Details
          </button>

          {showDetails && (
            <div className="space-y-4">
              {Object.entries(clusteringData.cluster_info).map(([clusterId, clusterData]) => (
                <div
                  key={clusterId}
                  className="bg-slate-800/40 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">
                      {clusterId.replace(/_/g, " ").toUpperCase()}
                    </h4>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full">
                      {clusterData.count} stocks
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {clusterData.avg_pe_ratio !== null && (
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Avg P/E Ratio</p>
                        <p className="text-white font-semibold">
                          {clusterData.avg_pe_ratio.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {clusterData.avg_market_cap !== null && (
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Avg Market Cap</p>
                        <p className="text-white font-semibold">
                          ${(clusterData.avg_market_cap / 1e9).toFixed(2)}B
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-700 pt-3">
                    <p className="text-slate-400 text-xs font-semibold mb-2">Stocks:</p>
                    <div className="flex flex-wrap gap-2">
                      {clusterData.stocks.map((stock, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded hover:bg-slate-700 transition-colors"
                        >
                          {stock.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explained Variance */}
      {clusteringData.explained_variance && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Variance Explained</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 text-sm">PC1</span>
                <span className="text-white font-semibold text-sm">
                  {(clusteringData.explained_variance.pc1 * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(clusteringData.explained_variance.pc1 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 text-sm">PC2</span>
                <span className="text-white font-semibold text-sm">
                  {(clusteringData.explained_variance.pc2 * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(clusteringData.explained_variance.pc2 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-3">
            Total variance explained: {((clusteringData.explained_variance.pc1 + clusteringData.explained_variance.pc2) * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default ClusteringPlot;
