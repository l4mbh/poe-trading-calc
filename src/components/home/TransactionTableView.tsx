import React from "react";
import { Trash2 } from "lucide-react";
import { Transaction, TransactionGroup } from "../../types";
import ChaosOrbImg from "../../assets/images/Chaos_Orb.png";

interface TransactionTableViewProps {
  transactions: Transaction[];
  expandedRowId: string | null;
  setExpandedRowId: (id: string | null) => void;
  updateTransaction: (id: string, field: string, value: any) => void;
  removeTransaction: (id: string) => void;
  calculateProfit: (transaction: Transaction) => any;
  getPriceInChaos: (price: number, currency: "chaos" | "divine") => number;
  groups: TransactionGroup[];
}

const TransactionTableView: React.FC<TransactionTableViewProps> = ({
  transactions,
  expandedRowId,
  setExpandedRowId,
  updateTransaction,
  removeTransaction,
  calculateProfit,
  getPriceInChaos,
  groups,
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-slate-800/80 rounded-lg border border-slate-700">
        <thead>
          <tr className="text-slate-300 text-sm">
            <th className="px-4 py-2 text-left">Tên giao dịch</th>
            <th className="px-4 py-2 text-center">Mua vào</th>
            <th className="px-4 py-2 text-center">Bán ra</th>
            <th className="px-4 py-2 text-center">Lợi nhuận</th>
            <th className="px-4 py-2 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const buyTotal = transaction.buyQuantity * getPriceInChaos(transaction.buyPrice, transaction.buyPriceCurrency);
            const sellTotal = transaction.sellQuantity * getPriceInChaos(transaction.sellPrice, transaction.sellPriceCurrency);
            const { profit } = calculateProfit(transaction);
            const isExpanded = expandedRowId === transaction.id;
            return (
              <React.Fragment key={transaction.id}>
                <tr
                  className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-700/40' : ''}`}
                  onClick={() => setExpandedRowId(isExpanded ? null : transaction.id)}
                >
                  <td className="px-4 py-2 font-medium text-slate-200">{transaction.name}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="inline-block rotate-90">↓</span>
                        {transaction.buyQuantity}
                      </span>
                      <span className="text-xs text-slate-400">
                        Tổng: {buyTotal.toFixed(2)}{' '}
                        <img src={ChaosOrbImg} alt="chaos" className="inline w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="inline-block -rotate-90">↑</span>
                        {transaction.sellQuantity}
                      </span>
                      <span className="text-xs text-slate-400">
                        Tổng: {sellTotal.toFixed(2)}{' '}
                        <img src={ChaosOrbImg} alt="chaos" className="inline w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profit.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="p-2 rounded hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors"
                      onClick={e => { e.stopPropagation(); removeTransaction(transaction.id); }}
                      title="Xóa giao dịch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-slate-800/80 border-b border-slate-700">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Tên giao dịch</label>
                          <input
                            type="text"
                            value={transaction.name}
                            onChange={e => updateTransaction(transaction.id, 'name', e.target.value)}
                            className="w-full bg-slate-700 text-white rounded px-2 py-1 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-700/40 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs text-slate-400">Mua vào</label>
                              <button
                                className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-200 hover:bg-yellow-500 hover:text-slate-900 transition-colors"
                                onClick={() => updateTransaction(transaction.id, 'buyPriceCurrency', transaction.buyPriceCurrency === 'chaos' ? 'divine' : 'chaos')}
                              >
                                {transaction.buyPriceCurrency === 'chaos' ? 'Chaos' : 'Divine'}
                              </button>
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">Số lượng</label>
                                <input
                                  type="number"
                                  value={transaction.buyQuantity}
                                  onChange={e => updateTransaction(transaction.id, 'buyQuantity', Number(e.target.value))}
                                  className="w-full bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">Giá</label>
                                <input
                                  type="number"
                                  value={transaction.buyPrice}
                                  onChange={e => updateTransaction(transaction.id, 'buyPrice', Number(e.target.value))}
                                  className="w-full bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="bg-slate-700/40 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs text-slate-400">Bán ra</label>
                              <button
                                className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-200 hover:bg-yellow-500 hover:text-slate-900 transition-colors"
                                onClick={() => updateTransaction(transaction.id, 'sellPriceCurrency', transaction.sellPriceCurrency === 'chaos' ? 'divine' : 'chaos')}
                              >
                                {transaction.sellPriceCurrency === 'chaos' ? 'Chaos' : 'Divine'}
                              </button>
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">Số lượng</label>
                                <input
                                  type="number"
                                  value={transaction.sellQuantity}
                                  onChange={e => updateTransaction(transaction.id, 'sellQuantity', Number(e.target.value))}
                                  className="w-full bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">Giá</label>
                                <input
                                  type="number"
                                  value={transaction.sellPrice}
                                  onChange={e => updateTransaction(transaction.id, 'sellPrice', Number(e.target.value))}
                                  className="w-full bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <button
                            className="px-4 py-2 rounded bg-yellow-500 text-slate-900 font-medium hover:bg-yellow-400 transition-colors"
                            onClick={() => setExpandedRowId(null)}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTableView; 