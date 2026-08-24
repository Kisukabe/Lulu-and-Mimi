import { SRSCardData } from '../types';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        THUẬT TOÁN SPACED REPETITION SM-2 (PHIÊN BẢN TỐI ƯU)   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Dựa trên nghiên cứu gốc của Piotr Wozniak (SuperMemo SM-2)    ║
 * ║  và cải tiến theo mô hình của Anki.                             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  THANG ĐÁNH GIÁ (tương thích ngược với cũ 1 | 3 | 5):          ║
 * ║  1 = Again  — Quên hoàn toàn, reset về 1 ngày                  ║
 * ║  2 = Hard   — Nhớ khó, rút ngắn chu kỳ 20%                     ║
 * ║  3 = Good   — Nhớ bình thường, tăng chu kỳ theo EF             ║
 * ║  4 / 5 = Easy — Rất dễ, tăng chu kỳ nhanh + tăng EF           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  CẢI TIẾN SO VỚI PHIÊN BẢN CŨ:                                 ║
 * ║  ✅ Công thức EF chuẩn SM-2 gốc Wozniak                        ║
 * ║  ✅ Hard không reset repetitions, chỉ giảm EF + rút ngắn       ║
 * ║  ✅ EF tối thiểu 1.3, tối đa 3.5                               ║
 * ║  ✅ Interval tối đa 365 ngày                                    ║
 * ║  ✅ Jitter ±8% để tránh nhiều thẻ đến hạn cùng lúc             ║
 * ║  ✅ memoryLevel tính theo repetitions + EF (chính xác hơn)      ║
 * ║  ✅ previewNextInterval() để hiển thị preview trong UI          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
export function calculateNextSRS(
  cardId: string,
  existingData: SRSCardData | undefined,
  rating: 1 | 2 | 3 | 4 | 5
): SRSCardData {
  const currentRepetitions = existingData?.repetitions ?? 0;
  const currentInterval    = existingData?.interval    ?? 0;
  let   easeFactor         = existingData?.easeFactor  ?? 2.5;

  // ── Ánh xạ rating về thang q (0-5) theo chuẩn SuperMemo ──────────
  // q=0: Again, q=2: Hard, q=3: Good, q=5: Easy
  const qMap: Record<number, number> = { 1: 0, 2: 2, 3: 3, 4: 5, 5: 5 };
  const q = qMap[rating] ?? 3;

  // ── Công thức EF chuẩn SM-2 của Wozniak ──────────────────────────
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.min(3.5, Math.max(1.3, easeFactor + efDelta));

  let newRepetitions = currentRepetitions;
  let newInterval    = 1;

  if (rating === 1) {
    // ── AGAIN: Quên hoàn toàn → reset về đầu ─────────────────────
    newRepetitions = 0;
    newInterval    = 1;

  } else if (rating === 2) {
    // ── HARD: Nhớ khó → không reset, rút ngắn 20% ────────────────
    newRepetitions = currentRepetitions; // không tăng chuỗi
    newInterval    = currentInterval <= 1 ? 1 : Math.max(1, Math.round(currentInterval * 0.8));

  } else {
    // ── GOOD (3) hoặc EASY (4/5) → tăng chu kỳ SM-2 ─────────────
    newRepetitions = currentRepetitions + 1;

    if (newRepetitions === 1) {
      newInterval = rating >= 4 ? 3 : 1;
    } else if (newRepetitions === 2) {
      newInterval = rating >= 4 ? 6 : 3;
    } else {
      // SM-2 chuẩn: I(n) = I(n-1) × EF
      const base  = Math.round(currentInterval * easeFactor);
      newInterval = rating >= 4 ? Math.round(base * 1.3) : base;
    }

    // Clamp tối đa 365 ngày
    newInterval = Math.min(365, Math.max(1, newInterval));
  }

  // ── Jitter nhỏ ±8% để tránh "bunching" thẻ đến hạn cùng ngày ────
  if (newInterval > 2) {
    const jitter = Math.round(newInterval * (Math.random() * 0.16 - 0.08));
    newInterval  = Math.max(1, newInterval + jitter);
  }

  const memoryLevel = computeMemoryLevel(newRepetitions, easeFactor, rating);

  const now      = new Date();
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    cardId,
    repetitions:      newRepetitions,
    interval:         newInterval,
    easeFactor:       Math.round(easeFactor * 1000) / 1000,
    nextReviewDate:   nextDate.toISOString(),
    lastReviewedDate: now.toISOString(),
    memoryLevel,
  };
}

/**
 * Tính memoryLevel (1-5) dựa trên repetitions + EF — chính xác hơn cũ.
 */
function computeMemoryLevel(
  repetitions: number,
  easeFactor:  number,
  rating:      number
): 1 | 2 | 3 | 4 | 5 {
  if (rating === 1 || repetitions === 0) return 1;
  if (repetitions === 1)                 return 2;
  if (repetitions <= 3) return easeFactor >= 2.2 ? 3 : 2;
  if (repetitions <= 6) return easeFactor >= 2.4 ? 4 : 3;
  return easeFactor >= 2.5 ? 5 : 4;
}

/**
 * Kiểm tra xem thẻ đã đến hạn cần ôn tập hôm nay hay chưa.
 * Thẻ chưa học (không có srsData) → luôn coi là đến hạn.
 */
export function isCardDue(srsData?: SRSCardData): boolean {
  if (!srsData?.nextReviewDate) return true;
  return Date.now() >= new Date(srsData.nextReviewDate).getTime();
}

/**
 * Định dạng thời gian đếm ngược đến lần ôn tiếp theo.
 */
export function formatSRSCountdown(nextReviewDate?: string): string {
  if (!nextReviewDate) return 'Chưa học';

  const diffMs    = new Date(nextReviewDate).getTime() - Date.now();
  const diffMins  = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMs / 3_600_000);
  const diffDays  = Math.round(diffMs / 86_400_000);

  if (diffMs    <= 0)  return 'Đến hạn ôn tập ngay';
  if (diffMins  <  60) return `Sau ${diffMins} phút`;
  if (diffHours <  24) return `Sau ${diffHours} giờ`;
  if (diffDays  === 1) return 'Ngày mai';
  if (diffDays  <   7) return `Sau ${diffDays} ngày`;
  if (diffDays  <  30) return `Sau ${Math.round(diffDays / 7)} tuần`;
  if (diffDays  < 365) return `Sau ${Math.round(diffDays / 30)} tháng`;
  return `Sau ${Math.round(diffDays / 365)} năm`;
}

/**
 * Tên & badge CSS cho từng cấp độ ghi nhớ (Leitner 5 Box Model).
 */
export function getMemoryLevelName(level: 1 | 2 | 3 | 4 | 5): {
  label: string;
  badgeClass: string;
} {
  switch (level) {
    case 1: return {
      label:      'Mới Học (Level 1)',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
    };
    case 2: return {
      label:      'Nhận Biết (Level 2)',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    };
    case 3: return {
      label:      'Đang Ghi Nhớ (Level 3)',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    };
    case 4: return {
      label:      'Thành Thạo (Level 4)',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    };
    case 5: return {
      label:      'Trí Nhớ Dài Hạn ✨',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    };
  }
}

/**
 * Dự đoán khoảng cách ngày tiếp theo nếu người dùng chọn rating X.
 * Dùng để hiển thị preview trong UI ("Nếu chọn Good → Sau 6 ngày").
 * Không áp dụng jitter để kết quả preview ổn định.
 */
export function previewNextInterval(
  existingData: SRSCardData | undefined,
  rating: 1 | 2 | 3 | 4 | 5
): number {
  const currentRepetitions = existingData?.repetitions ?? 0;
  const currentInterval    = existingData?.interval    ?? 0;
  let   easeFactor         = existingData?.easeFactor  ?? 2.5;

  const qMap: Record<number, number> = { 1: 0, 2: 2, 3: 3, 4: 5, 5: 5 };
  const q = qMap[rating] ?? 3;
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.min(3.5, Math.max(1.3, easeFactor + efDelta));

  let newInterval = 1;

  if (rating === 1) {
    newInterval = 1;
  } else if (rating === 2) {
    newInterval = currentInterval <= 1 ? 1 : Math.max(1, Math.round(currentInterval * 0.8));
  } else {
    const newRepetitions = currentRepetitions + 1;
    if (newRepetitions === 1) {
      newInterval = rating >= 4 ? 3 : 1;
    } else if (newRepetitions === 2) {
      newInterval = rating >= 4 ? 6 : 3;
    } else {
      const base = Math.round(currentInterval * easeFactor);
      newInterval = rating >= 4 ? Math.round(base * 1.3) : base;
    }
    newInterval = Math.min(365, Math.max(1, newInterval));
  }

  // Không áp dụng jitter để preview ổn định
  return newInterval;
}
