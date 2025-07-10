// TransactionModel.ts
// Định nghĩa kiểu dữ liệu giao dịch

export interface TransactionModel {
  id: string;
  userId: string;
  amount: number;
  type: 'buy' | 'sell';
  createdAt: string; // ISO string
  // Thêm các trường khác nếu cần
} 