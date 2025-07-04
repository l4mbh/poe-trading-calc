import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Coins, RefreshCw, Search, Star, Folder, FolderOpen, Edit3, Check, X, ArrowUpDown, Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  name: string;
  buyQuantity: number;
  buyPrice: number;
  sellQuantity: number;
  sellPrice: number;
  isFavorite: boolean;
  groupId: string | null;
  buyPriceCurrency: 'chaos' | 'divine';
  sellPriceCurrency: 'chaos' | 'divine';
}

interface TransactionGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
}

interface ExportData {
  transactions: Transaction[];
  groups: TransactionGroup[];
  divineToChaoRate: number;
  exportDate: string;
  version: string;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'poe-trading-transactions',
  GROUPS: 'poe-trading-groups',
  EXCHANGE_RATE: 'poe-divine-chaos-rate',
  LAST_UPDATED: 'poe-rate-last-updated'
};

const GROUP_COLORS = [
  'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'bg-green-500/20 border-green-500/30 text-green-400',
  'bg-purple-500/20 border-purple-500/30 text-purple-400',
  'bg-pink-500/20 border-pink-500/30 text-pink-400',
  'bg-orange-500/20 border-orange-500/30 text-orange-400',
  'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
];

// Currency images from POE Wiki
const CURRENCY_IMAGES = {
  chaos: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png',
  divine: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png'
};

function App() {
  const [divineToChaoRate, setDivineToChaoRate] = useState<number>(180);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showGroupForm, setShowGroupForm] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [totalProfitCurrency, setTotalProfitCurrency] = useState<'chaos' | 'divine'>('chaos');
  
  // Export/Import modal states
  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string>('');

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      // Load transactions
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions);
        // Migrate old transactions to include currency fields
        const migratedTransactions = parsedTransactions.map((t: any) => ({
          ...t,
          buyPriceCurrency: t.buyPriceCurrency || 'chaos',
          sellPriceCurrency: t.sellPriceCurrency || 'chaos'
        }));
        setTransactions(migratedTransactions);
      }

      // Load groups
      const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        setGroups(parsedGroups);
      }

      // Load exchange rate
      const savedRate = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
      if (savedRate) {
        setDivineToChaoRate(Number(savedRate));
      }

      // Load last updated timestamp
      const savedLastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
      if (savedLastUpdated) {
        setLastUpdated(new Date(savedLastUpdated));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }, [transactions]);

  // Save groups to localStorage whenever groups change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving groups to localStorage:', error);
    }
  }, [groups]);

  // Save exchange rate to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, divineToChaoRate.toString());
    } catch (error) {
      console.error('Error saving exchange rate to localStorage:', error);
    }
  }, [divineToChaoRate]);

  // Save last updated timestamp to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, lastUpdated.toISOString());
    } catch (error) {
      console.error('Error saving last updated timestamp to localStorage:', error);
    }
  }, [lastUpdated]);

  const updateExchangeRate = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await fetch('your-api-endpoint');
      // const data = await response.json();
      // setDivineToChaoRate(data.rate);
      
      // For demo purposes, we'll just update the timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to update exchange rate:', error);
    } finally {
      setIsUpdating(false);
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
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: string | number | boolean) => {
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
    }
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const cancelGroupEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  // Currency conversion functions
  const chaosToDiv = (chaosAmount: number) => {
    return chaosAmount / divineToChaoRate;
  };

  const divToChaos = (divAmount: number) => {
    return divAmount * divineToChaoRate;
  };

  const convertPrice = (price: number, fromCurrency: 'chaos' | 'divine', toCurrency: 'chaos' | 'divine') => {
    if (fromCurrency === toCurrency) return price;
    if (fromCurrency === 'chaos' && toCurrency === 'divine') return chaosToDiv(price);
    if (fromCurrency === 'divine' && toCurrency === 'chaos') return divToChaos(price);
    return price;
  };

  const getPriceInChaos = (price: number, currency: 'chaos' | 'divine') => {
    return currency === 'chaos' ? price : divToChaos(price);
  };

  const calculateProfit = (transaction: Transaction) => {
    const buyPriceInChaos = getPriceInChaos(transaction.buyPrice, transaction.buyPriceCurrency);
    const sellPriceInChaos = getPriceInChaos(transaction.sellPrice, transaction.sellPriceCurrency);
    
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
    
    return totalProfitCurrency === 'chaos' ? totalProfitInChaos : chaosToDiv(totalProfitInChaos);
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
        version: '1.0'
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
    } catch (error) {
      console.error('Export failed:', error);
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
      const migratedTransactions = importedData.transactions.map((t: any) => ({
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

      setImportStatus('success');
      
      // Auto close modal after success
      setTimeout(() => {
        setShowDataModal(false);
        setImportStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setImportError(error instanceof Error ? error.message : 'Lỗi không xác định khi import dữ liệu');
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const groupedTransactions = getTransactionsByGroup();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
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
              {/* Exchange Rate Section */}
              <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                    <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-4 h-4" />
                    <span>Divine → Chaos</span>
                    <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                  </label>
                  <button
                    onClick={updateExchangeRate}
                    disabled={isUpdating}
                    className="text-slate-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                    title="Cập nhật tỷ giá"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    type="number"
                    value={divineToChaoRate}
                    onChange={(e) => setDivineToChaoRate(Number(e.target.value))}
                    className="w-20 bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                  />
                  <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-400">
                  Cập nhật: {formatTime(lastUpdated)}
                </div>
              </div>

              {/* Total Profit */}
              <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-slate-300">Tổng lợi nhuận</div>
                  <button
                    onClick={() => setTotalProfitCurrency(totalProfitCurrency === 'chaos' ? 'divine' : 'chaos')}
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
                        chaosToDiv={chaosToDiv}
                        divToChaos={divToChaos}
                        convertPrice={convertPrice}
                        getPriceInChaos={getPriceInChaos}
                        groups={groups}
                        divineToChaoRate={divineToChaoRate}
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
                    chaosToDiv={chaosToDiv}
                    divToChaos={divToChaos}
                    convertPrice={convertPrice}
                    getPriceInChaos={getPriceInChaos}
                    groups={groups}
                    divineToChaoRate={divineToChaoRate}
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
              onClick={() => setSearchTerm('')}
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Export/Import Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Quản lý dữ liệu</h2>
              <button
                onClick={() => {
                  setShowDataModal(false);
                  setImportStatus('idle');
                  setImportError('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setModalTab('export')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  modalTab === 'export'
                    ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Xuất dữ liệu</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setModalTab('import');
                  setImportStatus('idle');
                  setImportError('');
                }}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  modalTab === 'import'
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Nhập dữ liệu</span>
                </div>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalTab === 'export' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">Xuất dữ liệu</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Tải xuống tất cả giao dịch và nhóm của bạn dưới dạng file JSON
                    </p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 text-sm text-slate-300">
                    <div className="flex justify-between mb-2">
                      <span>Số giao dịch:</span>
                      <span className="font-medium">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Số nhóm:</span>
                      <span className="font-medium">{groups.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tỷ giá hiện tại:</span>
                      <span className="font-medium">{divineToChaoRate} Chaos/Divine</span>
                    </div>
                  </div>

                  <button
                    onClick={exportData}
                    disabled={isExporting}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang xuất...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Tải xuống</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">Nhập dữ liệu</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Chọn file JSON đã xuất trước đó để khôi phục dữ liệu
                    </p>
                  </div>

                  {/* Import Status */}
                  {importStatus === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div className="text-green-400 text-sm">
                        Dữ liệu đã được nhập thành công!
                      </div>
                    </div>
                  )}

                  {importStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-red-400 text-sm">
                        <div className="font-medium mb-1">Lỗi nhập dữ liệu</div>
                        <div>{importError}</div>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-400/50 transition-colors">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      disabled={isImporting}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer ${isImporting ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <div className="text-slate-300 font-medium mb-1">
                        {isImporting ? 'Đang xử lý...' : 'Chọn file JSON'}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Kéo thả hoặc click để chọn file
                      </div>
                    </label>
                  </div>

                  {isImporting && (
                    <div className="flex items-center justify-center space-x-2 text-purple-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Đang nhập dữ liệu...</span>
                    </div>
                  )}

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400 text-sm">
                    <div className="font-medium mb-1">⚠️ Lưu ý quan trọng</div>
                    <div>Việc nhập dữ liệu sẽ thay thế hoàn toàn dữ liệu hiện tại. Hãy xuất dữ liệu hiện tại trước khi nhập.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Transaction Card Component
interface TransactionCardProps {
  transaction: Transaction;
  onUpdate: (id: string, field: keyof Transaction, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  calculateProfit: (transaction: Transaction) => { profit: number; profitPercentage: number };
  chaosToDiv: (chaosAmount: number) => number;
  divToChaos: (divAmount: number) => number;
  convertPrice: (price: number, fromCurrency: 'chaos' | 'divine', toCurrency: 'chaos' | 'divine') => number;
  getPriceInChaos: (price: number, currency: 'chaos' | 'divine') => number;
  groups: TransactionGroup[];
  divineToChaoRate: number;
}

function TransactionCard({ 
  transaction, 
  onUpdate, 
  onRemove, 
  onToggleFavorite, 
  calculateProfit, 
  chaosToDiv,
  divToChaos,
  convertPrice,
  getPriceInChaos,
  groups,
  divineToChaoRate
}: TransactionCardProps) {
  const { profit, profitPercentage } = calculateProfit(transaction);
  const isProfit = profit >= 0;
  const [profitDisplayCurrency, setProfitDisplayCurrency] = useState<'chaos' | 'divine'>('chaos');

  const toggleBuyPriceCurrency = () => {
    const newCurrency = transaction.buyPriceCurrency === 'chaos' ? 'divine' : 'chaos';
    const convertedPrice = convertPrice(transaction.buyPrice, transaction.buyPriceCurrency, newCurrency);
    onUpdate(transaction.id, 'buyPrice', convertedPrice);
    onUpdate(transaction.id, 'buyPriceCurrency', newCurrency);
  };

  const toggleSellPriceCurrency = () => {
    const newCurrency = transaction.sellPriceCurrency === 'chaos' ? 'divine' : 'chaos';
    const convertedPrice = convertPrice(transaction.sellPrice, transaction.sellPriceCurrency, newCurrency);
    onUpdate(transaction.id, 'sellPrice', convertedPrice);
    onUpdate(transaction.id, 'sellPriceCurrency', newCurrency);
  };

  const getBuyTotalInChaos = () => {
    return transaction.buyQuantity * getPriceInChaos(transaction.buyPrice, transaction.buyPriceCurrency);
  };

  const getSellTotalInChaos = () => {
    return transaction.sellQuantity * getPriceInChaos(transaction.sellPrice, transaction.sellPriceCurrency);
  };

  const getProfitInDisplayCurrency = () => {
    return profitDisplayCurrency === 'chaos' ? profit : chaosToDiv(profit);
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border p-6 hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg ${
      transaction.isFavorite ? 'border-yellow-400/50 ring-1 ring-yellow-400/20' : 'border-slate-700/50'
    }`}>
      {/* Transaction Header */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={transaction.name}
          onChange={(e) => onUpdate(transaction.id, 'name', e.target.value)}
          className="text-lg font-semibold text-white bg-transparent border-b border-slate-600 focus:border-yellow-400 focus:outline-none pb-1 flex-1 mr-2"
        />
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleFavorite(transaction.id)}
            className={`p-2 rounded-lg transition-colors ${
              transaction.isFavorite 
                ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10' 
                : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
            title={transaction.isFavorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
          >
            <Star className={`w-4 h-4 ${transaction.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onRemove(transaction.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
            title="Xóa giao dịch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Group Selection */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 block mb-1">Nhóm</label>
        <select
          value={transaction.groupId || ''}
          onChange={(e) => onUpdate(transaction.id, 'groupId', e.target.value || null)}
          className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
        >
          <option value="">Không có nhóm</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buy Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Mua vào</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Số lượng</label>
            <input
              type="number"
              value={transaction.buyQuantity}
              onChange={(e) => onUpdate(transaction.id, 'buyQuantity', Number(e.target.value))}
              className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">Giá/đơn vị</label>
              <button
                onClick={toggleBuyPriceCurrency}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-yellow-400 transition-colors"
                title="Chuyển đổi đơn vị"
              >
                <img src={CURRENCY_IMAGES[transaction.buyPriceCurrency]} alt={`${transaction.buyPriceCurrency} Orb`} className="w-3 h-3" />
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <input
              type="number"
              step={transaction.buyPriceCurrency === 'divine' ? '0.001' : '1'}
              value={transaction.buyPrice}
              onChange={(e) => onUpdate(transaction.id, 'buyPrice', Number(e.target.value))}
              className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
              placeholder="0"
            />
            {transaction.buyPrice > 0 && (
              <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                <span>≈ {transaction.buyPriceCurrency === 'chaos' ? chaosToDiv(transaction.buyPrice).toFixed(4) : divToChaos(transaction.buyPrice).toFixed(2)}</span>
                <img src={CURRENCY_IMAGES[transaction.buyPriceCurrency === 'chaos' ? 'divine' : 'chaos']} alt={`${transaction.buyPriceCurrency === 'chaos' ? 'divine' : 'chaos'} Orb`} className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
          <span>Tổng: {getBuyTotalInChaos().toFixed(2)}</span>
          <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-3 h-3" />
          {getBuyTotalInChaos() > 0 && (
            <>
              <span>(≈ {chaosToDiv(getBuyTotalInChaos()).toFixed(3)}</span>
              <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-3 h-3" />
              <span>)</span>
            </>
          )}
        </div>
      </div>

      {/* Sell Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Bán ra</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Số lượng</label>
            <input
              type="number"
              value={transaction.sellQuantity}
              onChange={(e) => onUpdate(transaction.id, 'sellQuantity', Number(e.target.value))}
              className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">Giá/đơn vị</label>
              <button
                onClick={toggleSellPriceCurrency}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-yellow-400 transition-colors"
                title="Chuyển đổi đơn vị"
              >
                <img src={CURRENCY_IMAGES[transaction.sellPriceCurrency]} alt={`${transaction.sellPriceCurrency} Orb`} className="w-3 h-3" />
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <input
              type="number"
              step={transaction.sellPriceCurrency === 'divine' ? '0.001' : '1'}
              value={transaction.sellPrice}
              onChange={(e) => onUpdate(transaction.id, 'sellPrice', Number(e.target.value))}
              className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
              placeholder="0"
            />
            {transaction.sellPrice > 0 && (
              <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                <span>≈ {transaction.sellPriceCurrency === 'chaos' ? chaosToDiv(transaction.sellPrice).toFixed(4) : divToChaos(transaction.sellPrice).toFixed(2)}</span>
                <img src={CURRENCY_IMAGES[transaction.sellPriceCurrency === 'chaos' ? 'divine' : 'chaos']} alt={`${transaction.sellPriceCurrency === 'chaos' ? 'divine' : 'chaos'} Orb`} className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
          <span>Tổng: {getSellTotalInChaos().toFixed(2)}</span>
          <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-3 h-3" />
          {getSellTotalInChaos() > 0 && (
            <>
              <span>(≈ {chaosToDiv(getSellTotalInChaos()).toFixed(3)}</span>
              <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-3 h-3" />
              <span>)</span>
            </>
          )}
        </div>
      </div>

      {/* Profit/Loss Section */}
      <div className={`rounded-lg p-4 ${isProfit ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isProfit ? 'Lợi nhuận' : 'Lỗ'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {profitPercentage.toFixed(2)}%
            </div>
            <button
              onClick={() => setProfitDisplayCurrency(profitDisplayCurrency === 'chaos' ? 'divine' : 'chaos')}
              className={`text-xs ${isProfit ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'} transition-colors`}
              title="Chuyển đổi đơn vị"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className={`text-lg font-bold flex items-center space-x-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          <span>{isProfit ? '+' : ''}{getProfitInDisplayCurrency().toFixed(profitDisplayCurrency === 'chaos' ? 2 : 3)}</span>
          <img src={CURRENCY_IMAGES[profitDisplayCurrency]} alt={`${profitDisplayCurrency} Orb`} className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
          <span>≈ {profitDisplayCurrency === 'chaos' ? chaosToDiv(profit).toFixed(3) : divToChaos(chaosToDiv(profit)).toFixed(2)}</span>
          <img src={CURRENCY_IMAGES[profitDisplayCurrency === 'chaos' ? 'divine' : 'chaos']} alt={`${profitDisplayCurrency === 'chaos' ? 'divine' : 'chaos'} Orb`} className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export default App;