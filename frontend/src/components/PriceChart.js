import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

function PriceChart({ data, symbol }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No price data available
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    close: parseFloat(item.close?.toFixed(2)),
    high: parseFloat(item.high?.toFixed(2)),
    low: parseFloat(item.low?.toFixed(2)),
    open: parseFloat(item.open?.toFixed(2)),
    volume: item.volume,
    fullDate: item.date,
  }));

  const minPrice = Math.min(...chartData.map((d) => d.close)) * 0.98;
  const maxPrice = Math.max(...chartData.map((d) => d.close)) * 1.02;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#94a3b8" }}
        />
        <YAxis
          stroke="#94a3b8"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#94a3b8" }}
          domain={[minPrice, maxPrice]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
            color: "#e2e8f0",
          }}
          formatter={(value) => `$${value.toFixed(2)}`}
          labelStyle={{ color: "#e2e8f0" }}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorClose)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
