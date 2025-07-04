import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Star, 
  Users, 
  Download, 
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';

interface Transaction {
  id: string;
  name: string;
  pricePerUnit: number;
  pricePerUnitCurrency: 'chaos' | 'divine';
  quantity: number;
  totalCost: number;
  totalCostCurrency: 'chaos' | 'divine';
  profit: number;
  profitCurrency: 'chaos' | 'divine';
  isFavorite: boolean;
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

interface ExportData {
  transactions: Transaction[];
  groups: Group[];
  divineToChaoRate: number;
  userDivineToChaoRate: number;
  selectedLeague: string;
  exportDate: string;
  version: string;
}

const POE_LEAGUES = [
  'Standard',
  'Hardcore',
  'Settlers',
  'Hardcore Settlers',
  'Solo Self-Found',
  'Hardcore Solo Self-Found',
  'Mercenaries',
  'Hardcore Mercenaries'
];

const GROUP_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('Mercenaries');
  const [apiDivineToChaoRate, setApiDivineToChaoRate] = useState(180);
  const [userDivineToChaoRate, setUserDivineToChaoRate] = useState(180);
  const [apiLastUpdated, setApiLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    pricePerUnit: '',
    pricePerUnitCurrency: 'chaos' as 'chaos' | 'divine',
    quantity: '',
    totalCost: '',
    totalCostCurrency: 'chaos' as 'chaos' | 'divine',
    profit: '',
    profitCurrency: 'chaos' as 'chaos' | 'divine',
    groupId: ''
  });
  const [newGroup, setNewGroup] = useState({ name: '', color: GROUP_COLORS[0] });
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState('');
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('poe-transactions');
    const savedGroups = localStorage.getItem('poe-groups');
    const savedApiRate = localStorage.getItem('poe-api-divine-rate');
    const savedUserRate = localStorage.getItem('poe-user-divine-rate');
    const savedLeague = localStorage.getItem('poe-selected-league');
    const savedApiLastUpdated = localStorage.getItem('poe-api-last-updated');

    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        // Migrate old data to include currency fields
        const migratedTransactions = parsedTransactions.map((t: any) => ({
          ...t,
          pricePerUnitCurrency: t.pricePerUnitCurrency || 'chaos',
          totalCostCurrency: t.totalCostCurrency || 'chaos',
          profitCurrency: t.profitCurrency || 'chaos'
        }));
        setTransactions(migratedTransactions);
      } catch (error) {
        console.error('Error parsing saved transactions:', error);
      }
    }

    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error('Error parsing saved groups:', error);
      }
    }

    if (savedApiRate) {
      setApiDivineToChaoRate(parseFloat(savedApiRate));
    }

    if (savedUserRate) {
      setUserDivineToChaoRate(parseFloat(savedUserRate));
    }

    if (savedLeague) {
      setSelectedLeague(savedLeague);
    }

    if (savedApiLastUpdated) {
      setApiLastUpdated(new Date(savedApiLastUpdated));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('poe-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('poe-groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('poe-api-divine-rate', apiDivineToChaoRate.toString());
  }, [apiDivineToChaoRate]);

  useEffect(() => {
    localStorage.setItem('poe-user-divine-rate', userDivineToChaoRate.toString());
  }, [userDivineToChaoRate]);

  useEffect(() => {
    localStorage.setItem('poe-selected-league', selectedLeague);
  }, [selectedLeague]);

  useEffect(() => {
    if (apiLastUpdated) {
      localStorage.setItem('poe-api-last-updated', apiLastUpdated.toISOString());
    }
  }, [apiLastUpdated]);

  // Fetch exchange rate from POE.ninja API
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch(
        `https://poe.ninja/api/data/currencyoverview?league=${selectedLeague}&type=Currency`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const divineOrb = data.lines?.find((item: any) => 
        item.currencyTypeName === 'Divine Orb'
      );
      
      if (divineOrb && divineOrb.chaosEquivalent) {
        const newRate = Math.round(divineOrb.chaosEquivalent * 100) / 100;
        setApiDivineToChaoRate(newRate);
        setUserDivineToChaoRate(newRate);
        setApiLastUpdated(new Date());
      } else {
        throw new Error('Divine Orb data not found in API response');
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      alert('Không thể tải tỉ giá từ POE.ninja. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Fetch rate on component mount and league change
  useEffect(() => {
    fetchExchangeRate();
  }, [selectedLeague]);

  const convertCurrency = (amount: number, fromCurrency: 'chaos' | 'divine', toCurrency: 'chaos' | 'divine'): number => {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'divine' && toCurrency === 'chaos') {
      return amount * userDivineToChaoRate;
    } else if (fromCurrency === 'chaos' && toCurrency === 'divine') {
      return amount / userDivineToChaoRate;
    }
    
    return amount;
  };

  const formatCurrency = (amount: number, currency: 'chaos' | 'divine'): string => {
    const formatted = amount.toFixed(2);
    return currency === 'chaos' ? `${formatted} 🔥` : `${formatted} ⚡`;
  };

  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.pricePerUnit || !newTransaction.quantity) {
      alert('Vui lòng điền đầy đủ thông tin giao dịch');
      return;
    }

    const pricePerUnit = parseFloat(newTransaction.pricePerUnit);
    const quantity = parseFloat(newTransaction.quantity);
    const totalCost = parseFloat(newTransaction.totalCost) || (pricePerUnit * quantity);
    const profit = parseFloat(newTransaction.profit) || 0;

    const transaction: Transaction = {
      id: Date.now().toString(),
      name: newTransaction.name,
      pricePerUnit,
      pricePerUnitCurrency: newTransaction.pricePerUnitCurrency,
      quantity,
      totalCost,
      totalCostCurrency: newTransaction.totalCostCurrency,
      profit,
      profitCurrency: newTransaction.profitCurrency,
      isFavorite: false,
      groupId: newTransaction.groupId || undefined
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      name: '',
      pricePerUnit: '',
      pricePerUnitCurrency: 'chaos',
      quantity: '',
      totalCost: '',
      totalCostCurrency: 'chaos',
      profit: '',
      profitCurrency: 'chaos',
      groupId: ''
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const addGroup = () => {
    if (!newGroup.name) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }

    const group: Group = {
      id: Date.now().toString(),
      name: newGroup.name,
      color: newGroup.color
    };

    setGroups([...groups, group]);
    setNewGroup({ name: '', color: GROUP_COLORS[0] });
    setShowGroupForm(false);
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setTransactions(transactions.map(t => 
      t.groupId === groupId ? { ...t, groupId: undefined } : t
    ));
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort: favorites first, then by creation time (newest first)
    filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return parseInt(b.id) - parseInt(a.id);
    });

    return filtered;
  }, [transactions, searchTerm]);

  const totalProfit = useMemo(() => {
    return transactions.reduce((sum, t) => {
      const profitInChaos = convertCurrency(t.profit, t.profitCurrency, 'chaos');
      return sum + profitInChaos;
    }, 0);
  }, [transactions, userDivineToChaoRate]);

  const getGroupById = (groupId?: string) => {
    return groups.find(g => g.id === groupId);
  };

  const exportData = async () => {
    setExportStatus('loading');
    
    try {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exportData: ExportData = {
        transactions,
        groups,
        divineToChaoRate: apiDivineToChaoRate,
        userDivineToChaoRate,
        selectedLeague,
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
      setExportStatus('success');
      
      setTimeout(() => {
        setExportStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    setImportError('');

    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      // Validate data structure
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Dữ liệu không hợp lệ: thiếu danh sách giao dịch');
      }

      // Migrate old data format
      const migratedTransactions = data.transactions.map(t => ({
        ...t,
        pricePerUnitCurrency: t.pricePerUnitCurrency || 'chaos',
        totalCostCurrency: t.totalCostCurrency || 'chaos',
        profitCurrency: t.profitCurrency || 'chaos'
      }));

      setTransactions(migratedTransactions);
      setGroups(data.groups || []);
      
      if (data.divineToChaoRate) {
        setApiDivineToChaoRate(data.divineToChaoRate);
      }
      
      if (data.userDivineToChaoRate) {
        setUserDivineToChaoRate(data.userDivineToChaoRate);
      }
      
      if (data.selectedLeague) {
        setSelectedLeague(data.selectedLeague);
      }

      setImportStatus('success');
      
      setTimeout(() => {
        setImportStatus('idle');
        setShowExportImportModal(false);
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setImportError(error instanceof Error ? error.message : 'Lỗi không xác định');
      setImportStatus('error');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      const fakeEvent = {
        target: { files: [jsonFile] }
      } as any;
      await handleFileImport(fakeEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            POE Trading Calculator
          </h1>
          <p className="text-gray-400">Tính toán lợi nhuận giao dịch Path of Exile</p>
        </div>

        {/* League Selection and Exchange Rate */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* League Selection */}
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-blue-400" />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mùa POE
                </label>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {POE_LEAGUES.map(league => (
                    <option key={league} value={league}>
                      {league}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡ = </span>
                  <input
                    type="number"
                    value={userDivineToChaoRate}
                    onChange={(e) => setUserDivineToChaoRate(parseFloat(e.target.value) || 0)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-24 text-center text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
                    step="0.01"
                  />
                  <span className="text-lg">🔥</span>
                  <button
                    onClick={fetchExchangeRate}
                    disabled={isLoadingRate}
                    className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                    title="Cập nhật tỉ giá từ POE.ninja"
                  >
                    {isLoadingRate ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  <div>POE.NINJA: {apiDivineToChaoRate.toFixed(2)} 🔥</div>
                  {apiLastUpdated && (
                    <div>Cập nhật: {apiLastUpdated.toLocaleString('vi-VN')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Export/Import Button */}
            <button
              onClick={() => setShowExportImportModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất/Nhập dữ liệu
            </button>
          </div>
        </div>

        {/* Search and Group Management */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowGroupForm(!showGroupForm)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              Quản lý nhóm
            </button>
          </div>

          {/* Group Management */}
          {showGroupForm && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tên nhóm
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập tên nhóm..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Màu sắc
                  </label>
                  <div className="flex gap-2">
                    {GROUP_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewGroup({ ...newGroup, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newGroup.color === color ? 'border-white' : 'border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={addGroup}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Thêm nhóm
                </button>
              </div>

              {/* Existing Groups */}
              {groups.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Nhóm hiện có:</h4>
                  <div className="flex flex-wrap gap-2">
                    {groups.map(group => (
                      <div
                        key={group.id}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: group.color + '20', border: `1px solid ${group.color}` }}
                      >
                        <span style={{ color: group.color }}>●</span>
                        <span>{group.name}</span>
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Transaction Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Thêm giao dịch mới
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tên giao dịch
              </label>
              <input
                type="text"
                value={newTransaction.name}
                onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên giao dịch..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Giá/Đơn vị
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newTransaction.pricePerUnit}
                  onChange={(e) => setNewTransaction({ ...newTransaction, pricePerUnit: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                <select
                  value={newTransaction.pricePerUnitCurrency}
                  onChange={(e) => setNewTransaction({ ...newTransaction, pricePerUnitCurrency: e.target.value as 'chaos' | 'divine' })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="chaos">🔥</option>
                  <option value="divine">⚡</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Số lượng
              </label>
              <input
                type="number"
                value={newTransaction.quantity}
                onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nhóm
              </label>
              <select
                value={newTransaction.groupId}
                onChange={(e) => setNewTransaction({ ...newTransaction, groupId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Không có nhóm</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tổng chi phí
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newTransaction.totalCost}
                  onChange={(e) => setNewTransaction({ ...newTransaction, totalCost: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tự động tính toán..."
                  step="0.01"
                />
                <select
                  value={newTransaction.totalCostCurrency}
                  onChange={(e) => setNewTransaction({ ...newTransaction, totalCostCurrency: e.target.value as 'chaos' | 'divine' })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="chaos">🔥</option>
                  <option value="divine">⚡</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Lợi nhuận
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newTransaction.profit}
                  onChange={(e) => setNewTransaction({ ...newTransaction, profit: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                <select
                  value={newTransaction.profitCurrency}
                  onChange={(e) => setNewTransaction({ ...newTransaction, profitCurrency: e.target.value as 'chaos' | 'divine' })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="chaos">🔥</option>
                  <option value="divine">⚡</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={addTransaction}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm giao dịch
          </button>
        </div>

        {/* Total Profit */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Tổng lợi nhuận</h2>
          <div className="text-3xl font-bold">
            {formatCurrency(totalProfit, 'chaos')} 
            <span className="text-lg ml-2">
              (≈ {formatCurrency(convertCurrency(totalProfit, 'chaos', 'divine'), 'divine')})
            </span>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Danh sách giao dịch ({filteredTransactions.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const group = getGroupById(transaction.groupId);
                return (
                  <div key={transaction.id} className="p-6 hover:bg-gray-750 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFavorite(transaction.id)}
                          className={`p-1 rounded ${
                            transaction.isFavorite 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-gray-400 hover:text-yellow-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${transaction.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <h3 className="text-lg font-semibold">{transaction.name}</h3>
                        {group && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: group.color + '20', 
                              color: group.color,
                              border: `1px solid ${group.color}`
                            }}
                          >
                            {group.name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Giá/Đơn vị:</span>
                        <div className="font-medium">
                          {formatCurrency(transaction.pricePerUnit, transaction.pricePerUnitCurrency)}
                          <div className="text-xs text-gray-400">
                            ≈ {formatCurrency(
                              convertCurrency(transaction.pricePerUnit, transaction.pricePerUnitCurrency, 
                                transaction.pricePerUnitCurrency === 'chaos' ? 'divine' : 'chaos'), 
                              transaction.pricePerUnitCurrency === 'chaos' ? 'divine' : 'chaos'
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Số lượng:</span>
                        <div className="font-medium">{transaction.quantity}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Tổng chi phí:</span>
                        <div className="font-medium">
                          {formatCurrency(transaction.totalCost, transaction.totalCostCurrency)}
                          <div className="text-xs text-gray-400">
                            ≈ {formatCurrency(
                              convertCurrency(transaction.totalCost, transaction.totalCostCurrency, 
                                transaction.totalCostCurrency === 'chaos' ? 'divine' : 'chaos'), 
                              transaction.totalCostCurrency === 'chaos' ? 'divine' : 'chaos'
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Lợi nhuận:</span>
                        <div className={`font-medium ${transaction.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(transaction.profit, transaction.profitCurrency)}
                          <div className="text-xs text-gray-400">
                            ≈ {formatCurrency(
                              convertCurrency(transaction.profit, transaction.profitCurrency, 
                                transaction.profitCurrency === 'chaos' ? 'divine' : 'chaos'), 
                              transaction.profitCurrency === 'chaos' ? 'divine' : 'chaos'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Export/Import Modal */}
        {showExportImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Quản lý dữ liệu</h3>
                <button
                  onClick={() => {
                    setShowExportImportModal(false);
                    setExportStatus('idle');
                    setImportStatus('idle');
                    setImportError('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Tabs */}
                <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('export')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'export'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Xuất dữ liệu
                  </button>
                  <button
                    onClick={() => setActiveTab('import')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'import'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Nhập dữ liệu
                  </button>
                </div>

                {/* Export Tab */}
                {activeTab === 'export' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300">
                      <p className="mb-2">Xuất tất cả dữ liệu của bạn:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>{transactions.length} giao dịch</li>
                        <li>{groups.length} nhóm</li>
                        <li>Tỉ giá quy đổi: {userDivineToChaoRate} 🔥</li>
                        <li>Mùa hiện tại: {selectedLeague}</li>
                      </ul>
                    </div>

                    <button
                      onClick={exportData}
                      disabled={exportStatus === 'loading'}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        exportStatus === 'loading'
                          ? 'bg-gray-600 cursor-not-allowed'
                          : exportStatus === 'success'
                          ? 'bg-green-600 hover:bg-green-700'
                          : exportStatus === 'error'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {exportStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {exportStatus === 'success' && <Check className="w-4 h-4" />}
                      {exportStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                      {exportStatus === 'loading' && 'Đang xuất...'}
                      {exportStatus === 'success' && 'Xuất thành công!'}
                      {exportStatus === 'error' && 'Lỗi xuất dữ liệu'}
                      {exportStatus === 'idle' && (
                        <>
                          <Download className="w-4 h-4" />
                          Xuất dữ liệu
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300">
                      <p className="mb-2">Nhập dữ liệu từ file JSON:</p>
                      <p className="text-yellow-400 text-xs">
                        ⚠️ Thao tác này sẽ thay thế toàn bộ dữ liệu hiện tại
                      </p>
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-300 mb-2">Kéo thả file hoặc click để chọn</p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                        id="file-input"
                      />
                      <label
                        htmlFor="file-input"
                        className="inline-block bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Chọn file JSON
                      </label>
                    </div>

                    {importStatus === 'loading' && (
                      <div className="flex items-center justify-center gap-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    )}

                    {importStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="w-4 h-4" />
                        <span>Nhập dữ liệu thành công!</span>
                      </div>
                    )}

                    {importStatus === 'error' && (
                      <div className="flex items-start gap-2 text-red-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>Lỗi nhập dữ liệu:</p>
                          <p className="text-sm">{importError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;