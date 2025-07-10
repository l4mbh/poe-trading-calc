# Firebase Setup Guide - Authentication Only

## Tổng quan
Hướng dẫn cài đặt Firebase Authentication cho POE Trading Calculator. Firebase Storage đã được thay thế bằng Cloudinary để tiết kiệm chi phí.

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project**
3. Đặt tên project: `poe-trading-calc`
4. Chọn **Enable Google Analytics** (tùy chọn)
5. Click **Create project**

## Bước 2: Cấu hình Authentication

### 2.1. Bật Email/Password Authentication
1. Vào **Authentication** > **Sign-in method**
2. Click **Email/Password**
3. Bật **Enable**
4. Bật **Email link (passwordless sign-in)** (tùy chọn)
5. Click **Save**

### 2.2. Cấu hình Authorized Domains
1. Vào **Authentication** > **Settings**
2. Trong **Authorized domains**, thêm:
   - `localhost` (cho development)
   - `your-domain.com` (cho production)
3. Click **Save**

## Bước 3: Lấy thông tin cấu hình

### 3.1. Web App Configuration
1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống **Your apps**
3. Click **Add app** > **Web**
4. Đặt tên: `poe-trading-calc-web`
5. Copy thông tin cấu hình

### 3.2. Thông tin cần thiết
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Bước 4: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc:

```env
# Firebase Configuration (Authentication Only)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration (for avatar uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=poe_trading_preset
```

## Bước 5: Cài đặt Dependencies

```bash
npm install firebase
```

## Bước 6: Cấu hình Security Rules

### 6.1. Authentication Rules
Firebase Authentication không cần security rules riêng, nhưng có thể cấu hình:

1. Vào **Authentication** > **Settings**
2. **User actions**:
   - **Prevent abuse**: Bật
   - **Email verification**: Tùy chọn
   - **Phone verification**: Tùy chọn

### 6.2. Rate Limiting
1. **Authentication** > **Settings** > **Advanced**
2. Cấu hình rate limits cho:
   - Sign-up attempts
   - Sign-in attempts
   - Password reset requests

## Bước 7: Testing

### 7.1. Local Development
```bash
npm run dev
```

### 7.2. Test Cases
1. **Đăng ký tài khoản mới**
2. **Đăng nhập với email/password**
3. **Đăng xuất**
4. **Reset password**
5. **Cập nhật profile**

## Bước 8: Production Deployment

### 8.1. Vercel Deployment
1. Push code lên GitHub
2. Connect với Vercel
3. Thêm environment variables trong Vercel dashboard
4. Deploy

### 8.2. Environment Variables trong Production
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Cấu trúc Authentication

### User Flow
```
1. User visits app
2. Optional: Click "Login" button
3. Redirect to /login page
4. Enter email/password
5. Firebase Authentication
6. Redirect to protected route or home
```

### Protected Routes
- `/shares` - Yêu cầu đăng nhập
- `/profile` - Yêu cầu đăng nhập
- `/` - Public
- `/statistics` - Public

### User Profile Data
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string; // Cloudinary URL
  emailVerified: boolean;
  createdAt: Date;
}
```

## Monitoring & Analytics

### 8.1. Firebase Console
- **Authentication** > **Users**: Xem danh sách users
- **Authentication** > **Sign-in method**: Theo dõi sign-in methods
- **Authentication** > **Settings** > **Usage**: Theo dõi usage

### 8.2. Error Handling
```typescript
// Common Firebase Auth Errors
const authErrors = {
  'auth/user-not-found': 'Email không tồn tại',
  'auth/wrong-password': 'Mật khẩu không đúng',
  'auth/email-already-in-use': 'Email đã được sử dụng',
  'auth/weak-password': 'Mật khẩu quá yếu',
  'auth/invalid-email': 'Email không hợp lệ'
};
```

## Migration từ Firebase Storage

### Lý do chuyển sang Cloudinary:
1. **Chi phí**: Firebase Storage có phí sau free tier
2. **Performance**: Cloudinary có CDN toàn cầu
3. **Features**: Cloudinary có nhiều tính năng image optimization
4. **Free Tier**: Cloudinary có free tier rộng rãi hơn

### Migration Steps:
1. ✅ Cài đặt Cloudinary
2. ✅ Cập nhật AvatarUpload component
3. ✅ Cập nhật AuthContext
4. ✅ Loại bỏ Firebase Storage dependencies
5. ⏳ Migrate existing avatars (nếu có)

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Kiểm tra authorized domains
2. **Environment Variables**: Đảm bảo VITE_ prefix
3. **Build Errors**: Kiểm tra import statements
4. **Authentication Failures**: Kiểm tra Firebase config

### Debug Mode:
```typescript
// Enable debug mode
localStorage.setItem('debug', 'firebase:*');
```

## Security Best Practices

1. **Environment Variables**: Không commit .env files
2. **API Keys**: Restrict API keys trong Firebase Console
3. **Domain Restrictions**: Chỉ cho phép domains cần thiết
4. **Rate Limiting**: Cấu hình rate limits
5. **Password Policies**: Enforce strong passwords 