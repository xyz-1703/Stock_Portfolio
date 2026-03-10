import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Grid3X3 } from "lucide-react";

function SectorList({ setSectorId }) {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState(null);
  const [error, setError] = useState(null);
  const [stockCounts, setStockCounts] = useState({});

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://127.0.0.1:8000/api/sectors/");
      if (!response.ok) throw new Error("Failed to fetch sectors");
      const data = await response.json();
      setSectors(data);

      const counts = {};
      for (const sector of data) {
        try {
          const stockResponse = await fetch(
            `http://127.0.0.1:8000/api/stocks/${sector.id}/`
          );
          if (stockResponse.ok) {
            const stocks = await stockResponse.json();
            counts[sector.id] = stocks.length;
          }
        } catch (err) {
          counts[sector.id] = 0;
        }
      }
      setStockCounts(counts);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sectors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorClick = (sectorId) => {
    setSelectedSector(sectorId);
    setSectorId(sectorId);
  };

  return (
    <div className="glass-surface p-5">
      <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center">
          <Grid3X3 className="w-4 h-4 text-blue-400" />
        </div>
        <span>Sectors</span>
      </h2>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="ml-2 text-slate-500 text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && sectors.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">No sectors available</p>
      )}

      <div className="space-y-1.5">
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => handleSectorClick(sector.id)}
            className={`w-full px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 text-left flex items-center justify-between group ${selectedSector === sector.id
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/10 text-white border border-blue-500/30"
                : "text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent"
              }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedSector === sector.id ? "bg-blue-400" : "bg-slate-600 group-hover:bg-slate-400"
                }`}></div>
              <span>{sector.name}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-all tabular-nums ${selectedSector === sector.id
                ? "bg-blue-500/20 text-blue-300"
                : "bg-white/[0.04] text-slate-500 group-hover:text-slate-400"
              }`}>
              {stockCounts[sector.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SectorList;
