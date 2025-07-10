// UserModel.ts
// Định nghĩa kiểu dữ liệu user lưu trong Firestore

export interface UserModel {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string; // ISO string
  allowShare: boolean; // Cho phép chia sẻ thống kê
  // Có thể mở rộng thêm các trường khác nếu cần
} 