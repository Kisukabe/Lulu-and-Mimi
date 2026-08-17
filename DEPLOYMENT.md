# 🚀 Hướng Dẫn Deploy Lulu & Mimi Lên Render & Vercel (0 VNĐ/tháng)

Code đã được cấu hình tối ưu để người dùng bất kỳ có thể sử dụng web app với **Google Gemini API Key của chính họ** (lưu trên máy cá nhân của người dùng) mà **không làm tốn quota của bạn**.

---

## 🗺️ Kiến Trúc Deployment

```text
               [ CLIENT (Điện thoại / Laptop) ]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
   [ VERCEL (Static Frontend) ]    [ RENDER (Backend API) ]
   - React 19 + Vite + Tailwind    - Express + Cheerio Scraper
   - Lưu API Key trong client      - Cambridge & Free Dictionary
   - Auto-deploy khi git push      - Dùng API key do user truyền lên
```

---

## 📦 1. Triển Khai Backend Lên Render (3 phút)

1. Đăng nhập [Render.com](https://render.com/) bằng GitHub.
2. Nhấn **"New +"** ➔ **"Web Service"**.
3. Chọn repository `Kisukabe/Lulu-and-Mimi` ➔ Nhấn **"Connect"**.
4. Cấu hình thông tin dịch vụ:
   - **Name**: `lulu-mimi-backend`
   - **Region**: `Singapore (Southeast Asia)` (tốc độ tốt nhất cho Việt Nam)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:backend`
   - **Start Command**: `npm run start:backend`
   - **Instance Type**: `Free`
5. Thêm các biến môi trường (**Environment Variables**):
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   *(Mục `GEMINI_API_KEY` có thể để trống vì người dùng tự nhập key của họ)*
6. Nhấn **"Create Web Service"**.
7. Chờ Render build hoàn tất (status chuyển sang **Live**) ➔ **Copy URL Backend** (ví dụ: `https://lulu-mimi-backend.onrender.com`).

---

## 🌐 2. Triển Khai Frontend Lên Vercel (2 phút)

1. Đăng nhập [Vercel.com](https://vercel.com/) bằng GitHub.
2. Nhấn **"Add New..."** ➔ **"Project"**.
3. Tìm chọn repository `Kisukabe/Lulu-and-Mimi` ➔ Nhấn **"Import"**.
4. Cấu hình Project:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `dist`
5. Thêm biến môi trường (**Environment Variables**):
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Dán URL backend Render của bạn (VD: `https://lulu-mimi-backend.onrender.com` - *không có dấu `/` ở cuối*)
6. Nhấn **"Deploy"** ➔ Hoàn tất trong ~30 giây!
7. Vercel sẽ cung cấp đường link web công khai (ví dụ: `https://lulu-and-mimi.vercel.app`).

---

## 🔑 3. Cách Người Dùng Sử Dụng Trợ Lý AI

- Mọi người dùng khi vào trang web đều có thể:
  1. **Tra từ điển**: Sử dụng ngay lập tức mà không cần tài khoản hay key.
  2. **Học Flashcard, Trắc nghiệm, Luyện tập**: Dữ liệu lưu trong trình duyệt của người dùng.
  3. **Trợ lý AI**: Nhấn biểu tượng 🔑 trên thanh Header ➔ Nhập Gemini API Key miễn phí (lấy tại [Google AI Studio](https://aistudio.google.com/apikey)) ➔ Key được lưu an toàn trong trình duyệt của họ.
