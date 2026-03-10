import React, { useState } from "react";
import { BarChart3, TrendingUp, Home as HomeIcon, Sparkles, Search } from "lucide-react";
import Home from "./pages/Home";
import RegressionAnalysis from "./pages/RegressionAnalysis";
import SectorList from "./components/SectorList";
import StockList from "./components/StockList";
import Portfolio from "./components/Portfolio";
import PortfolioList from "./components/PortfolioList";
import PortfolioCreate from "./components/PortfolioCreate";
import StockDetail from "./pages/StockDetail";

function App() {
  const [sectorId, setSectorId] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);
  const [portfolioRefresh, setPortfolioRefresh] = useState(0);

  const handleStockClick = (symbol) => {
    setSelectedStockSymbol(symbol);
  };

  const handleBackFromDetail = () => {
    setSelectedStockSymbol(null);
  };

  const handlePortfolioCreated = () => {
    setPortfolioRefresh((prev) => prev + 1);
  };

  const tabs = [
    { id: "home", label: "Home", icon: <HomeIcon className="w-4 h-4" />, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/25" },
    { id: "browse", label: "Browse", icon: <Search className="w-4 h-4" />, gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/25" },
    { id: "regression", label: "Analysis", icon: <Sparkles className="w-4 h-4" />, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/25" },
    { id: "portfolio", label: "Portfolio", icon: <TrendingUp className="w-4 h-4" />, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/25" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-glow-pulse">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Stock Portfolio</h1>
                <p className="text-xs text-slate-500 font-medium">Market Intelligence</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1 bg-white/[0.03] rounded-full p-1 border border-white/[0.06]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedStockSymbol(null);
                  }}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.shadow}`
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedStockSymbol ? (
          <StockDetail symbol={selectedStockSymbol} onBack={handleBackFromDetail} />
        ) : activeTab === "home" ? (
          <Home onStockClick={handleStockClick} />
        ) : activeTab === "regression" ? (
          <RegressionAnalysis />
        ) : activeTab === "browse" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sectors Sidebar */}
            <div className="lg:col-span-1">
              <SectorList setSectorId={setSectorId} />
            </div>

            {/* Stocks Main Area */}
            <div className="lg:col-span-3">
              <StockList sectorId={sectorId} onStockClick={handleStockClick} portfolioId={selectedPortfolioId} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Portfolio Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">My Portfolios</h3>
                  <PortfolioCreate onCreated={handlePortfolioCreated} />
                </div>
                <PortfolioList
                  selectedPortfolioId={selectedPortfolioId}
                  onSelectPortfolio={setSelectedPortfolioId}
                  onRefresh={portfolioRefresh}
                />
              </div>
            </div>

            {/* Portfolio Main Area */}
            <div className="lg:col-span-3">
              {selectedPortfolioId ? (
                <Portfolio
                  portfolioId={selectedPortfolioId}
                  onStockClick={handleStockClick}
                  onPortfolioUpdate={handlePortfolioCreated}
                />
              ) : (
                <div className="glass-surface p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-5">
                    <TrendingUp className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">Select or create a portfolio to get started</p>
                  <p className="text-slate-600 text-sm mt-2">Your investments will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
