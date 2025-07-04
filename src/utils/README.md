# Toast Notifications Guide

## Tổng quan
Dự án sử dụng React Toastify để hiển thị các thông báo toast. Các thông báo được tùy chỉnh để phù hợp với theme của ứng dụng.

## Cách sử dụng

### Import các functions
```typescript
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast,
  TOAST_MESSAGES 
} from '../utils/toastUtils';
```

### Các loại toast có sẵn

1. **Success Toast** - Thông báo thành công
```typescript
showSuccessToast('Thao tác thành công!');
```

2. **Error Toast** - Thông báo lỗi
```typescript
showErrorToast('Có lỗi xảy ra!');
```

3. **Warning Toast** - Thông báo cảnh báo
```typescript
showWarningToast('Cảnh báo!');
```

4. **Info Toast** - Thông báo thông tin
```typescript
showInfoToast('Thông tin mới!');
```

### Sử dụng các message có sẵn
```typescript
// Thêm giao dịch
showSuccessToast(TOAST_MESSAGES.TRANSACTION_ADDED);

// Xóa giao dịch
showSuccessToast(TOAST_MESSAGES.TRANSACTION_DELETED);

// Tạo nhóm
showSuccessToast(TOAST_MESSAGES.GROUP_CREATED);

// Xuất dữ liệu
showSuccessToast(TOAST_MESSAGES.DATA_EXPORTED);

// Nhập dữ liệu
showSuccessToast(TOAST_MESSAGES.DATA_IMPORTED);
```

### Tùy chỉnh cấu hình
Các toast được cấu hình với:
- Vị trí: top-right
- Theme: dark
- Auto close: 3-5 giây tùy loại
- Có thể đóng bằng click
- Có thể kéo thả
- Tạm dừng khi hover

### Styling
Toast notifications được styling để phù hợp với theme của ứng dụng:
- Background: slate-800
- Border: slate-600
- Text: slate-100
- Progress bar: gradient yellow

## Ví dụ sử dụng trong component

```typescript
import { showSuccessToast, showErrorToast, TOAST_MESSAGES } from '../utils/toastUtils';

const handleSave = async () => {
  try {
    await saveData();
    showSuccessToast(TOAST_MESSAGES.DATA_SAVED);
  } catch (error) {
    showErrorToast('Không thể lưu dữ liệu!');
  }
};
``` 