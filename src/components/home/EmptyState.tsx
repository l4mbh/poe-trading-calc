import React from "react";
import { Coins, Plus } from "lucide-react";

interface EmptyStateProps {
  addTransaction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ addTransaction }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Coins className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-300 mb-2">Chưa có giao dịch nào</h3>
    <p className="text-slate-400 mb-4">Bắt đầu bằng cách thêm giao dịch đầu tiên của bạn</p>
    <button
      onClick={addTransaction}
      className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
    >
      <Plus className="w-5 h-5" />
      <span>Thêm giao dịch</span>
    </button>
  </div>
);

export default EmptyState; 