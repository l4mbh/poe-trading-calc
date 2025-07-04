# Deployment Guide - POE Trading Calculator

## Deploy lên Vercel

### 1. Chuẩn bị

Đảm bảo bạn đã có:
- Account Vercel (https://vercel.com)
- Code đã push lên GitHub repository

### 2. Deploy qua Vercel Dashboard

1. Đăng nhập vào Vercel Dashboard
2. Click "New Project"
3. Import GitHub repository của bạn
4. Vercel sẽ tự động detect React project
5. Kiểm tra cấu hình:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

### 4. Cấu trúc API cho Production

Project đã được cấu hình để hoạt động trên cả development và production:

- **Development**: Sử dụng Vite proxy (`/poe-ninja-api/*`)
- **Production**: Sử dụng Vercel serverless function (`/api/poe-ninja`)

### 5. Serverless Function

File `api/poe-ninja.js` sẽ handle API calls đến POE.ninja:
- Giải quyết CORS issues
- Caching (5 phút)
- Error handling

### 6. Environment Variables (Optional)

Nếu cần thiết, có thể thêm environment variables trong Vercel Dashboard:
- Vào Project Settings > Environment Variables
- Thêm các biến môi trường cần thiết

### 7. Custom Domain (Optional)

1. Vào Project Settings > Domains
2. Thêm custom domain của bạn
3. Cấu hình DNS records

### 8. Kiểm tra sau khi Deploy

- [ ] Website load thành công
- [ ] API calls hoạt động (test với API ON)
- [ ] League selection working
- [ ] Exchange rate update working
- [ ] Toast notifications hiển thị đúng

### 9. Troubleshooting

**API không hoạt động:**
- Kiểm tra Vercel Functions logs
- Verify `/api/poe-ninja` endpoint accessible
- Test với các league khác nhau

**Build failed:**
- Kiểm tra dependencies trong package.json
- Verify TypeScript errors
- Check Vercel build logs

**CORS errors:**
- Serverless function đã handle CORS headers
- Nếu vẫn lỗi, kiểm tra domain whitelist

### 10. Production URL Example

Sau khi deploy thành công, website sẽ có URL dạng:
- `https://your-project-name.vercel.app`
- Hoặc custom domain nếu đã cấu hình

### 11. Automatic Deployments

Vercel sẽ tự động redeploy khi:
- Push code mới lên main branch
- Merge pull request
- Manual deploy từ dashboard 