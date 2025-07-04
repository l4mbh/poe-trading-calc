export interface Transaction {
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

export interface TransactionGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
}

export interface ExportData {
  transactions: Transaction[];
  groups: TransactionGroup[];
  divineToChaoRate: number;
  exportDate: string;
  version: string;
}

export interface TransactionCardProps {
  transaction: Transaction;
  onUpdate: (id: string, field: keyof Transaction, value: string | number | boolean | null) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  calculateProfit: (transaction: Transaction) => { profit: number; profitPercentage: number };
  chaosToDiv: (chaosAmount: number) => number;
  divToChaos: (divAmount: number) => number;
  convertPrice: (price: number, fromCurrency: 'chaos' | 'divine', toCurrency: 'chaos' | 'divine') => number;
  getPriceInChaos: (price: number, currency: 'chaos' | 'divine') => number;
  groups: TransactionGroup[];
}

export interface LegacyTransaction {
  id: string;
  name: string;
  buyQuantity: number;
  buyPrice: number;
  sellQuantity: number;
  sellPrice: number;
  isFavorite: boolean;
  groupId: string | null;
  buyPriceCurrency?: 'chaos' | 'divine';
  sellPriceCurrency?: 'chaos' | 'divine';
} 