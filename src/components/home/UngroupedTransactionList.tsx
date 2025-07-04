import React from "react";
import { Folder } from "lucide-react";
import { Transaction, TransactionGroup } from "../../types";
import { TransactionCard } from "../TransactionCard";

interface UngroupedTransactionListProps {
  groupedTransactions: { [key: string]: Transaction[] };
  groups: TransactionGroup[];
  updateTransaction: (id: string, field: string, value: any) => void;
  removeTransaction: (id: string) => void;
  toggleFavorite: (id: string) => void;
  calculateProfit: (transaction: Transaction) => any;
  chaosToDiv: (chaosAmount: number) => number;
  divToChaos: (divAmount: number) => number;
  convertPrice: (price: number, from: "chaos" | "divine", to: "chaos" | "divine") => number;
  getPriceInChaos: (price: number, currency: "chaos" | "divine") => number;
}

const UngroupedTransactionList: React.FC<UngroupedTransactionListProps> = ({
  groupedTransactions,
  groups,
  updateTransaction,
  removeTransaction,
  toggleFavorite,
  calculateProfit,
  chaosToDiv,
  divToChaos,
  convertPrice,
  getPriceInChaos,
}) => {
  if (!groupedTransactions.ungrouped || groupedTransactions.ungrouped.length === 0) return null;
  return (
    <div className="space-y-4">
      {groups.length > 0 && (
        <div className="flex items-center space-x-2 text-slate-400">
          <Folder className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Không có nhóm ({groupedTransactions.ungrouped.length})
          </h3>
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
          />
        ))}
      </div>
    </div>
  );
};

export default UngroupedTransactionList; 