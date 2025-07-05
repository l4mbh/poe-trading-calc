import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CURRENCY_IMAGES, POE_LEAGUES } from "../utils/constants";
import { formatTime } from "../utils/currencyUtils";
import { showInfoToast } from "../utils/toastUtils";

interface StickyLeftSidebarProps {
  divineToChaoRate: number;
  totalProfitCurrency: "chaos" | "divine";
  currentTotalProfit: number;
  currentCompletedProfit: number;
  chaosToDiv: (chaosAmount: number) => number;
  divToChaos: (divAmount: number) => number;
  onUpdateExchangeRate: () => void;
  onToggleTotalProfitCurrency: () => void;
  selectedLeague: string;
  apiRate: number | null;
  apiLastUpdated: Date | null;
  isLoadingApiRate: boolean;
  enableApiCalls: boolean;
  onLeagueChange: (league: string) => void;
  onManualRateChange: (rate: number) => void;
  onToggleApiCalls: () => void;
  groups: Array<{ id: string; name: string; color: string }>;
  profitFilter: "all" | "selected" | string;
  onProfitFilterChange: (filter: "all" | "selected" | string) => void;
  onSidebarToggle: (isCollapsed: boolean) => void;
  profitMode: "active" | "completed";
  onProfitModeChange: (mode: "active" | "completed") => void;
}

export function StickyLeftSidebar({
  divineToChaoRate,
  totalProfitCurrency,
  currentTotalProfit,
  currentCompletedProfit,
  chaosToDiv,
  divToChaos,
  onUpdateExchangeRate,
  onToggleTotalProfitCurrency,
  selectedLeague,
  apiRate,
  apiLastUpdated,
  isLoadingApiRate,
  enableApiCalls,
  onLeagueChange,
  onManualRateChange,
  onToggleApiCalls,
  groups,
  profitFilter,
  onProfitFilterChange,
  onSidebarToggle,
  profitMode,
  onProfitModeChange,
}: StickyLeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const [leagueInput, setLeagueInput] = useState(selectedLeague);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local input when selectedLeague changes
  useEffect(() => {
    setLeagueInput(selectedLeague);
  }, [selectedLeague]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLeagueDropdown(false);
        // Apply the input value when clicking outside
        if (leagueInput.trim() && leagueInput !== selectedLeague) {
          onLeagueChange(leagueInput.trim());
        }
      }
    };

    if (showLeagueDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLeagueDropdown, leagueInput, selectedLeague, onLeagueChange]);

  // Filter leagues based on input
  const filteredLeagues = POE_LEAGUES.filter((league) =>
    league.toLowerCase().includes(leagueInput.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeagueInput(e.target.value);
    setShowLeagueDropdown(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (leagueInput.trim()) {
        onLeagueChange(leagueInput.trim());
        setShowLeagueDropdown(false);
      }
    } else if (e.key === "Escape") {
      setShowLeagueDropdown(false);
      setLeagueInput(selectedLeague);
    } else if (e.key === "ArrowDown" && filteredLeagues.length > 0) {
      e.preventDefault();
      setShowLeagueDropdown(true);
    }
  };

  const handleLeagueSelect = (league: string) => {
    setLeagueInput(league);
    onLeagueChange(league);
    setShowLeagueDropdown(false);
  };

  const toggleDropdown = () => {
    setShowLeagueDropdown(!showLeagueDropdown);
    if (!showLeagueDropdown && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onSidebarToggle(newCollapsed);
  };

  return (
    <div
      className={`fixed left-0 top-[4.5rem] h-[calc(100vh-4.5rem)] bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50 z-20 transition-all duration-300 shadow-lg ${
        isCollapsed ? "w-24" : "w-72"
      } overflow-y-auto`}
    >
      <div className={`${isCollapsed ? "p-2" : "p-4"} space-y-4`}>
        {/* Toggle Button */}
        <div
          className={`flex ${isCollapsed ? "justify-center" : "justify-end"}`}
        >
          <button
            onClick={handleToggleCollapse}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {isCollapsed ? (
          /* Collapsed Mini View */
          <div className="space-y-3">
            {/* Mini Exchange Rate */}
            <div className="bg-slate-700/60 rounded-lg p-2 border border-slate-600/70 text-center">
              <div className="text-xs text-slate-400 mb-1">1 Div</div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <img
                  src={CURRENCY_IMAGES.divine}
                  alt="Divine Orb"
                  className="w-3 h-3"
                />
                <span className="text-xs text-slate-400">→</span>
                <img
                  src={CURRENCY_IMAGES.chaos}
                  alt="Chaos Orb"
                  className="w-3 h-3"
                />
              </div>
              <div className="text-sm font-bold text-yellow-400 mb-2">
                {divineToChaoRate.toFixed(0)}
              </div>
              {/* Mini API Status */}
              <button
                onClick={onToggleApiCalls}
                className={`w-full h-5 rounded text-xs font-medium transition-colors ${
                  enableApiCalls
                    ? "bg-green-600/30 text-green-300 hover:bg-green-600/40"
                    : "bg-red-600/30 text-red-300 hover:bg-red-600/40"
                }`}
                title={
                  enableApiCalls
                    ? "API ON - Click để tắt"
                    : "API OFF - Click để bật"
                }
              >
                {enableApiCalls ? "API" : "OFF"}
              </button>
            </div>

            {/* Mini Total Profit */}
            <div className="bg-slate-700/60 rounded-lg p-2 border border-slate-600/70 text-center">
              <div className="text-xs text-slate-400 mb-1">Profit</div>
              <div
                className={`text-sm font-bold flex items-center justify-center space-x-1 cursor-pointer ${
                  (profitMode === "active" ? currentTotalProfit : currentCompletedProfit) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
                onClick={onToggleTotalProfitCurrency}
                title="Click để chuyển đổi đơn vị"
              >
                <span className="text-center">
                  {(profitMode === "active" ? currentTotalProfit : currentCompletedProfit).toFixed(
                    totalProfitCurrency === "chaos" ? 0 : 2
                  )}
                </span>
                <img
                  src={CURRENCY_IMAGES[totalProfitCurrency]}
                  alt={`${totalProfitCurrency} Orb`}
                  className="w-3 h-3"
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {profitMode === "active" ? "Đang giao dịch" : "Đã bán"}
              </div>
            </div>
          </div>
        ) : (
          /* Full Expanded View */
          <div className="space-y-6">
            {/* Exchange Rate Card */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                  <img
                    src={CURRENCY_IMAGES.divine}
                    alt="Divine Orb"
                    className="w-4 h-4"
                  />
                  <span>Divine → Chaos</span>
                  <img
                    src={CURRENCY_IMAGES.chaos}
                    alt="Chaos Orb"
                    className="w-4 h-4"
                  />
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onToggleApiCalls}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      enableApiCalls
                        ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                        : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    }`}
                    title={enableApiCalls ? "Tắt API calls" : "Bật API calls"}
                  >
                    API {enableApiCalls ? "ON" : "OFF"}
                  </button>
                  {enableApiCalls && (
                    <button
                      onClick={onUpdateExchangeRate}
                      disabled={isLoadingApiRate}
                      className="text-slate-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                      title="Cập nhật tỷ giá từ POE.ninja"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isLoadingApiRate ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* League Selection - Only show when API is ON */}
              {enableApiCalls && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-slate-400 mb-2 block">
                    League for API
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="bg-slate-800/50 rounded border border-slate-600 hover:border-slate-500 transition-colors flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={leagueInput}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onFocus={() => setShowLeagueDropdown(true)}
                        placeholder="Nhập tên league..."
                        className="flex-1 bg-transparent text-slate-300 text-sm px-3 py-2 focus:outline-none"
                      />
                      <button
                        onClick={toggleDropdown}
                        className="px-2 py-2 text-slate-400 hover:text-slate-300 transition-colors"
                        type="button"
                      >
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            showLeagueDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {showLeagueDropdown && filteredLeagues.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 rounded border border-slate-600 shadow-xl z-30 max-h-32 overflow-y-auto">
                        {filteredLeagues.map((league) => (
                          <button
                            key={league}
                            onClick={() => handleLeagueSelect(league)}
                            className={`w-full text-left px-3 py-1.5 hover:bg-slate-700 transition-colors text-sm ${
                              selectedLeague === league
                                ? "bg-slate-700 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          >
                            <span className="font-medium">{league}</span>
                            {(POE_LEAGUES as readonly string[]).includes(
                              league
                            ) && (
                              <span className="text-xs text-slate-500 ml-2">
                                (Official)
                              </span>
                            )}
                          </button>
                        ))}

                        {leagueInput.trim() &&
                          !POE_LEAGUES.some(
                            (league) =>
                              league.toLowerCase() === leagueInput.toLowerCase()
                          ) && (
                            <button
                              onClick={() =>
                                handleLeagueSelect(leagueInput.trim())
                              }
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-700 transition-colors text-green-400 border-t border-slate-600 text-sm"
                            >
                              <span className="font-medium">
                                + Thêm "{leagueInput.trim()}"
                              </span>
                              <span className="text-xs text-slate-500 ml-2">
                                (Custom)
                              </span>
                            </button>
                          )}
                      </div>
                    )}

                    {showLeagueDropdown &&
                      filteredLeagues.length === 0 &&
                      leagueInput.trim() && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 rounded border border-slate-600 shadow-xl z-30">
                          <button
                            onClick={() =>
                              handleLeagueSelect(leagueInput.trim())
                            }
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-700 transition-colors text-green-400 text-sm"
                          >
                            <span className="font-medium">
                              + Thêm "{leagueInput.trim()}"
                            </span>
                            <span className="text-xs text-slate-500 ml-2">
                              (Custom league)
                            </span>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Manual Rate Input (Large) */}
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="number"
                  value={divineToChaoRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      onManualRateChange(value);
                    }
                  }}
                  onBlur={() =>
                    showInfoToast("Tỷ giá thủ công đã được cập nhật")
                  }
                  className="w-20 bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                  step="0.01"
                  min="0"
                />
                <img
                  src={CURRENCY_IMAGES.chaos}
                  alt="Chaos Orb"
                  className="w-4 h-4"
                />
                <span className="text-xs text-slate-400">(Thủ công)</span>
              </div>

              {/* API Rate Display (Small) - Only show when API is ON */}
              {enableApiCalls && apiRate && (
                <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
                  <div className="flex items-center justify-between">
                    <span>POE.NINJA: {apiRate.toFixed(2)}</span>
                    <img
                      src={CURRENCY_IMAGES.chaos}
                      alt="Chaos Orb"
                      className="w-3 h-3"
                    />
                  </div>
                  {apiLastUpdated && (
                    <div className="text-xs text-slate-600 mt-1">
                      API: {formatTime(apiLastUpdated)}
                    </div>
                  )}
                </div>
              )}

              {enableApiCalls && isLoadingApiRate && (
                <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
                  <span>Đang tải tỷ giá từ API...</span>
                </div>
              )}

              {enableApiCalls && !apiRate && !isLoadingApiRate && (
                <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
                  <span>API không khả dụng - Sử dụng tỷ giá thủ công</span>
                </div>
              )}

              {!enableApiCalls && (
                <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
                  <span>Chế độ offline - Chỉ sử dụng tỷ giá thủ công</span>
                </div>
              )}
            </div>

            {/* Total Profit Card */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-slate-300">
                  Tổng lợi nhuận
                </div>
                <button
                  onClick={onToggleTotalProfitCurrency}
                  className="text-slate-400 hover:text-yellow-400 transition-colors"
                  title="Chuyển đổi đơn vị"
                >
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>

              {/* Profit Mode Toggle */}
              <div className="mb-3">
                <div className="flex bg-slate-800/50 rounded border border-slate-600 p-1">
                  <button
                    onClick={() => onProfitModeChange("active")}
                    className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                      profitMode === "active"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Đang giao dịch
                  </button>
                  <button
                    onClick={() => onProfitModeChange("completed")}
                    className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                      profitMode === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Đã bán
                  </button>
                </div>
              </div>

              {/* Profit Filter */}
              <div className="mb-3">
                <select
                  value={profitFilter}
                  onChange={(e) => onProfitFilterChange(e.target.value)}
                  className="w-full bg-slate-800/50 text-slate-300 text-xs rounded px-2 py-1 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                >
                  <option value="all">Tất cả giao dịch</option>
                  <option value="selected">Giao dịch được chọn</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      Nhóm: {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`text-xl font-bold flex items-center space-x-2 mb-2 ${
                  (profitMode === "active" ? currentTotalProfit : currentCompletedProfit) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                <span>
                  {(profitMode === "active" ? currentTotalProfit : currentCompletedProfit).toFixed(
                    totalProfitCurrency === "chaos" ? 2 : 3
                  )}
                </span>
                <img
                  src={CURRENCY_IMAGES[totalProfitCurrency]}
                  alt={`${totalProfitCurrency} Orb`}
                  className="w-5 h-5"
                />
              </div>
              <div className="text-sm text-slate-400 flex items-center space-x-1">
                <span>
                  ≈{" "}
                  {totalProfitCurrency === "chaos"
                    ? chaosToDiv(profitMode === "active" ? currentTotalProfit : currentCompletedProfit).toFixed(
                        3
                      )
                    : divToChaos(profitMode === "active" ? currentTotalProfit : currentCompletedProfit).toFixed(
                        2
                      )}
                </span>
                <img
                  src={
                    CURRENCY_IMAGES[
                      totalProfitCurrency === "chaos" ? "divine" : "chaos"
                    ]
                  }
                  alt={`${
                    totalProfitCurrency === "chaos" ? "divine" : "chaos"
                  } Orb`}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
