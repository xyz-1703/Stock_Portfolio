import React, { useState } from "react";
import { BarChart3, TrendingUp, Home as HomeIcon } from "lucide-react";
import Home from "./pages/Home";
import SectorList from "./components/SectorList";
import StockList from "./components/StockList";
import Portfolio from "./components/Portfolio";
import StockDetail from "./pages/StockDetail";

function App() {
  const [sectorId, setSectorId] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);

  const handleStockClick = (symbol) => {
    setSelectedStockSymbol(symbol);
  };

  const handleBackFromDetail = () => {
    setSelectedStockSymbol(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Stock Portfolio</h1>
                <p className="text-sm text-slate-400">Manage your investments</p>
              </div>
            </div>
            
            {/* Enhanced Navigation Buttons */}
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-full p-1.5 border border-slate-700/50">
              <button
                onClick={() => {
                  setActiveTab("home");
                  setSelectedStockSymbol(null);
                }}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "home"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => {
                  setActiveTab("browse");
                  setSelectedStockSymbol(null);
                }}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "browse"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span>🔍</span>
                Browse
              </button>
              <button
                onClick={() => {
                  setActiveTab("portfolio");
                  setSelectedStockSymbol(null);
                }}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "portfolio"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Portfolio
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {selectedStockSymbol ? (
          <StockDetail symbol={selectedStockSymbol} onBack={handleBackFromDetail} />
        ) : activeTab === "home" ? (
          <Home onStockClick={handleStockClick} />
        ) : activeTab === "browse" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sectors Sidebar */}
            <div className="lg:col-span-1">
              <SectorList setSectorId={setSectorId} />
            </div>

            {/* Stocks Main Area */}
            <div className="lg:col-span-3">
              <StockList sectorId={sectorId} onStockClick={handleStockClick} />
            </div>
          </div>
        ) : (
          <Portfolio onStockClick={handleStockClick} />
        )}
      </main>
    </div>
  );
}

export default App;
