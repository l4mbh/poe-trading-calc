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
  isSelected?: boolean;
  isSelling?: boolean;
  sellingStartedAt?: string; // ISO date string when selling started
}

export interface CompletedTransaction {
  id: string;
  name: string;
  buyQuantity: number;
  buyPrice: number;
  sellQuantity: number;
  sellPrice: number;
  buyPriceCurrency: 'chaos' | 'divine';
  sellPriceCurrency: 'chaos' | 'divine';
  groupId: string | null;
  profit: number;
  profitPercentage: number;
  completedAt: string; // ISO date string
  completedDate: string; // YYYY-MM-DD format for grouping
  sellingStartedAt?: string; // ISO date string when selling started
  sellingDuration?: number; // Duration in hours
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
  profitFilter?: 'all' | 'selected' | string;
  totalProfitCurrency?: 'chaos' | 'divine';
  selectedLeague?: string;
  enableApiCalls?: boolean;
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
  onResetTransaction: (id: string) => void;
  onCompleteTransaction: (transaction: Transaction, profit: number, profitPercentage: number) => void;
  onStartSelling: (transaction: Transaction) => void;
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