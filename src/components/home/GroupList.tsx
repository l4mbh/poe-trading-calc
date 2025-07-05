import React from "react";
import { Folder, FolderOpen, Plus, Edit3, Trash2, Check, X } from "lucide-react";
import { Transaction, TransactionGroup } from "../../types";
import { TransactionCard } from "../TransactionCard";

interface GroupListProps {
  groups: TransactionGroup[];
  groupedTransactions: { [key: string]: Transaction[] };
  editingGroupId: string | null;
  editingGroupName: string;
  startEditingGroup: (group: TransactionGroup) => void;
  saveGroupEdit: () => void;
  cancelGroupEdit: () => void;
  setEditingGroupName: (name: string) => void;
  toggleGroupExpansion: (groupId: string) => void;
  addTransaction: (groupId: string | null) => void;
  deleteGroup: (groupId: string) => void;
  updateTransaction: (id: string, field: string, value: any) => void;
  removeTransaction: (id: string) => void;
  toggleFavorite: (id: string) => void;
  calculateProfit: (transaction: Transaction) => any;
  chaosToDiv: (chaosAmount: number) => number;
  divToChaos: (divAmount: number) => number;
  convertPrice: (price: number, from: "chaos" | "divine", to: "chaos" | "divine") => number;
  getPriceInChaos: (price: number, currency: "chaos" | "divine") => number;
  onResetTransaction: (id: string) => void;
  onCompleteTransaction: (transaction: Transaction, profit: number, profitPercentage: number) => void;
  onStartSelling: (transaction: Transaction) => void;
  onUpdateFields: (id: string, fields: Partial<Transaction>) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  groupedTransactions,
  editingGroupId,
  editingGroupName,
  startEditingGroup,
  saveGroupEdit,
  cancelGroupEdit,
  setEditingGroupName,
  toggleGroupExpansion,
  addTransaction,
  deleteGroup,
  updateTransaction,
  removeTransaction,
  toggleFavorite,
  calculateProfit,
  chaosToDiv,
  divToChaos,
  convertPrice,
  getPriceInChaos,
  onResetTransaction,
  onCompleteTransaction,
  onStartSelling,
  onUpdateFields,
}) => {
  return (
    <>
      {groups.map((group) => {
        const groupTransactions = groupedTransactions[group.id] || [];
        if (groupTransactions.length === 0) return null;
        return (
          <div key={group.id} className="space-y-4">
            <div className={`rounded-lg p-4 border ${group.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button onClick={() => toggleGroupExpansion(group.id)} className="text-current hover:opacity-70 transition-opacity">
                    {group.isExpanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                  </button>
                  {editingGroupId === group.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={e => setEditingGroupName(e.target.value)}
                        onKeyPress={e => e.key === "Enter" && saveGroupEdit()}
                        className="bg-slate-700/50 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
                        autoFocus
                      />
                      <button onClick={saveGroupEdit} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                      <button onClick={cancelGroupEdit} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <span className="text-sm opacity-70">({groupTransactions.length})</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => addTransaction(group.id)} className="text-current hover:opacity-70 transition-opacity" title="Thêm giao dịch vào nhóm"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => startEditingGroup(group)} className="text-current hover:opacity-70 transition-opacity" title="Sửa tên nhóm"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteGroup(group.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Xóa nhóm"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            {group.isExpanded && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ml-4">
                {groupTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onUpdate={updateTransaction}
                    onUpdateFields={onUpdateFields}
                    onRemove={removeTransaction}
                    onToggleFavorite={toggleFavorite}
                    calculateProfit={calculateProfit}
                    chaosToDiv={chaosToDiv}
                    divToChaos={divToChaos}
                    convertPrice={convertPrice}
                    getPriceInChaos={getPriceInChaos}
                    groups={groups}
                    onResetTransaction={onResetTransaction}
                    onCompleteTransaction={onCompleteTransaction}
                    onStartSelling={onStartSelling}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default GroupList; 