import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { Coins, Search, X, RefreshCw, Edit3, User, LogOut, Settings, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast } from "../utils/toastUtils";
import AnnouncementBar from './AnnouncementBar';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (v: string) => void;
  showExchangeRate?: boolean;
  showTotalProfit?: boolean;
  onToggleExchangeRate?: () => void;
  onToggleTotalProfit?: () => void;
  divineToChaoRate?: number;
  totalProfitCurrency?: "chaos" | "divine";
  getTotalProfitByFilter?: (filter: "all" | "selected" | string) => number;
  getCompletedProfitByFilter?: (filter: "all" | "selected" | string) => number;
  profitMode?: "active" | "completed";
  chaosToDiv?: (chaosAmount: number) => number;
  divToChaos?: (divAmount: number) => number;
  CURRENCY_IMAGES?: any;
  onManualRateChange?: (rate: number) => void;
  onProfitModeChange?: (mode: "active" | "completed") => void;
  onProfitFilterChange?: (filter: "all" | "selected" | string) => void;
  profitFilter?: "all" | "selected" | string;
  groups?: Array<{ id: string; name: string; color: string }>;
  selectedLeague?: string;
  onLeagueChange?: (league: string) => void;
  onReloadExchangeRate?: () => void;
  apiRate?: number | null;
  isLoadingApiRate?: boolean;
  apiLastUpdated?: Date | null;
  enableApiCalls?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  searchTerm, 
  onSearchChange,
  showExchangeRate = false,
  showTotalProfit = false,
  onToggleExchangeRate,
  onToggleTotalProfit,
  divineToChaoRate = 180,
  totalProfitCurrency = "chaos",
  getTotalProfitByFilter,
  getCompletedProfitByFilter,
  profitMode = "active",
  chaosToDiv,
  divToChaos,
  CURRENCY_IMAGES,
  onManualRateChange,
  onProfitModeChange,
  onProfitFilterChange,
  profitFilter = "all",
  groups = [],
  selectedLeague = '',
  onLeagueChange,
  onReloadExchangeRate,
  apiRate,
  isLoadingApiRate,
  apiLastUpdated,
  enableApiCalls
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExchangeRateOpen, setIsExchangeRateOpen] = useState(false);
  const [isTotalProfitOpen, setIsTotalProfitOpen] = useState(false);
  const [leagueInput, setLeagueInput] = useState(selectedLeague);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, logout } = useAuth();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen && onSearchChange) {
      onSearchChange(""); // Clear search when closing
    }
  };

  const toggleExchangeRate = () => {
    setIsExchangeRateOpen(!isExchangeRateOpen);
    setLeagueInput(selectedLeague);
  };

  const toggleTotalProfit = () => {
    setIsTotalProfitOpen(!isTotalProfitOpen);
  };

  const handleLeagueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeagueInput(e.target.value);
  };

  const handleLeagueBlur = () => {
    if (onLeagueChange && leagueInput.trim()) {
      onLeagueChange(leagueInput.trim());
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Đăng xuất thành công!');
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-30">
        <AnnouncementBar
          message={
            <>
              Đã có tính năng đăng nhập, xác thực tài khoản! Mời bạn thử nghiệm và xem danh sách thành viên ở <Link to="/members" className="underline hover:text-yellow-400">trang vui vẻ</Link> 🎉
            </>
          }
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-bold text-white">
                POE Trading Calculator
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-5">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition-colors text-sm font-medium ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-200 hover:text-yellow-400"
                  }`
                }
                end
              >
                Trang chủ
              </NavLink>
              <NavLink
                to="/shares"
                className={({ isActive }) =>
                  `transition-colors text-sm font-medium ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-300 hover:text-yellow-400"
                  }`
                }
              >
                <div className="flex items-center space-x-1">
                  <span>Chia sẻ</span>
                  {!currentUser && (
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Cần đăng nhập"></div>
                  )}
                </div>
              </NavLink>
              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  `transition-colors text-sm font-medium ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-300 hover:text-yellow-400"
                  }`
                }
              >
                Thống kê
              </NavLink>
            </nav>
          </div>

          {/* Right Section - Tools & User */}
          <div className="flex items-center space-x-3">
            {/* Exchange Rate Mini Display */}
            {showExchangeRate && (
              <div className="flex items-center">
                <button
                  onClick={toggleExchangeRate}
                  className="flex items-center space-x-1.5 text-slate-300 hover:text-yellow-400 transition-colors px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50"
                  title="Click để xem/chỉnh tỷ giá và league"
                >
                  <span className="text-xs font-medium">1</span>
                  {CURRENCY_IMAGES && (
                    <img
                      src={CURRENCY_IMAGES.divine}
                      alt="Divine Orb"
                      className="w-3.5 h-3.5"
                    />
                  )}
                  <span className="text-xs">=</span>
                  <span className="text-xs font-bold text-yellow-400">
                    {divineToChaoRate.toFixed(0)}
                  </span>
                  {CURRENCY_IMAGES && (
                    <img
                      src={CURRENCY_IMAGES.chaos}
                      alt="Chaos Orb"
                      className="w-3.5 h-3.5"
                    />
                  )}
                  <Edit3 className="w-3.5 h-3.5 ml-1 text-slate-400 hover:text-yellow-400" />
                </button>
                <button
                  onClick={onReloadExchangeRate}
                  className="ml-1.5 p-1.5 rounded-full hover:bg-slate-700/50 text-yellow-400 transition-colors"
                  title="Lấy tỷ giá mới từ API"
                  disabled={isLoadingApiRate}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApiRate ? "animate-spin" : ""}`} />
                </button>
              </div>
            )}

            {/* Total Profit Mini Display */}
            {showTotalProfit && getTotalProfitByFilter && (
              <button
                onClick={toggleTotalProfit}
                className={`flex items-center space-x-1.5 transition-colors px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 ${
                  (profitMode === "active" ? getTotalProfitByFilter("all") : getCompletedProfitByFilter?.("all") || 0) >= 0
                    ? "text-green-400 hover:text-green-300"
                    : "text-red-400 hover:text-red-300"
                }`}
                title="Click để xem chi tiết lợi nhuận"
              >
                <span className="text-xs font-medium">Profit:</span>
                <span className="text-xs font-bold">
                  {(profitMode === "active" ? getTotalProfitByFilter("all") : getCompletedProfitByFilter?.("all") || 0).toFixed(
                    totalProfitCurrency === "chaos" ? 0 : 2
                  )}
                </span>
                {CURRENCY_IMAGES && (
                  <img
                    src={CURRENCY_IMAGES[totalProfitCurrency]}
                    alt={`${totalProfitCurrency} Orb`}
                    className="w-3.5 h-3.5"
                  />
                )}
              </button>
            )}

            {/* Search Button */}
            {onSearchChange && (
              <button
                onClick={toggleSearch}
                className="text-slate-400 hover:text-yellow-400 transition-colors p-1.5 hover:bg-slate-800/50 rounded-lg"
                title="Tìm kiếm giao dịch"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Authentication Section */}
            {currentUser ? (
              // User Menu - When logged in
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-slate-300 hover:text-yellow-400 transition-colors px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50"
                  title="Menu người dùng"
                >
                  {/* Small Avatar Display Only */}
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
                        <div className="font-medium text-white">
                          {currentUser.displayName || 'Người dùng'}
                        </div>
                        <div className="text-xs">{currentUser.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-yellow-400 hover:bg-slate-700/50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Hồ sơ</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Login Button - When not logged in (minimized)
              <Link
                to="/login"
                className="flex items-center space-x-1 text-slate-300 hover:text-yellow-400 transition-colors px-2 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50"
                title="Đăng nhập"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar - Sticky with header */}
        {onSearchChange && (
          <div
            className={`bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 transition-all duration-300 ease-in-out ${
              isSearchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm giao dịch..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 pl-10 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                    autoFocus={isSearchOpen}
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                  onClick={toggleSearch}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                  title="Đóng tìm kiếm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Rate Panel - Sticky with header */}
        {showExchangeRate && (
          <div className={`bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 transition-all duration-300 ease-in-out ${isExchangeRateOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Rate Input */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs text-slate-400 mb-1">Tỷ giá thủ công</label>
                  <input
                    type="number"
                    value={divineToChaoRate}
                    onChange={e => onManualRateChange && onManualRateChange(Number(e.target.value))}
                    className="w-32 bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                    step="0.01"
                    min="0"
                  />
                </div>
                {/* League Selection */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs text-slate-400 mb-1">League</label>
                  <input
                    type="text"
                    value={leagueInput}
                    onChange={handleLeagueChange}
                    onBlur={handleLeagueBlur}
                    className="w-48 bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Nhập tên league..."
                  />
                </div>
              </div>
              {/* API Info & Reload */}
              <div className="flex items-center space-x-4 mt-6">
                <span className="text-xs text-slate-400">Tỷ giá API hiện tại:</span>
                <span className="text-sm font-bold text-yellow-400">{apiRate ? apiRate.toFixed(2) : "N/A"}</span>
                <button
                  onClick={onReloadExchangeRate}
                  className="p-2 rounded-full hover:bg-slate-700/50 text-yellow-400 transition-colors"
                  title="Lấy tỷ giá mới từ API"
                  disabled={isLoadingApiRate}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingApiRate ? "animate-spin" : ""}`} />
                </button>
                {apiLastUpdated && (
                  <span className="text-xs text-slate-500 ml-2">Cập nhật: {new Date(apiLastUpdated).toLocaleTimeString()}</span>
                )}
                {!enableApiCalls && (
                  <span className="text-xs text-red-400 ml-2">API OFF</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Total Profit Panel - Sticky with header */}
        {showTotalProfit && getTotalProfitByFilter && (
          <div
            className={`bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 transition-all duration-300 ease-in-out ${
              isTotalProfitOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active Transactions Profit */}
                <div className="flex items-center justify-center space-x-3 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <span className="text-sm text-slate-300">Đang giao dịch:</span>
                  <div className={`flex items-center space-x-1 ${
                    getTotalProfitByFilter("all") >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    <span className="text-lg font-bold">
                      {getTotalProfitByFilter("all").toFixed(
                        totalProfitCurrency === "chaos" ? 0 : 2
                      )}
                    </span>
                    {CURRENCY_IMAGES && (
                      <img
                        src={CURRENCY_IMAGES[totalProfitCurrency]}
                        alt={`${totalProfitCurrency} Orb`}
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                </div>

                {/* Completed Transactions Profit */}
                <div className="flex items-center justify-center space-x-3 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <span className="text-sm text-slate-300">Đã bán:</span>
                  <div className={`flex items-center space-x-1 ${
                    (getCompletedProfitByFilter?.("all") || 0) >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    <span className="text-lg font-bold">
                      {(getCompletedProfitByFilter?.("all") || 0).toFixed(
                        totalProfitCurrency === "chaos" ? 0 : 2
                      )}
                    </span>
                    {CURRENCY_IMAGES && (
                      <img
                        src={CURRENCY_IMAGES[totalProfitCurrency]}
                        alt={`${totalProfitCurrency} Orb`}
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                </div>

                {/* Total Combined Profit */}
                <div className="flex items-center justify-center space-x-3 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <span className="text-sm text-slate-300">Tổng cộng:</span>
                  <div className={`flex items-center space-x-1 ${
                    ((getTotalProfitByFilter("all") + (getCompletedProfitByFilter?.("all") || 0)) >= 0) ? "text-green-400" : "text-red-400"
                  }`}>
                    <span className="text-lg font-bold">
                      {(getTotalProfitByFilter("all") + (getCompletedProfitByFilter?.("all") || 0)).toFixed(
                        totalProfitCurrency === "chaos" ? 0 : 2
                      )}
                    </span>
                    {CURRENCY_IMAGES && (
                      <img
                        src={CURRENCY_IMAGES[totalProfitCurrency]}
                        alt={`${totalProfitCurrency} Orb`}
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export { Header };
