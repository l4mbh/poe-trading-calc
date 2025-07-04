import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Transaction,
  TransactionGroup,
  CompletedTransaction,
  ExportData,
  LegacyTransaction,
} from "../types";
import { STORAGE_KEYS, GROUP_COLORS, POE_LEAGUES } from "../utils/constants";
import {
  chaosToDiv,
  divToChaos,
  convertPrice,
  getPriceInChaos,
} from "../utils/currencyUtils";
import { fetchDivineToChaoRate, formatLeagueName } from "../utils/apiService";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  TOAST_MESSAGES,
} from "../utils/toastUtils";
import { StickyLeftSidebar } from "../components/StickyLeftSidebar";
import { DataModal } from "../components/DataModal";
import { ToastProvider } from "../components/ToastProvider";
import GroupList from "../components/home/GroupList";
import UngroupedTransactionList from "../components/home/UngroupedTransactionList";
import TransactionTableView from "../components/home/TransactionTableView";
import MainActions from "../components/home/MainActions";
import GroupForm from "../components/home/GroupForm";
import EmptyState from "../components/home/EmptyState";
import NoSearchResult from "../components/home/NoSearchResult";

export default function HomePage() {
  const { searchTerm, setSearchTerm } = useOutletContext<{ searchTerm: string; setSearchTerm: (v: string) => void }>();
  const [divineToChaoRate, setDivineToChaoRate] = useLocalStorage<number>(
    STORAGE_KEYS.EXCHANGE_RATE,
    180
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    STORAGE_KEYS.TRANSACTIONS,
    []
  );
  const [groups, setGroups] = useLocalStorage<TransactionGroup[]>(
    STORAGE_KEYS.GROUPS,
    []
  );
  const [completedTransactions, setCompletedTransactions] = useLocalStorage<CompletedTransaction[]>(
    STORAGE_KEYS.COMPLETED_TRANSACTIONS,
    []
  );
  const [showGroupForm, setShowGroupForm] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>("");
  const [totalProfitCurrency, setTotalProfitCurrency] = useLocalStorage<
    "chaos" | "divine"
  >(STORAGE_KEYS.TOTAL_PROFIT_CURRENCY, "chaos");
  const [profitFilter, setProfitFilter] = useLocalStorage<
    "all" | "selected" | string
  >(STORAGE_KEYS.PROFIT_FILTER, "all");

  // New states for API integration
  const [selectedLeague, setSelectedLeague] = useLocalStorage<string>(
    STORAGE_KEYS.SELECTED_LEAGUE,
    POE_LEAGUES[0]
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

  // Export/Import modal states
  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"export" | "import">("export");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [importError, setImportError] = useState<string>("");



  // Action buttons collapsed state
  const [isActionsCollapsed, setIsActionsCollapsed] = useState<boolean>(true);

  // Transaction view type: 'card' | 'row' | 'other'
  const [transactionViewType, setTransactionViewType] = useState<
    "card" | "row" | "other"
  >("card");

  // Row view: expanded row id
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Migrate old data on component mount
  useEffect(() => {
    try {
      // Migrate old transactions to include currency fields
      const migratedTransactions = transactions.map((t: LegacyTransaction) => ({
        ...t,
        buyPriceCurrency: t.buyPriceCurrency || "chaos",
        sellPriceCurrency: t.sellPriceCurrency || "chaos",
      }));

      if (
        JSON.stringify(migratedTransactions) !== JSON.stringify(transactions)
      ) {
        setTransactions(migratedTransactions);
      }
    } catch (error) {
      console.error("Error migrating data:", error);
    }
  }, [transactions]);

  // Load API rate on component mount and when league changes
  useEffect(() => {
    if (enableApiCalls) {
      loadApiRate();
    }
  }, [selectedLeague, enableApiCalls]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApiRate = async () => {
    if (!enableApiCalls) {
      showInfoToast("API calls đã bị tắt. Sử dụng tỷ giá thủ công.");
      return;
    }

    setIsLoadingApiRate(true);
    try {
      const formattedLeague = formatLeagueName(selectedLeague);
      const rate = await fetchDivineToChaoRate(formattedLeague);
      setApiRate(rate);
      setApiLastUpdated(new Date());

      // If user doesn't have a manual rate set or it's default value, use API rate
      if (!divineToChaoRate || divineToChaoRate === 180) {
        setDivineToChaoRate(rate);
        showSuccessToast(
          `Đã cập nhật tỷ giá từ ${formattedLeague}: ${rate.toFixed(2)} Chaos`
        );
      } else {
        showInfoToast(
          `Tỷ giá API ${formattedLeague}: ${rate.toFixed(
            2
          )} Chaos (Giữ nguyên tỷ giá thủ công)`
        );
      }
    } catch (error) {
      console.error("Failed to load API rate:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";

      // Set fallback rates based on league
      const getFallbackRate = (league: string): number => {
        const lowerLeague = league.toLowerCase();

        // Known approximate rates for popular leagues
        if (lowerLeague.includes("standard")) return 200;
        if (lowerLeague.includes("hardcore")) return 185;
        if (lowerLeague.includes("mercenaries")) return 210;
        if (lowerLeague.includes("settlers")) return 195;
        if (lowerLeague.includes("crucible")) return 180;
        if (lowerLeague.includes("sanctum")) return 175;
        if (lowerLeague.includes("kalandra")) return 190;

        // Default for unknown leagues
        return 180;
      };

      // Only show detailed error if this is not a network/CORS issue
      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        showWarningToast(
          `POE.ninja API hiện không khả dụng (CORS). Sử dụng tỷ giá dự phòng.`
        );
      } else {
        showWarningToast(errorMessage);
      }

      // Fallback: nếu chưa có tỷ giá nào, dùng giá trị mặc định hợp lý dựa trên league
      if (!divineToChaoRate || divineToChaoRate === 180) {
        const fallbackRate = getFallbackRate(selectedLeague);
        setDivineToChaoRate(fallbackRate);
        showInfoToast(
          `Sử dụng tỷ giá dự phòng cho ${selectedLeague}: ${fallbackRate} Chaos`
        );
      }
    } finally {
      setIsLoadingApiRate(false);
    }
  };

  const resetTransaction = (id: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              buyQuantity: 0,
              buyPrice: 0,
              sellQuantity: 0,
              sellPrice: 0,
              buyPriceCurrency: "chaos",
              sellPriceCurrency: "chaos",
              isSelling: false,
              sellingStartedAt: undefined,
            }
          : t
      )
    );
  };

  const startSelling = (transaction: Transaction) => {
    const now = new Date();
    setTransactions(
      transactions.map((t) =>
        t.id === transaction.id
          ? {
              ...t,
              isSelling: true,
              sellingStartedAt: now.toISOString(),
            }
          : t
      )
    );
    showSuccessToast(`Đã bắt đầu treo bán "${transaction.name}"`);
  };

  const completeTransaction = (transaction: Transaction, profit: number, profitPercentage: number) => {
    const now = new Date();
    
    // Calculate selling duration if transaction was selling
    let sellingDuration: number | undefined;
    if (transaction.sellingStartedAt) {
      const startTime = new Date(transaction.sellingStartedAt);
      sellingDuration = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Convert to hours
    }

    const completedTransaction: CompletedTransaction = {
      ...transaction,
      profit,
      profitPercentage,
      completedAt: now.toISOString(),
      completedDate: now.toISOString().split('T')[0], // YYYY-MM-DD format
      sellingDuration,
    };

    // Add to completed transactions
    setCompletedTransactions([...completedTransactions, completedTransaction]);
    
    // Reset the original transaction
    resetTransaction(transaction.id);
    
    const durationText = sellingDuration ? ` (bán trong ${sellingDuration.toFixed(1)}h)` : '';
    showSuccessToast(`Đã lưu giao dịch "${transaction.name}" với lợi nhuận ${profit >= 0 ? '+' : ''}${profit.toFixed(2)} chaos${durationText}`);
  };

  const updateExchangeRate = async () => {
    await loadApiRate();
  };

  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league);
    showInfoToast(`Đã chuyển sang league: ${league}`);
  };

  const handleManualRateChange = (rate: number) => {
    setDivineToChaoRate(rate);
  };

  const handleToggleApiCalls = () => {
    setEnableApiCalls(!enableApiCalls);
    if (!enableApiCalls) {
      showInfoToast("Đã bật API calls. Sẽ tự động tải tỷ giá từ POE.ninja.");
      // Load API rate immediately when enabled
      setTimeout(() => loadApiRate(), 100);
    } else {
      showInfoToast("Đã tắt API calls. Chỉ sử dụng tỷ giá thủ công.");
    }
  };



  const addTransaction = (groupId: string | null = null) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Giao dịch ${transactions.length + 1}`,
      buyQuantity: 0,
      buyPrice: 0,
      sellQuantity: 0,
      sellPrice: 0,
      isFavorite: false,
      groupId: groupId,
      buyPriceCurrency: "chaos",
      sellPriceCurrency: "chaos",
    };
    setTransactions([...transactions, newTransaction]);
    showSuccessToast(TOAST_MESSAGES.TRANSACTION_ADDED);
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    showSuccessToast(TOAST_MESSAGES.TRANSACTION_DELETED);
  };

  const updateTransaction = (
    id: string,
    field: keyof Transaction,
    value: string | number | boolean | null
  ) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const toggleFavorite = (id: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      )
    );
  };

  const createGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: TransactionGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
        isExpanded: true,
      };
      setGroups([...groups, newGroup]);
      setNewGroupName("");
      setShowGroupForm(false);
      showSuccessToast(TOAST_MESSAGES.GROUP_CREATED);
    }
  };

  const deleteGroup = (groupId: string) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa nhóm này? Các giao dịch trong nhóm sẽ được chuyển về "Không có nhóm".'
      )
    ) {
      // Move transactions out of the group
      setTransactions(
        transactions.map((t) =>
          t.groupId === groupId ? { ...t, groupId: null } : t
        )
      );
      // Remove the group
      setGroups(groups.filter((g) => g.id !== groupId));
      showSuccessToast(TOAST_MESSAGES.GROUP_DELETED);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
      )
    );
  };

  const startEditingGroup = (group: TransactionGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const saveGroupEdit = () => {
    if (editingGroupName.trim()) {
      setGroups(
        groups.map((g) =>
          g.id === editingGroupId ? { ...g, name: editingGroupName.trim() } : g
        )
      );
      showSuccessToast(TOAST_MESSAGES.GROUP_UPDATED);
    }
    setEditingGroupId(null);
    setEditingGroupName("");
  };

  const cancelGroupEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName("");
  };

  // Currency conversion functions with divineToChaoRate parameter
  const chaosToDivFn = (chaosAmount: number) => {
    return chaosToDiv(chaosAmount, divineToChaoRate);
  };

  const divToChaosFn = (divAmount: number) => {
    return divToChaos(divAmount, divineToChaoRate);
  };

  const convertPriceFn = (
    price: number,
    fromCurrency: "chaos" | "divine",
    toCurrency: "chaos" | "divine"
  ) => {
    return convertPrice(price, fromCurrency, toCurrency, divineToChaoRate);
  };

  const getPriceInChaosFn = (price: number, currency: "chaos" | "divine") => {
    return getPriceInChaos(price, currency, divineToChaoRate);
  };

  const calculateProfit = (transaction: Transaction) => {
    const buyPriceInChaos = getPriceInChaosFn(
      transaction.buyPrice,
      transaction.buyPriceCurrency
    );
    const sellPriceInChaos = getPriceInChaosFn(
      transaction.sellPrice,
      transaction.sellPriceCurrency
    );

    const totalBuyValue = transaction.buyQuantity * buyPriceInChaos;
    const totalSellValue = transaction.sellQuantity * sellPriceInChaos;
    const profit = totalSellValue - totalBuyValue;
    const profitPercentage =
      totalBuyValue > 0 ? (profit / totalBuyValue) * 100 : 0;
    return { profit, profitPercentage };
  };

//   const getTotalProfit = () => {
//     const filteredTransactions = getFilteredTransactions();
//     const totalProfitInChaos = filteredTransactions.reduce(
//       (total, transaction) => {
//         const { profit } = calculateProfit(transaction);
//         return total + profit;
//       },
//       0
//     );

//     return totalProfitCurrency === "chaos"
//       ? totalProfitInChaos
//       : chaosToDivFn(totalProfitInChaos);
//   };

  const getTotalProfitByFilter = (filter: "all" | "selected" | string) => {
    let transactionsToCalculate: Transaction[];

    if (filter === "all") {
      transactionsToCalculate = getFilteredTransactions();
    } else if (filter === "selected") {
      transactionsToCalculate = getFilteredTransactions().filter(
        (t) => t.isSelected
      );
    } else {
      // Filter by group ID
      transactionsToCalculate = getFilteredTransactions().filter(
        (t) => t.groupId === filter
      );
    }

    const totalProfitInChaos = transactionsToCalculate.reduce(
      (total, transaction) => {
        const { profit } = calculateProfit(transaction);
        return total + profit;
      },
      0
    );

    return totalProfitCurrency === "chaos"
      ? totalProfitInChaos
      : chaosToDivFn(totalProfitInChaos);
  };

  const getFilteredTransactions = () => {
    return transactions.filter((transaction) =>
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSortedTransactions = () => {
    const filtered = getFilteredTransactions();
    return filtered.sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  };

  const getTransactionsByGroup = () => {
    const sorted = getSortedTransactions();
    const grouped: { [key: string]: Transaction[] } = {
      ungrouped: [],
    };

    groups.forEach((group) => {
      grouped[group.id] = [];
    });

    sorted.forEach((transaction) => {
      if (transaction.groupId && grouped[transaction.groupId]) {
        grouped[transaction.groupId].push(transaction);
      } else {
        grouped.ungrouped.push(transaction);
      }
    });

    return grouped;
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác."
      )
    ) {
      setTransactions([]);
      setGroups([]);
      setSearchTerm("");
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.GROUPS);
      showSuccessToast(TOAST_MESSAGES.DATA_CLEARED);
    }
  };

  // Export/Import functions
  const exportData = async () => {
    setIsExporting(true);
    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const exportData: ExportData = {
        transactions,
        groups,
        divineToChaoRate,
        exportDate: new Date().toISOString(),
        version: "1.0",
        profitFilter,
        totalProfitCurrency,
        selectedLeague,
        enableApiCalls,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `poe-trading-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccessToast(TOAST_MESSAGES.DATA_EXPORTED);
    } catch (error) {
      console.error("Export failed:", error);
      showErrorToast("Không thể xuất dữ liệu. Vui lòng thử lại!");
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (file: File) => {
    setIsImporting(true);
    setImportStatus("idle");
    setImportError("");

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const text = await file.text();
      const importedData: ExportData = JSON.parse(text);

      // Validate imported data structure
      if (
        !importedData.transactions ||
        !Array.isArray(importedData.transactions)
      ) {
        throw new Error("Dữ liệu không hợp lệ: thiếu danh sách giao dịch");
      }

      if (!importedData.groups || !Array.isArray(importedData.groups)) {
        throw new Error("Dữ liệu không hợp lệ: thiếu danh sách nhóm");
      }

      // Migrate imported transactions to ensure they have all required fields
      const migratedTransactions = importedData.transactions.map(
        (t: LegacyTransaction) => ({
          ...t,
          buyPriceCurrency: t.buyPriceCurrency || "chaos",
          sellPriceCurrency: t.sellPriceCurrency || "chaos",
        })
      );

      // Update state with imported data
      setTransactions(migratedTransactions);
      setGroups(importedData.groups);

      if (importedData.divineToChaoRate) {
        setDivineToChaoRate(importedData.divineToChaoRate);
      }

      // Restore user settings if available
      if (importedData.profitFilter !== undefined) {
        setProfitFilter(importedData.profitFilter);
      }

      if (importedData.totalProfitCurrency !== undefined) {
        setTotalProfitCurrency(importedData.totalProfitCurrency);
      }

      if (importedData.selectedLeague !== undefined) {
        setSelectedLeague(importedData.selectedLeague);
      }

      if (importedData.enableApiCalls !== undefined) {
        setEnableApiCalls(importedData.enableApiCalls);
      }

      setImportStatus("success");
      showSuccessToast(TOAST_MESSAGES.DATA_IMPORTED);

      // Auto close modal after success
      setTimeout(() => {
        setShowDataModal(false);
        setImportStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Import failed:", error);
      setImportStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi import dữ liệu";
      setImportError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        setImportStatus("error");
        setImportError("Vui lòng chọn file JSON hợp lệ");
        return;
      }
      importData(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sticky Left Sidebar */}
      <StickyLeftSidebar
        divineToChaoRate={divineToChaoRate}
        totalProfitCurrency={totalProfitCurrency}
        getTotalProfitByFilter={getTotalProfitByFilter}
        chaosToDiv={chaosToDivFn}
        divToChaos={divToChaosFn}
        onUpdateExchangeRate={updateExchangeRate}
        onToggleTotalProfitCurrency={() =>
          setTotalProfitCurrency(
            totalProfitCurrency === "chaos" ? "divine" : "chaos"
          )
        }
        selectedLeague={selectedLeague}
        apiRate={apiRate}
        apiLastUpdated={apiLastUpdated}
        isLoadingApiRate={isLoadingApiRate}
        enableApiCalls={enableApiCalls}
        onLeagueChange={handleLeagueChange}
        onManualRateChange={handleManualRateChange}
        onToggleApiCalls={handleToggleApiCalls}
        groups={groups}
        profitFilter={profitFilter}
                onProfitFilterChange={setProfitFilter}
        onSidebarToggle={() => {}}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MainActions
          addTransaction={() => addTransaction()}
          isActionsCollapsed={isActionsCollapsed}
          setIsActionsCollapsed={setIsActionsCollapsed}
          setShowGroupForm={setShowGroupForm}
          setShowDataModal={setShowDataModal}
          setModalTab={setModalTab}
          transactions={transactions}
          clearAllData={clearAllData}
          showGroupForm={showGroupForm}
        />

        {showGroupForm && (
          <GroupForm
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            createGroup={createGroup}
            setShowGroupForm={setShowGroupForm}
          />
        )}

        {searchTerm && (
          <div className="mb-6 text-slate-400 text-sm">
            Hiển thị {getSortedTransactions().length} / {transactions.length}{" "}
            giao dịch
          </div>
        )}

        <div className="flex items-center justify-between">
          {transactions.length > 0 && (
            <>
              <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Dữ liệu được lưu tự động trong trình duyệt</span>
              </div>

              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <span className="text-slate-400 text-sm">Kiểu hiển thị:</span>
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    transactionViewType === "card"
                      ? "bg-yellow-500 text-slate-900 border-yellow-500"
                      : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                  }`}
                  onClick={() => setTransactionViewType("card")}
                >
                  Card
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    transactionViewType === "row"
                      ? "bg-yellow-500 text-slate-900 border-yellow-500"
                      : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                  }`}
                  onClick={() => setTransactionViewType("row")}
                >
                  Table/Row
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors opacity-50 cursor-not-allowed`}
                  disabled
                >
                  Option khác
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          {transactionViewType === "card" && (
            <>
                              <GroupList
                  groups={groups}
                  groupedTransactions={getTransactionsByGroup()}
                  editingGroupId={editingGroupId}
                  editingGroupName={editingGroupName}
                  startEditingGroup={startEditingGroup}
                  saveGroupEdit={saveGroupEdit}
                  cancelGroupEdit={cancelGroupEdit}
                  setEditingGroupName={setEditingGroupName}
                  toggleGroupExpansion={toggleGroupExpansion}
                  addTransaction={addTransaction}
                  deleteGroup={deleteGroup}
                  updateTransaction={(id, field, value) =>
                    updateTransaction(id, field as keyof Transaction, value)
                  }
                  removeTransaction={removeTransaction}
                  toggleFavorite={toggleFavorite}
                  calculateProfit={calculateProfit}
                  chaosToDiv={chaosToDivFn}
                  divToChaos={divToChaosFn}
                  convertPrice={convertPriceFn}
                  getPriceInChaos={getPriceInChaosFn}
                  onResetTransaction={resetTransaction}
                  onCompleteTransaction={completeTransaction}
                  onStartSelling={startSelling}
                />
                              <UngroupedTransactionList
                  groupedTransactions={getTransactionsByGroup()}
                  groups={groups}
                  updateTransaction={(id, field, value) =>
                    updateTransaction(id, field as keyof Transaction, value)
                  }
                  removeTransaction={removeTransaction}
                  toggleFavorite={toggleFavorite}
                  calculateProfit={calculateProfit}
                  chaosToDiv={chaosToDivFn}
                  divToChaos={divToChaosFn}
                  convertPrice={convertPriceFn}
                  getPriceInChaos={getPriceInChaosFn}
                  onResetTransaction={resetTransaction}
                  onCompleteTransaction={completeTransaction}
                  onStartSelling={startSelling}
                />
            </>
          )}
          {transactionViewType === "row" && (
            <TransactionTableView
              transactions={getSortedTransactions()}
              expandedRowId={expandedRowId}
              setExpandedRowId={setExpandedRowId}
              updateTransaction={(id, field, value) =>
                updateTransaction(id, field as keyof Transaction, value)
              }
              removeTransaction={removeTransaction}
              calculateProfit={calculateProfit}
              getPriceInChaos={getPriceInChaosFn}
              groups={groups}
              onResetTransaction={resetTransaction}
            />
          )}
        </div>

        {transactions.length === 0 && (
          <EmptyState addTransaction={() => addTransaction()} />
        )}
        {transactions.length > 0 && getSortedTransactions().length === 0 && (
          <NoSearchResult
            setSearchTerm={setSearchTerm}
            showInfoToast={showInfoToast}
            TOAST_MESSAGES={TOAST_MESSAGES}
          />
        )}
      </div>

      {/* Export/Import Modal */}
      <DataModal
        showDataModal={showDataModal}
        modalTab={modalTab}
        isExporting={isExporting}
        isImporting={isImporting}
        importStatus={importStatus}
        importError={importError}
        transactions={transactions}
        groups={groups}
        divineToChaoRate={divineToChaoRate}
        onClose={() => {
          setShowDataModal(false);
          setImportStatus("idle");
          setImportError("");
        }}
        onTabChange={(tab) => {
          setModalTab(tab);
          if (tab === "import") {
            setImportStatus("idle");
            setImportError("");
          }
        }}
        onExport={exportData}
        onFileUpload={handleFileUpload}
      />

      {/* Toast Provider */}
      <ToastProvider />
    </div>
  );
}
