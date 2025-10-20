# Taste Map - Frontend

Ứng dụng web hiển thị bản đồ với tính năng đăng nhập Google.

## Tính năng

- Bản đồ OpenStreetMap toàn màn hình (miễn phí, không cần API key)
- Đăng nhập bằng Google OAuth
- Giao diện responsive
- Tích hợp với backend API

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

3. Cập nhật các API keys trong file `.env`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_BACKEND_URL=https://tastemapbe.onrender.com
```

## Chạy ứng dụng

```bash
npm run dev
```

## Xây dựng cho production

```bash
npm run build
```

## Cấu trúc dự án

- `src/components/` - Các React components
- `src/config/` - Cấu hình API keys và endpoints
- `src/App.tsx` - Component chính
- `src/main.tsx` - Entry point

## API Keys cần thiết

1. **Google OAuth Client ID**: Tạo từ [Google Cloud Console](https://console.cloud.google.com/)
2. **OpenStreetMap**: Miễn phí, không cần API key