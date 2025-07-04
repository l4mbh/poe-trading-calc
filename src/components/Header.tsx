import React, { useState, useEffect, useRef } from 'react';
import { Coins, RefreshCw, ArrowUpDown, ChevronDown } from 'lucide-react';
import { CURRENCY_IMAGES, POE_LEAGUES } from '../utils/constants';
import { formatTime } from '../utils/currencyUtils';
import { showInfoToast } from '../utils/toastUtils';

interface HeaderProps {
  divineToChaoRate: number;
  totalProfitCurrency: 'chaos' | 'divine';
  getTotalProfit: () => number;
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
}

export function Header({
  divineToChaoRate,
  totalProfitCurrency,
  getTotalProfit,
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
  onToggleApiCalls
}: HeaderProps) {
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLeagueDropdown(false);
        // Apply the input value when clicking outside
        if (leagueInput.trim() && leagueInput !== selectedLeague) {
          onLeagueChange(leagueInput.trim());
        }
      }
    };

    if (showLeagueDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLeagueDropdown, leagueInput, selectedLeague, onLeagueChange]);

  // Filter leagues based on input
  const filteredLeagues = POE_LEAGUES.filter(league =>
    league.toLowerCase().includes(leagueInput.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeagueInput(e.target.value);
    setShowLeagueDropdown(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (leagueInput.trim()) {
        onLeagueChange(leagueInput.trim());
        setShowLeagueDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowLeagueDropdown(false);
      setLeagueInput(selectedLeague);
    } else if (e.key === 'ArrowDown' && filteredLeagues.length > 0) {
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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-white">POE Trading Calculator</h1>
          </div>
          
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            {/* API Control & Exchange Rate Card */}
            <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                  <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-4 h-4" />
                  <span>Divine → Chaos</span>
                  <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onToggleApiCalls}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      enableApiCalls 
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                        : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                    }`}
                    title={enableApiCalls ? 'Tắt API calls' : 'Bật API calls'}
                  >
                    API {enableApiCalls ? 'ON' : 'OFF'}
                  </button>
                  {enableApiCalls && (
                    <button
                      onClick={onUpdateExchangeRate}
                      disabled={isLoadingApiRate}
                      className="text-slate-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                      title="Cập nhật tỷ giá từ POE.ninja"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingApiRate ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* League Selection - Only show when API is ON */}
              {enableApiCalls && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-slate-400 mb-2 block">League for API</label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="bg-slate-800/50 rounded border border-slate-600 hover:border-slate-500 transition-colors flex items-center min-w-[140px]">
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
                        <ChevronDown className={`w-3 h-3 transition-transform ${showLeagueDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {showLeagueDropdown && filteredLeagues.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 rounded border border-slate-600 shadow-xl z-20 max-h-32 overflow-y-auto">
                        {filteredLeagues.map((league) => (
                          <button
                            key={league}
                            onClick={() => handleLeagueSelect(league)}
                            className={`w-full text-left px-3 py-1.5 hover:bg-slate-700 transition-colors text-sm ${
                              selectedLeague === league ? 'bg-slate-700 text-yellow-400' : 'text-slate-300'
                            }`}
                          >
                            <span className="font-medium">{league}</span>
                            {(POE_LEAGUES as readonly string[]).includes(league) && (
                              <span className="text-xs text-slate-500 ml-2">(Official)</span>
                            )}
                          </button>
                        ))}
                        
                        {leagueInput.trim() && !POE_LEAGUES.some(league => 
                          league.toLowerCase() === leagueInput.toLowerCase()
                        ) && (
                          <button
                            onClick={() => handleLeagueSelect(leagueInput.trim())}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-700 transition-colors text-green-400 border-t border-slate-600 text-sm"
                          >
                            <span className="font-medium">+ Thêm "{leagueInput.trim()}"</span>
                            <span className="text-xs text-slate-500 ml-2">(Custom)</span>
                          </button>
                        )}
                      </div>
                    )}
                    
                    {showLeagueDropdown && filteredLeagues.length === 0 && leagueInput.trim() && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 rounded border border-slate-600 shadow-xl z-20">
                        <button
                          onClick={() => handleLeagueSelect(leagueInput.trim())}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-700 transition-colors text-green-400 text-sm"
                        >
                          <span className="font-medium">+ Thêm "{leagueInput.trim()}"</span>
                          <span className="text-xs text-slate-500 ml-2">(Custom league)</span>
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
                  onBlur={() => showInfoToast('Tỷ giá thủ công đã được cập nhật')}
                  className="w-20 bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                  step="0.01"
                  min="0"
                />
                <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                <span className="text-xs text-slate-400">(Thủ công)</span>
              </div>
              
              {/* API Rate Display (Small) - Only show when API is ON */}
              {enableApiCalls && apiRate && (
                <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
                  <div className="flex items-center justify-between">
                    <span>POE.NINJA: {apiRate.toFixed(2)}</span>
                    <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-3 h-3" />
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

            {/* Total Profit */}
            <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-slate-300">Tổng lợi nhuận</div>
                <button
                  onClick={onToggleTotalProfitCurrency}
                  className="text-slate-400 hover:text-yellow-400 transition-colors"
                  title="Chuyển đổi đơn vị"
                >
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
              <div className={`text-lg font-bold flex items-center space-x-1 ${getTotalProfit() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span>{getTotalProfit().toFixed(totalProfitCurrency === 'chaos' ? 2 : 3)}</span>
                <img src={CURRENCY_IMAGES[totalProfitCurrency]} alt={`${totalProfitCurrency} Orb`} className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-400 flex items-center space-x-1">
                <span>≈ {totalProfitCurrency === 'chaos' ? chaosToDiv(getTotalProfit()).toFixed(3) : divToChaos(getTotalProfit()).toFixed(2)}</span>
                <img src={CURRENCY_IMAGES[totalProfitCurrency === 'chaos' ? 'divine' : 'chaos']} alt={`${totalProfitCurrency === 'chaos' ? 'divine' : 'chaos'} Orb`} className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 