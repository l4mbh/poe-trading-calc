import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Star, ArrowUpDown } from 'lucide-react';
import { TransactionCardProps } from '../types';
import { CURRENCY_IMAGES } from '../utils/constants';
import { chaosToDiv, divToChaos, convertPrice, getPriceInChaos } from '../utils/currencyUtils';
import { showSuccessToast, TOAST_MESSAGES } from '../utils/toastUtils';

export function TransactionCard({ 
  transaction, 
  onUpdate, 
  onRemove, 
  onToggleFavorite, 
  calculateProfit, 
  chaosToDiv: chaosToDivFn,
  divToChaos: divToChaosFn,
  convertPrice: convertPriceFn,
  getPriceInChaos: getPriceInChaosFn,
  groups
}: TransactionCardProps) {
  const { profit, profitPercentage } = calculateProfit(transaction);
  const isProfit = profit >= 0;
  const [profitDisplayCurrency, setProfitDisplayCurrency] = useState<'chaos' | 'divine'>('chaos');

  const toggleBuyPriceCurrency = () => {
    const newCurrency = transaction.buyPriceCurrency === 'chaos' ? 'divine' : 'chaos';
    const convertedPrice = convertPriceFn(transaction.buyPrice, transaction.buyPriceCurrency, newCurrency);
    onUpdate(transaction.id, 'buyPrice', convertedPrice);
    onUpdate(transaction.id, 'buyPriceCurrency', newCurrency);
    showSuccessToast(`Đã chuyển đổi đơn vị giá mua sang ${newCurrency === 'chaos' ? 'Chaos Orb' : 'Divine Orb'}`);
  };

  const toggleSellPriceCurrency = () => {
    const newCurrency = transaction.sellPriceCurrency === 'chaos' ? 'divine' : 'chaos';
    const convertedPrice = convertPriceFn(transaction.sellPrice, transaction.sellPriceCurrency, newCurrency);
    onUpdate(transaction.id, 'sellPrice', convertedPrice);
    onUpdate(transaction.id, 'sellPriceCurrency', newCurrency);
    showSuccessToast(`Đã chuyển đổi đơn vị giá bán sang ${newCurrency === 'chaos' ? 'Chaos Orb' : 'Divine Orb'}`);
  };

  const getBuyTotalInChaos = () => {
    return transaction.buyQuantity * getPriceInChaosFn(transaction.buyPrice, transaction.buyPriceCurrency);
  };

  const getSellTotalInChaos = () => {
    return transaction.sellQuantity * getPriceInChaosFn(transaction.sellPrice, transaction.sellPriceCurrency);
  };

  const getProfitInDisplayCurrency = () => {
    return profitDisplayCurrency === 'chaos' ? profit : chaosToDivFn(profit);
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
                <span>≈ {transaction.buyPriceCurrency === 'chaos' ? chaosToDivFn(transaction.buyPrice).toFixed(4) : divToChaosFn(transaction.buyPrice).toFixed(2)}</span>
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
              <span>(≈ {chaosToDivFn(getBuyTotalInChaos()).toFixed(3)}</span>
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
                <span>≈ {transaction.sellPriceCurrency === 'chaos' ? chaosToDivFn(transaction.sellPrice).toFixed(4) : divToChaosFn(transaction.sellPrice).toFixed(2)}</span>
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
              <span>(≈ {chaosToDivFn(getSellTotalInChaos()).toFixed(3)}</span>
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
          <span>≈ {profitDisplayCurrency === 'chaos' ? chaosToDivFn(profit).toFixed(3) : divToChaosFn(chaosToDivFn(profit)).toFixed(2)}</span>
          <img src={CURRENCY_IMAGES[profitDisplayCurrency === 'chaos' ? 'divine' : 'chaos']} alt={`${profitDisplayCurrency === 'chaos' ? 'divine' : 'chaos'} Orb`} className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
} 