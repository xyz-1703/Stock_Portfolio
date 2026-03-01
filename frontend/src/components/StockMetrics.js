import React from "react";
import { TrendingUp, DollarSign, BarChart3, PieChart, Activity, Target } from "lucide-react";

function StockMetrics({ stock, detail }) {
  const metrics = [
    {
      label: "PE Ratio",
      value: detail.pe_ratio ? detail.pe_ratio.toFixed(2) : "N/A",
      icon: Target,
      description: "Price to Earnings ratio",
      color: "from-blue-500 to-blue-600",
      benchmark: { value: 20, label: "Market Avg: 20" },
    },
    {
      label: "Price to Book",
      value: detail.price_to_book ? detail.price_to_book.toFixed(2) : "N/A",
      icon: BarChart3,
      description: "Market value vs Book value",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Dividend Yield",
      value: detail.dividend_yield ? `${(detail.dividend_yield * 100).toFixed(2)}%` : "N/A",
      icon: TrendingUp,
      description: "Annual dividend return",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Market Cap",
      value: detail.market_cap
        ? `$${(detail.market_cap / 1e12).toFixed(2)}T`
        : "N/A",
      icon: DollarSign,
      description: "Total market value",
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "52-Week High",
      value: detail.fifty_two_week_high ? `$${detail.fifty_two_week_high.toFixed(2)}` : "N/A",
      icon: Activity,
      description: "Year maximum price",
      color: "from-red-500 to-red-600",
    },
    {
      label: "52-Week Low",
      value: detail.fifty_two_week_low ? `$${detail.fifty_two_week_low.toFixed(2)}` : "N/A",
      icon: Activity,
      description: "Year minimum price",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      label: "ROE",
      value: detail.return_on_equity ? `${(detail.return_on_equity * 100).toFixed(2)}%` : "N/A",
      icon: PieChart,
      description: "Return on Equity",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Day's Range",
      value: detail.day_low && detail.day_high
        ? `$${detail.day_low.toFixed(2)} - $${detail.day_high.toFixed(2)}`
        : "N/A",
      icon: BarChart3,
      description: "Today's price range",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className="card bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/80 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 bg-gradient-to-br ${metric.color} rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-400 mb-1">
              {metric.label}
            </h3>
            <p className="text-2xl font-bold text-white mb-2">
              {metric.value}
            </p>
            <p className="text-xs text-slate-500">{metric.description}</p>
            {metric.benchmark && (
              <p className="text-xs text-slate-600 mt-2">
                {metric.benchmark.label}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StockMetrics;
