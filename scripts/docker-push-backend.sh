#!/bin/bash
# =============================================================
# SCRIPT: Build Docker Backend & Push lên GHCR
# Sử dụng: ./scripts/docker-push-backend.sh [version_tag]
# Ví dụ:   ./scripts/docker-push-backend.sh v1.0.0
#          ./scripts/docker-push-backend.sh          (chỉ push :latest)
# =============================================================

set -e  # Dừng ngay nếu có lỗi

GITHUB_USERNAME="kisukabe"
IMAGE_NAME="ghcr.io/${GITHUB_USERNAME}/lulu-backend"
VERSION_TAG="${1:-}"  # Tham số tùy chọn từ dòng lệnh
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")

echo ""
echo "🐳 =============================================="
echo "   Lulu & Mimi Backend — Docker Build & Push    "
echo "=============================================="
echo ""
echo "📦 Image     : ${IMAGE_NAME}"
echo "📌 Git SHA   : ${GIT_SHA}"
echo "🏷️  Version   : ${VERSION_TAG:-'(không có — chỉ dùng :latest và :sha-)'}"
echo ""

# Kiểm tra Docker Desktop đang chạy
if ! docker info &>/dev/null; then
  echo "❌ Docker Desktop chưa được khởi động!"
  echo "   Hãy mở Docker Desktop trên máy và đợi dịch vụ sẵn sàng."
  exit 1
fi

# Kiểm tra đăng nhập GHCR
echo "🔑 Đang kiểm tra xác thực ghcr.io..."
if ! grep -q "ghcr.io" ~/.docker/config.json 2>/dev/null; then
  echo "   Chưa tìm thấy thông tin đăng nhập GHCR trong ~/.docker/config.json."
  echo "   Vui lòng nhập Personal Access Token (PAT) để đăng nhập:"
  docker login ghcr.io -u "${GITHUB_USERNAME}"
else
  echo "✅ Đã đăng nhập GHCR (ghcr.io) thành công."
fi

# --- BƯỚC 1: Build Docker Image ---
echo ""
echo "📦 [1/3] Đang build Docker Image..."
echo ""

TAGS="-t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:sha-${GIT_SHA}"
if [ -n "${VERSION_TAG}" ]; then
  TAGS="${TAGS} -t ${IMAGE_NAME}:${VERSION_TAG}"
fi

DOCKER_BUILDKIT=1 docker build \
  -f Dockerfile.backend \
  ${TAGS} \
  --label "org.opencontainers.image.revision=${GIT_SHA}" \
  --label "org.opencontainers.image.created=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  .

echo ""
echo "✅ Build thành công!"

# --- BƯỚC 2: Kiểm tra nhanh Container ---
echo ""
echo "🧪 [2/3] Kiểm tra nhanh Container..."
CONTAINER_ID=$(docker run -d \
  -p 15050:5050 \
  -e PORT=5050 \
  -e NODE_ENV=production \
  -e ALLOWED_ORIGINS="*" \
  "${IMAGE_NAME}:latest")

sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:15050/api/health || echo "000")
docker stop "${CONTAINER_ID}" &>/dev/null

if [ "${HTTP_STATUS}" = "200" ]; then
  echo "✅ Health check passed (HTTP ${HTTP_STATUS}). Container hoạt động bình thường!"
else
  echo "⚠️  Health check trả về HTTP ${HTTP_STATUS}."
fi

# --- BƯỚC 3: Push lên GHCR ---
echo ""
echo "🚀 [3/3] Đang push lên GitHub Container Registry..."
echo ""

docker push "${IMAGE_NAME}:latest"
docker push "${IMAGE_NAME}:sha-${GIT_SHA}"

if [ -n "${VERSION_TAG}" ]; then
  docker push "${IMAGE_NAME}:${VERSION_TAG}"
  echo "✅ Đã push tag version: ${VERSION_TAG}"
fi

echo ""
echo "🎉 =============================================="
echo "   Hoàn tất! Image đã lên GHCR."
echo "=============================================="
echo ""
echo "📌 Các image đã push:"
echo "   • ${IMAGE_NAME}:latest"
echo "   • ${IMAGE_NAME}:sha-${GIT_SHA}"
[ -n "${VERSION_TAG}" ] && echo "   • ${IMAGE_NAME}:${VERSION_TAG}"
echo ""
