import { SRSCardData, Flashcard } from '../types';

/**
 * Thuật toán SuperMemo SM-2 (Spaced Repetition System)
 * Tối ưu hóa chu kỳ lặp lại ngắt quãng theo đường cong quên lãng Ebbinghaus.
 *
 * @param existingData Dữ liệu SRS hiện tại của thẻ
 * @param rating Đánh giá của người học:
 *   1 = "Quên / Cần Ôn" (Again) -> Reset chu kỳ về 1 ngày
 *   3 = "Đã Nhớ / Tốt" (Good)  -> Tăng khoảng cách ngày theo hệ số EF
 *   5 = "Rất Dễ / Khắc Sâu" (Easy) -> Tăng nhanh khoảng cách ngày & tăng EF
 */
export function calculateNextSRS(
  cardId: string,
  existingData: SRSCardData | undefined,
  rating: 1 | 3 | 5
): SRSCardData {
  const currentRepetitions = existingData?.repetitions || 0;
  const currentInterval = existingData?.interval || 0;
  let easeFactor = existingData?.easeFactor || 2.5;

  let newRepetitions = currentRepetitions;
  let newInterval = 1;
  let memoryLevel: 1 | 2 | 3 | 4 | 5 = 1;

  if (rating === 1) {
    // Quên / Cần ôn lại -> Reset chu kỳ
    newRepetitions = 0;
    newInterval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    memoryLevel = 1;
  } else if (rating === 3) {
    // Đã nhớ / Tốt
    newRepetitions = currentRepetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
      memoryLevel = 2;
    } else if (newRepetitions === 2) {
      newInterval = 3;
      memoryLevel = 3;
    } else {
      newInterval = Math.round(currentInterval * easeFactor);
      memoryLevel = (Math.min(5, newRepetitions + 1) as 1 | 2 | 3 | 4 | 5);
    }
  } else if (rating === 5) {
    // Rất dễ / Khắc sâu
    newRepetitions = currentRepetitions + 1;
    easeFactor = Math.min(3.0, easeFactor + 0.15);

    if (newRepetitions === 1) {
      newInterval = 3;
      memoryLevel = 3;
    } else if (newRepetitions === 2) {
      newInterval = 6;
      memoryLevel = 4;
    } else {
      newInterval = Math.round(currentInterval * easeFactor * 1.3);
      memoryLevel = (Math.min(5, newRepetitions + 2) as 1 | 2 | 3 | 4 | 5);
    }
  }

  const now = new Date();
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    cardId,
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewDate: nextDate.toISOString(),
    lastReviewedDate: now.toISOString(),
    memoryLevel,
  };
}

/**
 * Kiểm tra xem thẻ đã đến hạn cần ôn tập hôm nay hay chưa
 */
export function isCardDue(srsData?: SRSCardData): boolean {
  if (!srsData || !srsData.nextReviewDate) {
    return true; // Thẻ chưa từng học -> Luôn đến hạn
  }
  const now = new Date().getTime();
  const dueTime = new Date(srsData.nextReviewDate).getTime();
  return now >= dueTime;
}

/**
 * Định dạng thời gian hiển thị đếm ngược đến lần ôn tiếp theo
 */
export function formatSRSCountdown(nextReviewDate?: string): string {
  if (!nextReviewDate) return 'Chưa học';

  const now = new Date().getTime();
  const due = new Date(nextReviewDate).getTime();
  const diffHours = Math.round((due - now) / (1000 * 60 * 60));

  if (diffHours <= 0) return 'Đến hạn ôn tập ngay';
  if (diffHours < 24) return `Sau ${diffHours} giờ`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays < 7) return `Sau ${diffDays} ngày`;
  if (diffDays < 30) return `Sau ${Math.round(diffDays / 7)} tuần`;
  return `Sau ${Math.round(diffDays / 30)} tháng`;
}

/**
 * Tên cấp độ ghi nhớ trong não bộ (Leitner 5 Box Model)
 */
export function getMemoryLevelName(level: 1 | 2 | 3 | 4 | 5): {
  label: string;
  badgeClass: string;
} {
  switch (level) {
    case 1:
      return {
        label: 'Mới Học (Level 1)',
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      };
    case 2:
      return {
        label: 'Nhận Biết (Level 2)',
        badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      };
    case 3:
      return {
        label: 'Đang Ghi Nhớ (Level 3)',
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      };
    case 4:
      return {
        label: 'Thành Thạo (Level 4)',
        badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      };
    case 5:
      return {
        label: 'Trí Nhớ Dài Hạn (Mastered)',
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      };
  }
}
