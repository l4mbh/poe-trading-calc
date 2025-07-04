import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionFooterProps {
  transaction: Transaction;
  profit: number;
  profitPercentage: number;
  onCompleteTransaction: (transaction: Transaction, profit: number, profitPercentage: number) => void;
  onStartSelling: (transaction: Transaction) => void;
  isProfit: boolean;
}

export function TransactionFooter({ 
  transaction, 
  profit, 
  profitPercentage, 
  onCompleteTransaction,
  onStartSelling,
  isProfit 
}: TransactionFooterProps) {
  const handleCompleteTransaction = () => {
    onCompleteTransaction(transaction, profit, profitPercentage);
  };

  const handleStartSelling = () => {
    onStartSelling(transaction);
  };

  const getStatusText = () => {
    if (transaction.isSelling) {
      const startTime = new Date(transaction.sellingStartedAt!);
      const now = new Date();
      const diffHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return `Đang treo bán (${diffHours.toFixed(1)}h)`;
    }
    return "Đang giao dịch";
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-600/50">
      <div className="flex items-center justify-end space-x-2">
        {!transaction.isSelling && (
          <button
            onClick={handleStartSelling}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50"
            title="Đánh dấu đang treo bán"
          >
            <Clock className="w-4 h-4" />
            <span>Treo bán</span>
          </button>
        )}
        <button
          onClick={handleCompleteTransaction}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isProfit 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50' 
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50'
          }`}
          title="Đánh dấu giao dịch đã hoàn thành"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Đã bán</span>
        </button>
      </div>
    </div>
  );
} 