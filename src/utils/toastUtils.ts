import { toast } from 'react-toastify';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

export const showWarningToast = (message: string) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

// Toast messages for specific actions
export const TOAST_MESSAGES = {
  TRANSACTION_ADDED: "Giao dịch đã được thêm thành công!",
  TRANSACTION_DELETED: "Giao dịch đã được xóa!",
  TRANSACTION_UPDATED: "Giao dịch đã được cập nhật!",
  GROUP_CREATED: "Nhóm đã được tạo thành công!",
  GROUP_DELETED: "Nhóm đã được xóa!",
  GROUP_UPDATED: "Tên nhóm đã được cập nhật!",
  DATA_EXPORTED: "Dữ liệu đã được xuất thành công!",
  DATA_IMPORTED: "Dữ liệu đã được nhập thành công!",
  DATA_CLEARED: "Tất cả dữ liệu đã được xóa!",
  EXCHANGE_RATE_UPDATED: "Tỷ giá đã được cập nhật!",
  API_RATE_LOADED: "Đã tải tỷ giá từ POE.ninja!",
  API_RATE_ERROR: "Không thể tải tỷ giá từ API",
  LEAGUE_CHANGED: "Đã chuyển league thành công!",
  FAVORITE_TOGGLED: "Đã cập nhật trạng thái yêu thích!",
  SEARCH_CLEARED: "Đã xóa bộ lọc tìm kiếm!",
} as const; 