import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Coins, Search, Folder, FolderOpen, Edit3, Check, X, Download, Upload } from 'lucide-react';

import { Transaction, TransactionGroup, ExportData, LegacyTransaction } from './types';
import { STORAGE_KEYS, GROUP_COLORS, POE_LEAGUES } from './utils/constants';
import { chaosToDiv, divToChaos, convertPrice, getPriceInChaos } from './utils/currencyUtils';
import { fetchDivineToChaoRate, formatLeagueName } from './utils/apiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast, TOAST_MESSAGES } from './utils/toastUtils';
import { Header } from './components/Header';
import { StickyLeftSidebar } from './components/StickyLeftSidebar';
import { TransactionCard } from './components/TransactionCard';
import { DataModal } from './components/DataModal';
import { ToastProvider } from './components/ToastProvider';



function App() {
  const [divineToChaoRate, setDivineToChaoRate] = useLocalStorage<number>(STORAGE_KEYS.EXCHANGE_RATE, 180);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const [groups, setGroups] = useLocalStorage<TransactionGroup[]>(STORAGE_KEYS.GROUPS, []);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showGroupForm, setShowGroupForm] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [totalProfitCurrency, setTotalProfitCurrency] = useLocalStorage<'chaos' | 'divine'>(STORAGE_KEYS.TOTAL_PROFIT_CURRENCY, 'chaos');
  const [profitFilter, setProfitFilter] = useLocalStorage<'all' | 'selected' | string>(STORAGE_KEYS.PROFIT_FILTER, 'all');
  
  // New states for API integration
  const [selectedLeague, setSelectedLeague] = useLocalStorage<string>(STORAGE_KEYS.SELECTED_LEAGUE, POE_LEAGUES[0]);
  const [apiRate, setApiRate] = useLocalStorage<number | null>(STORAGE_KEYS.API_RATE, null);
  const [apiLastUpdated, setApiLastUpdated] = useLocalStorage<Date | null>(STORAGE_KEYS.API_LAST_UPDATED, null);
  const [isLoadingApiRate, setIsLoadingApiRate] = useState<boolean>(false);
  const [enableApiCalls, setEnableApiCalls] = useLocalStorage<boolean>(STORAGE_KEYS.ENABLE_API_CALLS, true);
  
  // Export/Import modal states
  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string>('');

  // Migrate old data on component mount
  useEffect(() => {
    try {
      // Migrate old transactions to include currency fields
      const migratedTransactions = transactions.map((t: LegacyTransaction) => ({
        ...t,
        buyPriceCurrency: t.buyPriceCurrency || 'chaos',
        sellPriceCurrency: t.sellPriceCurrency || 'chaos'
      }));
      
      if (JSON.stringify(migratedTransactions) !== JSON.stringify(transactions)) {
        setTransactions(migratedTransactions);
      }
    } catch (error) {
      console.error('Error migrating data:', error);
    }
  }, []);

  // Load API rate on component mount and when league changes
  useEffect(() => {
    if (enableApiCalls) {
      loadApiRate();
    }
  }, [selectedLeague, enableApiCalls]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApiRate = async () => {
    if (!enableApiCalls) {
      showInfoToast('API calls đã bị tắt. Sử dụng tỷ giá thủ công.');
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
        showSuccessToast(`Đã cập nhật tỷ giá từ ${formattedLeague}: ${rate.toFixed(2)} Chaos`);
      } else {
        showInfoToast(`Tỷ giá API ${formattedLeague}: ${rate.toFixed(2)} Chaos (Giữ nguyên tỷ giá thủ công)`);
      }
    } catch (error) {
      console.error('Failed to load API rate:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      // Set fallback rates based on league
      const getFallbackRate = (league: string): number => {
        const lowerLeague = league.toLowerCase();
        
        // Known approximate rates for popular leagues
        if (lowerLeague.includes('standard')) return 200;
        if (lowerLeague.includes('hardcore')) return 185;
        if (lowerLeague.includes('mercenaries')) return 210;
        if (lowerLeague.includes('settlers')) return 195;
        if (lowerLeague.includes('crucible')) return 180;
        if (lowerLeague.includes('sanctum')) return 175;
        if (lowerLeague.includes('kalandra')) return 190;
        
        // Default for unknown leagues
        return 180;
      };
      
      // Only show detailed error if this is not a network/CORS issue
      if (errorMessage.includes('CORS') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        showWarningToast(`POE.ninja API hiện không khả dụng (CORS). Sử dụng tỷ giá dự phòng.`);
      } else {
        showWarningToast(errorMessage);
      }
      
      // Fallback: nếu chưa có tỷ giá nào, dùng giá trị mặc định hợp lý dựa trên league
      if (!divineToChaoRate || divineToChaoRate === 180) {
        const fallbackRate = getFallbackRate(selectedLeague);
        setDivineToChaoRate(fallbackRate);
        showInfoToast(`Sử dụng tỷ giá dự phòng cho ${selectedLeague}: ${fallbackRate} Chaos`);
      }
    } finally {
      setIsLoadingApiRate(false);
    }
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
      showInfoToast('Đã bật API calls. Sẽ tự động tải tỷ giá từ POE.ninja.');
      // Load API rate immediately when enabled
      setTimeout(() => loadApiRate(), 100);
    } else {
      showInfoToast('Đã tắt API calls. Chỉ sử dụng tỷ giá thủ công.');
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
      buyPriceCurrency: 'chaos',
      sellPriceCurrency: 'chaos',
    };
    setTransactions([...transactions, newTransaction]);
    showSuccessToast(TOAST_MESSAGES.TRANSACTION_ADDED);
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    showSuccessToast(TOAST_MESSAGES.TRANSACTION_DELETED);
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: string | number | boolean | null) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const toggleFavorite = (id: string) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
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
      setNewGroupName('');
      setShowGroupForm(false);
      showSuccessToast(TOAST_MESSAGES.GROUP_CREATED);
    }
  };

  const deleteGroup = (groupId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhóm này? Các giao dịch trong nhóm sẽ được chuyển về "Không có nhóm".')) {
      // Move transactions out of the group
      setTransactions(transactions.map(t => 
        t.groupId === groupId ? { ...t, groupId: null } : t
      ));
      // Remove the group
      setGroups(groups.filter(g => g.id !== groupId));
      showSuccessToast(TOAST_MESSAGES.GROUP_DELETED);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
    ));
  };

  const startEditingGroup = (group: TransactionGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const saveGroupEdit = () => {
    if (editingGroupName.trim()) {
      setGroups(groups.map(g => 
        g.id === editingGroupId ? { ...g, name: editingGroupName.trim() } : g
      ));
      showSuccessToast(TOAST_MESSAGES.GROUP_UPDATED);
    }
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const cancelGroupEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  // Currency conversion functions with divineToChaoRate parameter
  const chaosToDivFn = (chaosAmount: number) => {
    return chaosToDiv(chaosAmount, divineToChaoRate);
  };

  const divToChaosFn = (divAmount: number) => {
    return divToChaos(divAmount, divineToChaoRate);
  };

  const convertPriceFn = (price: number, fromCurrency: 'chaos' | 'divine', toCurrency: 'chaos' | 'divine') => {
    return convertPrice(price, fromCurrency, toCurrency, divineToChaoRate);
  };

  const getPriceInChaosFn = (price: number, currency: 'chaos' | 'divine') => {
    return getPriceInChaos(price, currency, divineToChaoRate);
  };

  const calculateProfit = (transaction: Transaction) => {
    const buyPriceInChaos = getPriceInChaosFn(transaction.buyPrice, transaction.buyPriceCurrency);
    const sellPriceInChaos = getPriceInChaosFn(transaction.sellPrice, transaction.sellPriceCurrency);
    
    const totalBuyValue = transaction.buyQuantity * buyPriceInChaos;
    const totalSellValue = transaction.sellQuantity * sellPriceInChaos;
    const profit = totalSellValue - totalBuyValue;
    const profitPercentage = totalBuyValue > 0 ? (profit / totalBuyValue) * 100 : 0;
    return { profit, profitPercentage };
  };

  const getTotalProfit = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalProfitInChaos = filteredTransactions.reduce((total, transaction) => {
      const { profit } = calculateProfit(transaction);
      return total + profit;
    }, 0);
    
    return totalProfitCurrency === 'chaos' ? totalProfitInChaos : chaosToDivFn(totalProfitInChaos);
  };

  const getTotalProfitByFilter = (filter: 'all' | 'selected' | string) => {
    let transactionsToCalculate: Transaction[];
    
    if (filter === 'all') {
      transactionsToCalculate = getFilteredTransactions();
    } else if (filter === 'selected') {
      transactionsToCalculate = getFilteredTransactions().filter(t => t.isSelected);
    } else {
      // Filter by group ID
      transactionsToCalculate = getFilteredTransactions().filter(t => t.groupId === filter);
    }
    
    const totalProfitInChaos = transactionsToCalculate.reduce((total, transaction) => {
      const { profit } = calculateProfit(transaction);
      return total + profit;
    }, 0);
    
    return totalProfitCurrency === 'chaos' ? totalProfitInChaos : chaosToDivFn(totalProfitInChaos);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction =>
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
      ungrouped: []
    };

    groups.forEach(group => {
      grouped[group.id] = [];
    });

    sorted.forEach(transaction => {
      if (transaction.groupId && grouped[transaction.groupId]) {
        grouped[transaction.groupId].push(transaction);
      } else {
        grouped.ungrouped.push(transaction);
      }
    });

    return grouped;
  };

  const clearAllData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      setTransactions([]);
      setGroups([]);
      setSearchTerm('');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exportData: ExportData = {
        transactions,
        groups,
        divineToChaoRate,
        exportDate: new Date().toISOString(),
        version: '1.0',
        profitFilter,
        totalProfitCurrency,
        selectedLeague,
        enableApiCalls
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `poe-trading-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccessToast(TOAST_MESSAGES.DATA_EXPORTED);
    } catch (error) {
      console.error('Export failed:', error);
      showErrorToast('Không thể xuất dữ liệu. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (file: File) => {
    setIsImporting(true);
    setImportStatus('idle');
    setImportError('');

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const text = await file.text();
      const importedData: ExportData = JSON.parse(text);

      // Validate imported data structure
      if (!importedData.transactions || !Array.isArray(importedData.transactions)) {
        throw new Error('Dữ liệu không hợp lệ: thiếu danh sách giao dịch');
      }

      if (!importedData.groups || !Array.isArray(importedData.groups)) {
        throw new Error('Dữ liệu không hợp lệ: thiếu danh sách nhóm');
      }

      // Migrate imported transactions to ensure they have all required fields
      const migratedTransactions = importedData.transactions.map((t: LegacyTransaction) => ({
        ...t,
        buyPriceCurrency: t.buyPriceCurrency || 'chaos',
        sellPriceCurrency: t.sellPriceCurrency || 'chaos'
      }));

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

      setImportStatus('success');
      showSuccessToast(TOAST_MESSAGES.DATA_IMPORTED);
      
      // Auto close modal after success
      setTimeout(() => {
        setShowDataModal(false);
        setImportStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi import dữ liệu';
      setImportError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setImportStatus('error');
        setImportError('Vui lòng chọn file JSON hợp lệ');
        return;
      }
      importData(file);
    }
  };

  const groupedTransactions = getTransactionsByGroup();

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
        onToggleTotalProfitCurrency={() => setTotalProfitCurrency(totalProfitCurrency === 'chaos' ? 'divine' : 'chaos')}
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
      />

      {/* Main Content with Left Margin */}
      <div className="ml-72">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Left side controls */}
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <button
              onClick={() => addTransaction()}
              className="group flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Thêm giao dịch</span>
            </button>

            <button
              onClick={() => setShowGroupForm(!showGroupForm)}
              className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-blue-600/30"
            >
              <Folder className="w-4 h-4" />
              <span>Tạo nhóm</span>
            </button>

            <button
              onClick={() => {
                setShowDataModal(true);
                setModalTab('export');
              }}
              className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-green-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Xuất dữ liệu</span>
            </button>

            <button
              onClick={() => {
                setShowDataModal(true);
                setModalTab('import');
              }}
              className="flex items-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-purple-600/30"
            >
              <Upload className="w-4 h-4" />
              <span>Nhập dữ liệu</span>
            </button>

            {transactions.length > 0 && (
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-red-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Group Creation Form */}
        {showGroupForm && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Tên nhóm..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createGroup()}
                className="flex-1 bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={createGroup}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowGroupForm(false);
                  setNewGroupName('');
                }}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-6 text-slate-400 text-sm">
            Hiển thị {getSortedTransactions().length} / {transactions.length} giao dịch
          </div>
        )}

        {/* Data persistence indicator */}
        {transactions.length > 0 && (
          <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Dữ liệu được lưu tự động trong trình duyệt</span>
          </div>
        )}

        {/* Groups and Transactions */}
        <div className="space-y-6">
          {/* Render each group */}
          {groups.map((group) => {
            const groupTransactions = groupedTransactions[group.id] || [];
            if (groupTransactions.length === 0 && searchTerm) return null;

            return (
              <div key={group.id} className="space-y-4">
                {/* Group Header */}
                <div className={`rounded-lg p-4 border ${group.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleGroupExpansion(group.id)}
                        className="text-current hover:opacity-70 transition-opacity"
                      >
                        {group.isExpanded ? (
                          <FolderOpen className="w-5 h-5" />
                        ) : (
                          <Folder className="w-5 h-5" />
                        )}
                      </button>
                      
                      {editingGroupId === group.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveGroupEdit()}
                            className="bg-slate-700/50 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={saveGroupEdit}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelGroupEdit}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{group.name}</h3>
                          <span className="text-sm opacity-70">({groupTransactions.length})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => addTransaction(group.id)}
                        className="text-current hover:opacity-70 transition-opacity"
                        title="Thêm giao dịch vào nhóm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditingGroup(group)}
                        className="text-current hover:opacity-70 transition-opacity"
                        title="Sửa tên nhóm"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Xóa nhóm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Transactions */}
                {group.isExpanded && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ml-4">
                    {groupTransactions.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onUpdate={updateTransaction}
                        onRemove={removeTransaction}
                        onToggleFavorite={toggleFavorite}
                        calculateProfit={calculateProfit}
                        chaosToDiv={chaosToDivFn}
                        divToChaos={divToChaosFn}
                        convertPrice={convertPriceFn}
                        getPriceInChaos={getPriceInChaosFn}
                        groups={groups}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Ungrouped Transactions */}
          {groupedTransactions.ungrouped.length > 0 && (
            <div className="space-y-4">
              {groups.length > 0 && (
                <div className="flex items-center space-x-2 text-slate-400">
                  <Folder className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Không có nhóm ({groupedTransactions.ungrouped.length})</h3>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupedTransactions.ungrouped.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onUpdate={updateTransaction}
                    onRemove={removeTransaction}
                    onToggleFavorite={toggleFavorite}
                    calculateProfit={calculateProfit}
                    chaosToDiv={chaosToDivFn}
                    divToChaos={divToChaosFn}
                    convertPrice={convertPriceFn}
                    getPriceInChaos={getPriceInChaosFn}
                    groups={groups}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {transactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-slate-400 mb-4">Bắt đầu bằng cách thêm giao dịch đầu tiên của bạn</p>
            <button
              onClick={() => addTransaction()}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm giao dịch</span>
            </button>
          </div>
        )}

        {/* No Search Results */}
        {transactions.length > 0 && getSortedTransactions().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Không tìm thấy giao dịch</h3>
            <p className="text-slate-400 mb-4">Thử tìm kiếm với từ khóa khác</p>
            <button
              onClick={() => {
                setSearchTerm('');
                showInfoToast(TOAST_MESSAGES.SEARCH_CLEARED);
              }}
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
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
            setImportStatus('idle');
            setImportError('');
          }}
          onTabChange={(tab) => {
            setModalTab(tab);
            if (tab === 'import') {
              setImportStatus('idle');
              setImportError('');
            }
          }}
          onExport={exportData}
          onFileUpload={handleFileUpload}
        />

        {/* Toast Provider */}
        <ToastProvider />
      </div>
    </div>
  );
}

export default App;