import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { LayoutGrid, Table, MoreHorizontal } from "lucide-react";

import {
  Transaction,
  TransactionGroup,
  CompletedTransaction,
  ExportData,
  LegacyTransaction,
} from "../types";
import { STORAGE_KEYS, GROUP_COLORS } from "../utils/constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAppContext } from "../contexts/AppContext";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
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
  const {
    setGetTotalProfitByFilter,
    setGetCompletedProfitByFilter,
    setDivineToChaoRate: setContextDivineToChaoRate,
    setTotalProfitCurrency: setContextTotalProfitCurrency,
    setProfitMode: setContextProfitMode,
    showSidebar,
    setGroups: setContextGroups,
    chaosToDiv,
    divToChaos,
    convertPrice,
    getPriceInChaos,
    divineToChaoRate,
    onToggleSidebar,
    selectedLeague,
    setSelectedLeague,
    apiRate,
    apiLastUpdated,
    isLoadingApiRate,
    enableApiCalls,
    setEnableApiCalls,
    loadApiRate
  } = useAppContext();
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
  const [profitMode, setProfitMode] = useLocalStorage<"active" | "completed">(
    STORAGE_KEYS.PROFIT_MODE,
    "active"
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

  // Track if migration has been performed
  const migrationPerformed = useRef(false);

  // Migrate old data on component mount
  useEffect(() => {
    // Only run migration once
    if (migrationPerformed.current) {
      return;
    }

    try {
      // Check if any transaction needs migration
      const needsMigration = transactions.some((t: LegacyTransaction) => 
        !t.buyPriceCurrency || !t.sellPriceCurrency
      );

      if (needsMigration) {
        console.log("Running migration for transactions without currency fields");
        // Migrate old transactions to include currency fields
        const migratedTransactions = transactions.map((t: LegacyTransaction) => ({
          ...t,
          buyPriceCurrency: t.buyPriceCurrency || "chaos",
          sellPriceCurrency: t.sellPriceCurrency || "chaos",
        }));

        setTransactions(migratedTransactions);
      }
      
      // Mark migration as completed regardless
      migrationPerformed.current = true;
    } catch (error) {
      console.error("Error migrating data:", error);
      migrationPerformed.current = true; // Mark as completed even on error
    }
  }, []); // Empty dependency array - only run once on mount

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

  const convertPriceFn = (
    price: number,
    fromCurrency: "chaos" | "divine",
    toCurrency: "chaos" | "divine"
  ) => {
    return convertPrice(price, fromCurrency, toCurrency);
  };

  const getPriceInChaosFn = (price: number, currency: "chaos" | "divine") => {
    return getPriceInChaos(price, currency);
  };

  const calculateProfit = useCallback((transaction: Transaction) => {
    const buyTotalInChaos = getPriceInChaosFn(
      transaction.buyPrice,
      transaction.buyPriceCurrency
    ) * transaction.buyQuantity;

    const sellTotalInChaos = getPriceInChaosFn(
      transaction.sellPrice,
      transaction.sellPriceCurrency
    ) * transaction.sellQuantity;

    const profit = sellTotalInChaos - buyTotalInChaos;
    const profitPercentage = buyTotalInChaos > 0 ? (profit / buyTotalInChaos) * 100 : 0;

    return { profit, profitPercentage };
  }, [getPriceInChaosFn]);

  const getFilteredTransactions = useCallback(() => {
    return transactions.filter((transaction) =>
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const getTotalProfitByFilter = useCallback((filter: "all" | "selected" | string) => {
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
      : chaosToDiv ? chaosToDiv(totalProfitInChaos) : (totalProfitInChaos / divineToChaoRate);
  }, [getFilteredTransactions, calculateProfit, totalProfitCurrency, chaosToDiv, divineToChaoRate]);

  const getCompletedProfitByFilter = useCallback((filter: "all" | "selected" | string) => {
    let completedTransactionsToCalculate: CompletedTransaction[];

    if (filter === "all") {
      completedTransactionsToCalculate = completedTransactions;
    } else if (filter === "selected") {
      completedTransactionsToCalculate = completedTransactions;
    } else {
      completedTransactionsToCalculate = completedTransactions;
    }

    const totalProfitInChaos = completedTransactionsToCalculate.reduce(
      (total, transaction) => {
        return total + transaction.profit;
      },
      0
    );

    return totalProfitCurrency === "chaos"
      ? totalProfitInChaos
      : chaosToDiv ? chaosToDiv(totalProfitInChaos) : (totalProfitInChaos / divineToChaoRate);
  }, [completedTransactions, totalProfitCurrency, chaosToDiv, divineToChaoRate]);

  const getSortedTransactions = useCallback(() => {
    const filtered = getFilteredTransactions();
    return filtered.sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  }, [getFilteredTransactions]);

  const getTransactionsByGroup = useCallback(() => {
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
  }, [getSortedTransactions, groups]);

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
        selectedLeague: "",
        enableApiCalls: true,
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
        setContextDivineToChaoRate(importedData.divineToChaoRate);
      }

      // Restore user settings if available
      if (importedData.profitFilter !== undefined) {
        setProfitFilter(importedData.profitFilter);
      }

      if (importedData.totalProfitCurrency !== undefined) {
        setTotalProfitCurrency(importedData.totalProfitCurrency);
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

  // Register functions with AppContext
  useEffect(() => {
    setGetTotalProfitByFilter(() => getTotalProfitByFilter);
    setGetCompletedProfitByFilter(() => getCompletedProfitByFilter);
  }, [setGetTotalProfitByFilter, setGetCompletedProfitByFilter]); // Remove unstable functions from dependencies

  // Sync state with AppContext
  useEffect(() => {
    setContextDivineToChaoRate(divineToChaoRate);
  }, [divineToChaoRate, setContextDivineToChaoRate]);

  useEffect(() => {
    setContextTotalProfitCurrency(totalProfitCurrency);
  }, [totalProfitCurrency, setContextTotalProfitCurrency]);

  useEffect(() => {
    setContextProfitMode(profitMode);
  }, [profitMode, setContextProfitMode]);

  // Sync groups with AppContext
  useEffect(() => {
    setContextGroups(groups);
  }, [groups, setContextGroups]);

  // Pre-calculate profit values to avoid re-rendering
  const currentTotalProfit = getTotalProfitByFilter(profitFilter);
  const currentCompletedProfit = getCompletedProfitByFilter(profitFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sticky Left Sidebar */}
      {showSidebar && (
        <StickyLeftSidebar
          divineToChaoRate={divineToChaoRate}
          totalProfitCurrency={totalProfitCurrency}
          currentTotalProfit={currentTotalProfit}
          currentCompletedProfit={currentCompletedProfit}
          onUpdateExchangeRate={loadApiRate}
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
          onLeagueChange={setSelectedLeague}
          onManualRateChange={setContextDivineToChaoRate}
          onToggleApiCalls={() => setEnableApiCalls(!enableApiCalls)}
          groups={groups}
          profitFilter={profitFilter}
          onProfitFilterChange={setProfitFilter}
          profitMode={profitMode}
          onProfitModeChange={setProfitMode}
          onSidebarToggle={onToggleSidebar}
          chaosToDiv={chaosToDiv ? chaosToDiv : (chaosAmount) => chaosAmount / divineToChaoRate}
          divToChaos={divToChaos ? divToChaos : (divAmount) => divAmount * divineToChaoRate}
        />
      )}

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
                <div className="inline-flex rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                  <button
                    className={`p-2 transition-colors focus:outline-none ${
                      transactionViewType === "card"
                        ? "bg-yellow-500 text-slate-900"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setTransactionViewType("card")}
                    title="Hiển thị dạng thẻ (Card)"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-2 transition-colors focus:outline-none border-l border-slate-700 ${
                      transactionViewType === "row"
                        ? "bg-yellow-500 text-slate-900"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setTransactionViewType("row")}
                    title="Hiển thị dạng bảng (Table/Row)"
                  >
                    <Table className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-slate-400 opacity-50 cursor-not-allowed border-l border-slate-700"
                    disabled
                    title="Tùy chọn khác (sắp có)"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
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
                  chaosToDiv={chaosToDiv ? chaosToDiv : (chaosAmount) => chaosAmount / divineToChaoRate}
                  divToChaos={divToChaos ? divToChaos : (divAmount) => divAmount * divineToChaoRate}
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
                  chaosToDiv={chaosToDiv ? chaosToDiv : (chaosAmount) => chaosAmount / divineToChaoRate}
                  divToChaos={divToChaos ? divToChaos : (divAmount) => divAmount * divineToChaoRate}
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
