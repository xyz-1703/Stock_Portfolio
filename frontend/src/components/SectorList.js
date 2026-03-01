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
      
      // Fetch stock counts for each sector
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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-blue-500/20 rounded-lg">
          <Grid3X3 className="w-5 h-5 text-blue-400" />
        </div>
        Sectors
      </h2>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="ml-2 text-slate-400">Loading sectors...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && sectors.length === 0 && (
        <p className="text-slate-400 text-center py-8">No sectors available</p>
      )}

      <div className="space-y-2">
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => handleSectorClick(sector.id)}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left flex items-center justify-between group ${
              selectedSector === sector.id
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105 origin-left"
                : "bg-slate-700/40 text-slate-100 hover:bg-slate-700/60 hover:text-white border border-slate-600/30 hover:border-slate-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full transition-all ${
                selectedSector === sector.id ? "bg-white" : "bg-slate-500 group-hover:bg-blue-400"
              }`}></div>
              <span>{sector.name}</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
              selectedSector === sector.id
                ? "bg-white/20 text-white"
                : "bg-slate-600/50 text-slate-300 group-hover:bg-slate-500"
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
