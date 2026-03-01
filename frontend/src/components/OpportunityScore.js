import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Zap, TrendingUp, AlertCircle } from "lucide-react";

function OpportunityScore({ opportunities }) {
  const score = opportunities.overall_score || 0;
  
  // Determine score quality
  let scoreQuality = "Poor";
  let scoreColor = "text-red-400";
  let bgGradient = "from-red-500 to-red-600";
  let description = "Review before investing";

  if (score >= 75) {
    scoreQuality = "Excellent";
    scoreColor = "text-green-400";
    bgGradient = "from-green-500 to-green-600";
    description = "Strong investment potential";
  } else if (score >= 60) {
    scoreQuality = "Good";
    scoreColor = "text-blue-400";
    bgGradient = "from-blue-500 to-blue-600";
    description = "Favorable conditions";
  } else if (score >= 45) {
    scoreQuality = "Fair";
    scoreColor = "text-yellow-400";
    bgGradient = "from-yellow-500 to-yellow-600";
    description = "Moderate opportunity";
  } else if (score >= 30) {
    scoreQuality = "Caution";
    scoreColor = "text-orange-400";
    bgGradient = "from-orange-500 to-orange-600";
    description = "Needs investigation";
  }

  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const COLORS = [
    score >= 75
      ? "#22c55e"
      : score >= 60
      ? "#3b82f6"
      : score >= 45
      ? "#eab308"
      : score >= 30
      ? "#f97316"
      : "#ef4444",
    "#334155",
  ];

  return (
    <div className="card bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-2 bg-gradient-to-br ${bgGradient} rounded-lg`}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Investment Score</h2>
      </div>

      {/* Circular Progress */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              startAngle={180}
              endAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Score Display */}
        <div className="text-center -mt-16 relative z-10 mb-4">
          <div className={`text-5xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-sm text-slate-400">out of 100</div>
        </div>
      </div>

      {/* Quality Badge */}
      <div className={`mb-6 p-4 bg-gradient-to-r ${bgGradient} rounded-lg text-center`}>
        <p className="text-white font-bold text-lg">{scoreQuality}</p>
        <p className="text-white/80 text-sm">{description}</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        {opportunities.pe_ratio_score !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-400">PE Ratio Score</span>
              <span className="text-sm font-bold text-blue-400">
                {opportunities.pe_ratio_score || 0}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(opportunities.pe_ratio_score || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {opportunities.price_to_book_score !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-400">Price to Book Score</span>
              <span className="text-sm font-bold text-purple-400">
                {opportunities.price_to_book_score || 0}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(opportunities.price_to_book_score || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {opportunities.dividend_score !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-400">Dividend Score</span>
              <span className="text-sm font-bold text-green-400">
                {opportunities.dividend_score || 0}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(opportunities.dividend_score || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {opportunities.technical_score !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-400">Technical Score</span>
              <span className="text-sm font-bold text-cyan-400">
                {opportunities.technical_score || 0}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(opportunities.technical_score || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      {opportunities.ticker && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2">Current Price</p>
          <p className="text-2xl font-bold text-white">
            ${opportunities.current_price?.toFixed(2) || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}

export default OpportunityScore;
