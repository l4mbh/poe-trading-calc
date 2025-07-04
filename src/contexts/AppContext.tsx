import React, { createContext, useContext, useState, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS, CURRENCY_IMAGES } from "../utils/constants";
import { fetchDivineToChaoRate, formatLeagueName } from "../utils/apiService";
import { convertPrice, getPriceInChaos } from "../utils/currencyUtils";

interface AppContextType {
  showExchangeRate: boolean;
  showTotalProfit: boolean;
  onToggleExchangeRate: () => void;
  onToggleTotalProfit: () => void;
  divineToChaoRate: number;
  setDivineToChaoRate: (rate: number) => void;
  totalProfitCurrency: "chaos" | "divine";
  setTotalProfitCurrency: (currency: "chaos" | "divine") => void;
  getTotalProfitByFilter: ((filter: "all" | "selected" | string) => number) | null;
  getCompletedProfitByFilter: ((filter: "all" | "selected" | string) => number) | null;
  setGetTotalProfitByFilter: (fn: () => (filter: "all" | "selected" | string) => number) => void;
  setGetCompletedProfitByFilter: (fn: () => (filter: "all" | "selected" | string) => number) => void;
  profitMode: "active" | "completed";
  setProfitMode: (mode: "active" | "completed") => void;
  chaosToDiv: ((chaosAmount: number) => number) | null;
  divToChaos: ((divAmount: number) => number) | null;
  setChaosToDiv: (fn: () => (chaosAmount: number) => number) => void;
  setDivToChaos: (fn: () => (divAmount: number) => number) => void;
  convertPrice: (price: number, fromCurrency: "chaos" | "divine", toCurrency: "chaos" | "divine") => number;
  getPriceInChaos: (price: number, currency: "chaos" | "divine") => number;
  CURRENCY_IMAGES: typeof CURRENCY_IMAGES;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  profitFilter: "all" | "selected" | string;
  setProfitFilter: (filter: "all" | "selected" | string) => void;
  groups: Array<{ id: string; name: string; color: string }>;
  setGroups: (groups: Array<{ id: string; name: string; color: string }>) => void;
  selectedLeague: string;
  setSelectedLeague: (league: string) => void;
  apiRate: number | null;
  setApiRate: (rate: number | null) => void;
  apiLastUpdated: Date | null;
  setApiLastUpdated: (date: Date | null) => void;
  isLoadingApiRate: boolean;
  setIsLoadingApiRate: (loading: boolean) => void;
  enableApiCalls: boolean;
  setEnableApiCalls: (enable: boolean) => void;
  loadApiRate: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [showExchangeRate, setShowExchangeRate] = useLocalStorage<boolean>(
    STORAGE_KEYS.SHOW_EXCHANGE_RATE,
    false
  );
  const [showTotalProfit, setShowTotalProfit] = useLocalStorage<boolean>(
    STORAGE_KEYS.SHOW_TOTAL_PROFIT,
    false
  );
  const [divineToChaoRate, setDivineToChaoRate] = useLocalStorage<number>(
    STORAGE_KEYS.EXCHANGE_RATE,
    180
  );
  const [totalProfitCurrency, setTotalProfitCurrency] = useLocalStorage<
    "chaos" | "divine"
  >(STORAGE_KEYS.TOTAL_PROFIT_CURRENCY, "chaos");
  const [profitMode, setProfitMode] = useLocalStorage<"active" | "completed">(
    STORAGE_KEYS.PROFIT_MODE,
    "active"
  );
  const [showSidebar, setShowSidebar] = useLocalStorage<boolean>(
    STORAGE_KEYS.SHOW_SIDEBAR,
    true
  );
  const [profitFilter, setProfitFilter] = useLocalStorage<
    "all" | "selected" | string
  >(STORAGE_KEYS.PROFIT_FILTER, "all");
  const [groups, setGroups] = useLocalStorage<Array<{ id: string; name: string; color: string }>>(
    STORAGE_KEYS.GROUPS,
    []
  );
  const [selectedLeague, setSelectedLeague] = useLocalStorage<string>(
    STORAGE_KEYS.SELECTED_LEAGUE,
    "Mercenaries"
  );
  const [apiRate, setApiRate] = useLocalStorage<number | null>(
    STORAGE_KEYS.API_RATE,
    null
  );
  const [apiLastUpdated, setApiLastUpdated] = useLocalStorage<Date | null>(
    STORAGE_KEYS.API_LAST_UPDATED,
    null
  );
  const [isLoadingApiRate, setIsLoadingApiRate] = useState<boolean>(false);
  const [enableApiCalls, setEnableApiCalls] = useLocalStorage<boolean>(
    STORAGE_KEYS.ENABLE_API_CALLS,
    true
  );

  // Function states
  const [getTotalProfitByFilter, setGetTotalProfitByFilter] = useState<((filter: "all" | "selected" | string) => number) | null>(null);
  const [getCompletedProfitByFilter, setGetCompletedProfitByFilter] = useState<((filter: "all" | "selected" | string) => number) | null>(null);
  const [chaosToDiv, setChaosToDiv] = useState<((chaosAmount: number) => number) | null>(null);
  const [divToChaos, setDivToChaos] = useState<((divAmount: number) => number) | null>(null);

  const handleToggleExchangeRate = () => {
    setShowExchangeRate(!showExchangeRate);
  };

  const handleToggleTotalProfit = () => {
    setShowTotalProfit(!showTotalProfit);
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const loadApiRate = async () => {
    if (!enableApiCalls) return;
    setIsLoadingApiRate(true);
    try {
      const formattedLeague = formatLeagueName(selectedLeague);
      const rate = await fetchDivineToChaoRate(formattedLeague);
      setApiRate(rate);
      setApiLastUpdated(new Date());
      // Luôn cập nhật tỷ giá mặc định từ API
      setDivineToChaoRate(rate);
    } catch (e) {
      // Có thể show toast ở đây nếu muốn
    } finally {
      setIsLoadingApiRate(false);
    }
  };

  const value: AppContextType = {
    showExchangeRate,
    showTotalProfit,
    onToggleExchangeRate: handleToggleExchangeRate,
    onToggleTotalProfit: handleToggleTotalProfit,
    divineToChaoRate,
    setDivineToChaoRate,
    totalProfitCurrency,
    setTotalProfitCurrency,
    getTotalProfitByFilter,
    getCompletedProfitByFilter,
    setGetTotalProfitByFilter,
    setGetCompletedProfitByFilter,
    profitMode,
    setProfitMode,
    chaosToDiv,
    divToChaos,
    setChaosToDiv,
    setDivToChaos,
    convertPrice,
    getPriceInChaos,
    CURRENCY_IMAGES,
    showSidebar,
    onToggleSidebar: handleToggleSidebar,
    profitFilter,
    setProfitFilter,
    groups,
    setGroups,
    selectedLeague,
    setSelectedLeague,
    apiRate,
    setApiRate,
    apiLastUpdated,
    setApiLastUpdated,
    isLoadingApiRate,
    setIsLoadingApiRate,
    enableApiCalls,
    setEnableApiCalls,
    loadApiRate,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 