import React, { useState } from 'react';
import { UserProgress, Topic, Flashcard } from '../types';
import {
  CheckCircle2,
  Layers,
  HelpCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Sparkles,
  Link2,
  ArrowUpDown,
  Award,
  BarChart3,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { isCardDue } from '../utils/srs';

interface StatsViewProps {
  progress: UserProgress;
  totalFlashcards: number;
  allFlashcards: Flashcard[];
  topics: Topic[];
  onResetProgress: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  progress,
  totalFlashcards,
  allFlashcards,
  topics,
  onResetProgress,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [breakdownTab, setBreakdownTab] = useState<'type' | 'topic'>('type');

  const masteredCount = progress.masteredFlashcardIds.length;
  const needReviewCount = progress.needReviewFlashcardIds.length;
  const unmasteredCount = Math.max(0, totalFlashcards - masteredCount);
  const masteredPercentage = totalFlashcards > 0 ? Math.round((masteredCount / totalFlashcards) * 100) : 0;

  const srsRecords = progress.srsRecords || {};
  const srsDueTodayCount = allFlashcards.filter((c) => isCardDue(srsRecords[c.id])).length;
  const longTermMemoryCount = Object.values(srsRecords).filter((r) => r.memoryLevel >= 4).length;
  const learningMemoryCount = Object.values(srsRecords).filter((r) => r.memoryLevel < 4).length;

  const quizHistory = progress.quizHistory || [];
  const totalQuizzes = quizHistory.length;

  const totalAttemptedQuestions = quizHistory.reduce((acc, q) => acc + q.total, 0);
  const totalCorrectQuestions = quizHistory.reduce((acc, q) => acc + q.score, 0);
  const averageAccuracy =
    totalAttemptedQuestions > 0
      ? Math.round((totalCorrectQuestions / totalAttemptedQuestions) * 100)
      : 0;

  // Breakdown by VocabType
  const vocabTypeStats = [
    {
      type: 'word',
      label: 'Từ Vựng',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
      barColor: 'bg-blue-600',
      total: allFlashcards.filter((c) => c.vocabType === 'word').length,
      mastered: allFlashcards.filter(
        (c) => c.vocabType === 'word' && progress.masteredFlashcardIds.includes(c.id)
      ).length,
    },
    {
      type: 'collocation',
      label: 'Collocations',
      icon: Link2,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
      barColor: 'bg-amber-600',
      total: allFlashcards.filter((c) => c.vocabType === 'collocation').length,
      mastered: allFlashcards.filter(
        (c) => c.vocabType === 'collocation' && progress.masteredFlashcardIds.includes(c.id)
      ).length,
    },
    {
      type: 'phrasal-verb',
      label: 'Phrasal Verbs',
      icon: ArrowUpDown,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/60',
      barColor: 'bg-teal-600',
      total: allFlashcards.filter((c) => c.vocabType === 'phrasal-verb').length,
      mastered: allFlashcards.filter(
        (c) => c.vocabType === 'phrasal-verb' && progress.masteredFlashcardIds.includes(c.id)
      ).length,
    },
    {
      type: 'idiom',
      label: 'Idioms',
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/60',
      barColor: 'bg-purple-600',
      total: allFlashcards.filter((c) => c.vocabType === 'idiom').length,
      mastered: allFlashcards.filter(
        (c) => c.vocabType === 'idiom' && progress.masteredFlashcardIds.includes(c.id)
      ).length,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-3">
      
      {/* 🧭 Ultra-Compact Header */}
      <div className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/80 px-3.5 py-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
            Tiến Độ Học Tập & SRS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showDetails ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              if (confirm('Đặt lại toàn bộ tiến độ học tập?')) {
                onResetProgress();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Đặt lại tiến độ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 📊 4 Ultra-Compact KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        
        {/* Mastered */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>ĐÃ THUỘC</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {masteredCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {masteredPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${masteredPercentage}%` }} />
          </div>
        </div>

        {/* SRS Due Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>CẦN ÔN HÔM NAY</span>
            <Brain className="w-3 h-3 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {srsDueTodayCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400">thẻ SRS</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalFlashcards > 0 ? (srsDueTodayCount / totalFlashcards) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Quizzes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>BÀI THI</span>
            <HelpCircle className="w-3 h-3 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {totalQuizzes}
            </span>
            <span className="text-[10px] font-bold text-slate-400">{totalAttemptedQuestions} câu</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, totalQuizzes * 10)}%` }} />
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>ĐỘ CHÍNH XÁC</span>
            <Award className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {averageAccuracy}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">{totalCorrectQuestions} đúng</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${averageAccuracy}%` }} />
          </div>
        </div>

      </div>

      {/* 🧩 Collapsible Detailed Section (Only visible when user toggles) */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-150">
          
          {/* Left: Vocab Category breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span>Phân Loại Từ Vựng</span>
              <span className="text-[10px] text-slate-400">{allFlashcards.length} mục</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {vocabTypeStats.map((item) => {
                const percent = item.total > 0 ? Math.round((item.mastered / item.total) * 100) : 0;
                return (
                  <div key={item.type} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="truncate">{item.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{item.mastered}/{item.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className={`${item.barColor} h-full rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Quiz History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Lịch Sử Luyện Thi Gần Đây
              </span>
              <span className="text-[10px] text-slate-400">{quizHistory.length} bài</span>
            </div>

            {quizHistory.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-4 italic">
                Chưa có bài thi trắc nghiệm nào.
              </p>
            ) : (
              <div className="space-y-1 max-h-[130px] overflow-y-auto custom-scrollbar">
                {quizHistory.slice(-4).reverse().map((q) => {
                  const percent = Math.round((q.score / (q.total || 1)) * 100);
                  return (
                    <div key={q.id} className="p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {topics.find((t) => t.id === q.topic)?.title || q.topic}
                      </span>
                      <span className={`font-bold ${percent >= 70 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {q.score}/{q.total} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
