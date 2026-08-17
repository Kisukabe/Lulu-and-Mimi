import { Topic } from '../types';

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'all',
    title: 'Tất Cả Thư Mục',
    description: 'Tổng hợp toàn bộ từ vựng, thành ngữ và cụm từ',
    emoji: '🗂️',
    color: 'from-violet-600 to-indigo-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'toeic',
    title: 'TOEIC & Công Sở',
    description: 'Từ vựng trọng tâm bài thi TOEIC: hợp đồng, tài chính, nhân sự, lịch trình',
    emoji: '🎯',
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'daily',
    title: 'Giao Tiếp Hàng Ngày',
    description: 'Giao tiếp đời sống, kết bạn, biểu đạt cảm xúc và phản xạ hội thoại',
    emoji: '💬',
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'ielts',
    title: 'IELTS Academic 7.5+',
    description: 'Từ vựng học thuật C1/C2, collocations cho Speaking & Writing Task 2',
    emoji: '🎓',
    color: 'from-blue-600 to-indigo-700',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'business',
    title: 'Business English',
    description: 'Thuật ngữ đàm phán, thuyết trình, tiếp thị, đầu tư và tài chính',
    emoji: '💼',
    color: 'from-purple-600 to-pink-600',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'academic',
    title: 'Academic Writing',
    description: 'Cấu trúc câu, linking words, từ vựng phân tích luận văn và báo cáo',
    emoji: '📚',
    color: 'from-cyan-600 to-blue-700',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'travel',
    title: 'Du Lịch & Đời Sống',
    description: 'Sân bay, khách sạn, nhà hàng, chỉ đường và khám phá thế giới',
    emoji: '✈️',
    color: 'from-rose-500 to-orange-500',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'technology',
    title: 'Công Nghệ & Kỹ Thuật',
    description: 'AI, phần mềm, dữ liệu, an ninh mạng và chuyển đổi số',
    emoji: '💻',
    color: 'from-violet-600 to-fuchsia-600',
    badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  },
  {
    id: 'custom',
    title: 'Thư Mục Cá Nhân',
    description: 'Các từ vựng do bạn tự tạo và lưu trữ riêng',
    emoji: '📁',
    color: 'from-yellow-500 to-amber-600',
    badgeColor: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  },
];

export const TOPICS = DEFAULT_TOPICS;
