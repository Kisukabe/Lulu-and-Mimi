# 🚀 Hướng Dẫn Deploy Lulu & Mimi Lên Vercel & Render (0 VNĐ/tháng)

Tài liệu này hướng dẫn chi tiết cách triển khai **Lulu & Mimi** lên Cloud để bạn có thể sử dụng bất cứ lúc nào từ điện thoại, iPad hoặc máy tính mà **không cần chạy localhost hay build lại trên máy cá nhân**:
1. **Frontend (Giao diện người dùng)**: Deploy lên **Vercel** (Global Edge CDN, tốc độ load < 0.5s, miễn phí 100%).
2. **Backend (API & Scraper & AI)**: Deploy lên **Render** qua **Docker container** (đóng gói sẵn, khởi chạy tự động, miễn phí 100%).

---

## 🗺️ Kiến Trúc Deployment

```text
               [ CLIENT (Điện thoại / Laptop) ]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
   [ VERCEL (Static Frontend) ]    [ RENDER (Backend API) ]
   - React 19 + Tailwind v4        - Express + Cheerio
   - Auto-deploy khi git push      - Cambridge Scraper & Free Dict
   - Miễn phí vĩnh viễn            - Tự động pull Docker từ GHCR
```

---

## 📦 1. Triển Khai Frontend Lên Vercel (2 phút)

### Cách 1: Kết Nối Trực Tiếp Trên Vercel Dashboard (Khuyên Dùng)
1. Đăng nhập [Vercel.com](https://vercel.com/) (bằng tài khoản GitHub).
2. Nhấn **"Add New..."** ➔ **"Project"**.
3. Chọn repository `Kisukabe/Lulu-and-Mimi` ➔ Nhấn **"Import"**.
4. Cấu hình Project:
   - **Framework Preset**: `Vite` (Vercel tự nhận diện qua file `vercel.json`).
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `dist`
5. Thêm Environment Variable:
   - `VITE_API_BASE_URL`: Điền URL Backend Render của bạn (VD: `https://lulu-mimi-backend.onrender.com`).
6. Nhấn **"Deploy"** ➔ Hoàn tất trong ~30 giây!

---

## 🐳 2. Triển Khai Backend Lên Render (3 phút)

### Cách 1: Sử Dụng Render Blueprint (render.yaml)
1. Đăng nhập [Render.com](https://render.com/).
2. Nhấn **"New +"** ➔ Chọn **"Blueprint"**.
3. Chọn repository `Kisukabe/Lulu-and-Mimi`.
4. Render sẽ tự động đọc file `render.yaml` và tạo dịch vụ `lulu-mimi-backend`.
5. Trong phần **Environment Variables**, bạn có thể thêm:
   - `GEMINI_API_KEY`: API Key từ Google AI Studio (nếu muốn kích hoạt Trợ lý AI).
6. Nhấn **"Apply"** ➔ Backend sẽ tự động chạy!

### Cách 2: Sử Dụng Web Service Docker Trực Tiếp
1. Vào Render ➔ **"New +"** ➔ **"Web Service"**.
2. Chọn **"Existing image"** ➔ Điền: `ghcr.io/kisukabe/lulu-backend:latest`.
3. Điền các biến môi trường:
   - `PORT`: `10000` (Render tự động định tuyến)
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Key của bạn)*
4. Nhấn **"Create Web Service"**.

---

## 🔄 3. Tự Động Hóa CI/CD (GitHub Actions)

Mỗi khi bạn commit code và push lên GitHub:
- **`ci.yml`**: Tự động kiểm tra TypeCheck (`tsc --noEmit`) và build thử.
- **`deploy-frontend.yml`**: Tự động deploy bản cập nhật giao diện mới nhất lên Vercel.
- **`deploy-backend-docker.yml`**: Tự động build Docker Image nhẹ nhất, push lên GitHub Container Registry (`ghcr.io`) và báo cho Render khởi động lại container mới.

Bạn hoàn toàn không cần can thiệp thủ công!

---

## 💻 4. Chạy Local Với Docker (Tùy Chọn)

Nếu bạn muốn chạy thử container Docker trên máy cá nhân:
```bash
# Khởi động toàn bộ Frontend + Backend
docker compose up --build

# Mở trình duyệt:
# Frontend: http://localhost:8080
# Backend : http://localhost:5050
```
