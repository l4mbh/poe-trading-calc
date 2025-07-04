import React, { useState, useMemo } from 'react';
import { CompletedTransaction } from '../types';
import { CURRENCY_IMAGES } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, TimerIcon } from 'lucide-react';

export default function StatisticsPage() {
  const [completedTransactions] = useLocalStorage<CompletedTransaction[]>(
    'poe-completed-transactions',
    []
  );
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Get unique dates from completed transactions
  const availableDates = useMemo(() => {
    const dates = [...new Set(completedTransactions.map(t => t.completedDate))];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [completedTransactions]);

  // Filter transactions by selected date
  const filteredTransactions = useMemo(() => {
    if (!selectedDate) return completedTransactions;
    return completedTransactions.filter(t => t.completedDate === selectedDate);
  }, [completedTransactions, selectedDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return {
        totalProfit: 0,
        totalProfitDivine: 0,
        totalProfitPercentage: 0,
        profitableTransactions: 0,
        lossTransactions: 0,
        totalTransactions: 0,
        averageProfit: 0,
        averageProfitDivine: 0,
        bestTransaction: null as CompletedTransaction | null,
        worstTransaction: null as CompletedTransaction | null,
        averageSellingDuration: 0,
        totalSellingDuration: 0,
        transactionsWithDuration: 0,
      };
    }

    const profits = filteredTransactions.map(t => t.profit);
    const totalProfit = profits.reduce((sum, profit) => sum + profit, 0);
    const totalProfitDivine = totalProfit / 200; // Assuming 1 divine = 200 chaos for display
    const profitableTransactions = profits.filter(p => p > 0).length;
    const lossTransactions = profits.filter(p => p < 0).length;
    const averageProfit = totalProfit / filteredTransactions.length;
    const averageProfitDivine = averageProfit / 200;
    
    const bestTransaction = filteredTransactions.reduce((best, current) => 
      current.profit > best.profit ? current : best
    );
    
    const worstTransaction = filteredTransactions.reduce((worst, current) => 
      current.profit < worst.profit ? current : worst
    );

    const totalProfitPercentage = filteredTransactions.reduce((sum, t) => sum + t.profitPercentage, 0) / filteredTransactions.length;

    // Calculate selling duration statistics
    const transactionsWithDuration = filteredTransactions.filter(t => t.sellingDuration !== undefined);
    const totalSellingDuration = transactionsWithDuration.reduce((sum, t) => sum + (t.sellingDuration || 0), 0);
    const averageSellingDuration = transactionsWithDuration.length > 0 ? totalSellingDuration / transactionsWithDuration.length : 0;

    return {
      totalProfit,
      totalProfitDivine,
      totalProfitPercentage,
      profitableTransactions,
      lossTransactions,
      totalTransactions: filteredTransactions.length,
      averageProfit,
      averageProfitDivine,
      bestTransaction,
      worstTransaction,
      averageSellingDuration,
      totalSellingDuration,
      transactionsWithDuration: transactionsWithDuration.length,
    };
  }, [filteredTransactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatProfit = (profit: number, isDivine: boolean = false) => {
    const isPositive = profit >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{profit.toFixed(isDivine ? 3 : 2)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Thống kê giao dịch</h1>
          <p className="text-slate-400">Xem thống kê các giao dịch đã hoàn thành</p>
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Chọn ngày
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-400 focus:outline-none"
          >
            <option value="">Tất cả các ngày</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Tổng lợi nhuận</p>
                <p className="text-2xl font-bold text-white flex items-center space-x-2">
                  {formatProfit(stats.totalProfitDivine, true)}
                  <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-6 h-6" />
                </p>
                <p className="text-sm text-slate-400 flex items-center space-x-1">
                  ({formatProfit(stats.totalProfit)})
                  <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {stats.totalTransactions} giao dịch
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Lợi nhuận trung bình</p>
                <p className="text-2xl font-bold text-white flex items-center space-x-2">
                  {formatProfit(stats.averageProfitDivine, true)}
                  <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-6 h-6" />
                </p>
                <p className="text-sm text-slate-400 flex items-center space-x-1">
                  ({formatProfit(stats.averageProfit)})
                  <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Trung bình/giao dịch
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Giao dịch có lãi</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.profitableTransactions}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {stats.totalTransactions > 0 ? ((stats.profitableTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% tổng số
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Giao dịch lỗ</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.lossTransactions}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {stats.totalTransactions > 0 ? ((stats.lossTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% tổng số
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Thời gian bán TB</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.averageSellingDuration.toFixed(1)}h
                </p>
              </div>
              <TimerIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {stats.transactionsWithDuration} giao dịch có thời gian
            </div>
          </div>
        </div>

        {/* Best and Worst Transactions */}
        {(stats.bestTransaction || stats.worstTransaction) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {stats.bestTransaction && (
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Giao dịch tốt nhất
                </h3>
                                 <div className="space-y-2">
                   <p className="text-white font-medium">{stats.bestTransaction.name}</p>
                   <p className="text-green-400 font-bold text-xl flex items-center space-x-2">
                     +{(stats.bestTransaction.profit / 200).toFixed(3)}
                     <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-5 h-5" />
                   </p>
                   <p className="text-slate-400 text-sm flex items-center space-x-1">
                     +{stats.bestTransaction.profit.toFixed(2)}
                     <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                     ({stats.bestTransaction.profitPercentage.toFixed(2)}%)
                   </p>
                   <p className="text-slate-400 text-sm">
                     {formatDate(stats.bestTransaction.completedDate)}
                     {stats.bestTransaction.sellingDuration && (
                       <span className="ml-2 text-blue-400">
                         • {stats.bestTransaction.sellingDuration.toFixed(1)}h
                       </span>
                     )}
                   </p>
                 </div>
              </div>
            )}

            {stats.worstTransaction && (
              <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Giao dịch tệ nhất
                </h3>
                                 <div className="space-y-2">
                   <p className="text-white font-medium">{stats.worstTransaction.name}</p>
                   <p className="text-red-400 font-bold text-xl flex items-center space-x-2">
                     {(stats.worstTransaction.profit / 200).toFixed(3)}
                     <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-5 h-5" />
                   </p>
                   <p className="text-slate-400 text-sm flex items-center space-x-1">
                     {stats.worstTransaction.profit.toFixed(2)}
                     <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-4 h-4" />
                     ({stats.worstTransaction.profitPercentage.toFixed(2)}%)
                   </p>
                   <p className="text-slate-400 text-sm">
                     {formatDate(stats.worstTransaction.completedDate)}
                     {stats.worstTransaction.sellingDuration && (
                       <span className="ml-2 text-blue-400">
                         • {stats.worstTransaction.sellingDuration.toFixed(1)}h
                       </span>
                     )}
                   </p>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">
              Danh sách giao dịch {selectedDate && `- ${formatDate(selectedDate)}`}
            </h2>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {selectedDate ? 'Không có giao dịch nào trong ngày này' : 'Chưa có giao dịch nào được hoàn thành'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                                         <th className="text-left p-4 text-slate-300 font-medium">Tên giao dịch</th>
                     <th className="text-left p-4 text-slate-300 font-medium">Mua vào</th>
                     <th className="text-left p-4 text-slate-300 font-medium">Bán ra</th>
                     <th className="text-left p-4 text-slate-300 font-medium">Lợi nhuận</th>
                     <th className="text-left p-4 text-slate-300 font-medium">Thời gian bán</th>
                     <th className="text-left p-4 text-slate-300 font-medium">Ngày hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4 text-white font-medium">{transaction.name}</td>
                      <td className="p-4 text-slate-300">
                        {transaction.buyQuantity} × {transaction.buyPrice} {transaction.buyPriceCurrency}
                      </td>
                      <td className="p-4 text-slate-300">
                        {transaction.sellQuantity} × {transaction.sellPrice} {transaction.sellPriceCurrency}
                      </td>
                                             <td className="p-4">
                         <div className="flex items-center space-x-2">
                           <span className="font-medium text-yellow-400">
                             {(transaction.profit / 200).toFixed(3)}
                           </span>
                           <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-4 h-4" />
                         </div>
                         <div className="text-sm text-slate-400 flex items-center space-x-1">
                           {formatProfit(transaction.profit)}
                           <img src={CURRENCY_IMAGES.chaos} alt="Chaos Orb" className="w-3 h-3" />
                           ({transaction.profitPercentage.toFixed(2)}%)
                         </div>
                       </td>
                       <td className="p-4 text-slate-400 text-sm">
                         {transaction.sellingDuration ? `${transaction.sellingDuration.toFixed(1)}h` : 'N/A'}
                       </td>
                       <td className="p-4 text-slate-400 text-sm">
                         {new Date(transaction.completedAt).toLocaleString('vi-VN')}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 