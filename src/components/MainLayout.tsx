import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SettingsModal } from "./SettingsModal";
import { Calculator } from "./Calculator";
import { useAppContext } from "../contexts/AppContext";

const MainLayout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  const {
    showExchangeRate,
    showTotalProfit,
    onToggleExchangeRate,
    onToggleTotalProfit,
    divineToChaoRate,
    totalProfitCurrency,
    getTotalProfitByFilter,
    getCompletedProfitByFilter,
    profitMode,
    chaosToDiv,
    divToChaos,
    CURRENCY_IMAGES,
    setDivineToChaoRate,
    setProfitMode,
    profitFilter,
    setProfitFilter,
    groups,
    showSidebar,
    onToggleSidebar,
    showCalculator,
    onToggleCalculator,
    selectedLeague,
    setSelectedLeague,
    apiRate,
    apiLastUpdated,
    isLoadingApiRate,
    enableApiCalls,
    setEnableApiCalls,
    loadApiRate
  } = useAppContext();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <Header
        searchTerm={isHome ? searchTerm : undefined}
        onSearchChange={isHome ? setSearchTerm : undefined}
        showExchangeRate={showExchangeRate}
        showTotalProfit={showTotalProfit}
        onToggleExchangeRate={onToggleExchangeRate}
        onToggleTotalProfit={onToggleTotalProfit}
        divineToChaoRate={divineToChaoRate}
        totalProfitCurrency={totalProfitCurrency}
        getTotalProfitByFilter={getTotalProfitByFilter || undefined}
        getCompletedProfitByFilter={getCompletedProfitByFilter || undefined}
        profitMode={profitMode}
        chaosToDiv={chaosToDiv || undefined}
        divToChaos={divToChaos || undefined}
        CURRENCY_IMAGES={CURRENCY_IMAGES}
        onManualRateChange={setDivineToChaoRate}
        onProfitModeChange={setProfitMode}
        onProfitFilterChange={setProfitFilter}
        profitFilter={profitFilter}
        groups={groups}
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
        onReloadExchangeRate={loadApiRate}
        apiRate={apiRate}
        isLoadingApiRate={isLoadingApiRate}
        apiLastUpdated={apiLastUpdated}
        enableApiCalls={enableApiCalls}
      />
      <main className="flex-1">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </main>
      <Footer />
      
      {/* Settings Modal */}
      <SettingsModal
        showExchangeRate={showExchangeRate}
        showTotalProfit={showTotalProfit}
        onToggleExchangeRate={onToggleExchangeRate}
        onToggleTotalProfit={onToggleTotalProfit}
        showSidebar={showSidebar}
        onToggleSidebar={onToggleSidebar}
        enableApiCalls={enableApiCalls}
        onToggleApiCalls={() => setEnableApiCalls(!enableApiCalls)}
        showCalculator={showCalculator}
        onToggleCalculator={onToggleCalculator}
      />

      {/* Calculator */}
      <Calculator
        isOpen={showCalculator}
        onClose={() => onToggleCalculator()}
      />
    </div>
  );
};

export default MainLayout; 