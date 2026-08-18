import React, { useState, useEffect } from 'react';
import {
  Layers,
  BookOpen,
  Search,
  PenTool,
  HelpCircle,
  Bot,
  BarChart2,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Key,
  Flame,
  CheckCircle2,
  HelpCircle as QuestionIcon,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  History
} from 'lucide-react';
import { Topic } from '../types';

interface SidebarProps {
  activeTab: 'flashcards' | 'vocabulary' | 'dictionary' | 'create' | 'quiz' | 'practice' | 'ai' | 'stats';
  setActiveTab: (tab: 'flashcards' | 'vocabulary' | 'dictionary' | 'create' | 'quiz' | 'practice' | 'ai' | 'stats') => void;
  masteredCount: number;
  totalCards: number;
  needReviewCount: number;
  dueSRSCount: number;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  folders: Topic[];
  selectedTopic: string;
  onSelectTopic: (topicId: string) => void;
  onOpenFolderManager: () => void;
  geminiKey: string;
  onOpenApiKeyModal: () => void;
  onSelectFlashcardFilter?: (filter: 'all' | 'mastered' | 'unmastered' | 'due_srs') => void;
  currentFlashcardFilter?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  masteredCount,
  totalCards,
  needReviewCount,
  dueSRSCount,
  themeMode,
  setThemeMode,
  folders,
  selectedTopic,
  onSelectTopic,
  onOpenFolderManager,
  geminiKey,
  onOpenApiKeyModal,
  onSelectFlashcardFilter,
  currentFlashcardFilter = 'all',
}) => {
  const SIDEBAR_COLLAPSED_KEY = 'lulu_mimi_sidebar_collapsed_v2';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return false; // Default expanded on desktop
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const currentFolder = folders.find((f) => f.id === selectedTopic) || folders[0];
  const unmasteredCount = Math.max(0, totalCards - masteredCount);

  const handleFlashcardClick = (filter: 'all' | 'mastered' | 'unmastered' | 'due_srs' = 'all') => {
    setActiveTab('flashcards');
    if (onSelectFlashcardFilter) {
      onSelectFlashcardFilter(filter);
    }
  };

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#354622] dark:bg-[#1a2411] text-slate-100 flex flex-col justify-between border-r border-black/10 dark:border-white/5 transition-all duration-300 z-40 select-none ${
        isCollapsed ? 'w-20' : 'w-72 sm:w-80'
      }`}
    >
      {/* ════════ TOP BRAND HEADER ════════ */}
      <div className={`p-4 border-b border-white/10 shrink-0 ${isCollapsed ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center text-xl shadow-md shrink-0">
                📖
              </div>
              <div className="truncate">
                <h1 className="text-base font-black tracking-tight text-white leading-none">
                  The IELTS
                </h1>
                <span className="text-[10px] font-black tracking-widest uppercase text-yellow-300">
                  DICTIONARY
                </span>
              </div>
            </div>

            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-slate-200 hover:text-white transition cursor-pointer active:scale-95 shrink-0"
              title="Thu gọn menu"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-300" />
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center text-xl shadow-md shrink-0">
              📖
            </div>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-yellow-300 hover:text-white transition cursor-pointer active:scale-95 shrink-0"
              title="Mở rộng menu"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ════════ MAIN NAVIGATION LINKS ════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        
        {/* Section 1: HỌC TẬP */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="text-[11px] font-black uppercase tracking-wider text-white/50 px-3 py-1">
              HỌC TẬP
            </div>
          )}

          {/* 1. Tổng quan (Overview / Vocabulary Detail) */}
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer group ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'vocabulary'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Tổng quan từ vựng"
          >
            <BarChart2 className={`w-5 h-5 shrink-0 ${activeTab === 'vocabulary' ? 'text-slate-950' : 'text-slate-300'}`} />
            {!isCollapsed && <span>Tổng quan</span>}
          </button>

          {/* 2. Bộ từ (Topics Selector Modal trigger) */}
          <button
            onClick={onOpenFolderManager}
            className={`w-full flex items-center justify-between py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-200 hover:bg-black/20 hover:text-white transition cursor-pointer group ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            }`}
            title="Chọn bộ từ vựng"
          >
            <div className="flex items-center gap-3 truncate">
              <BookOpen className="w-5 h-5 shrink-0 text-slate-300" />
              {!isCollapsed && (
                <div className="flex items-center gap-2 truncate">
                  <span>Bộ từ</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/30 text-white/90 truncate max-w-[120px]">
                    {currentFolder?.title || 'IELTS'}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-0.5 transition-transform" />}
          </button>

          {/* 3. Flashcard (Highlighted Golden Pill as in user screenshots) */}
          <div className="space-y-1">
            <button
              onClick={() => handleFlashcardClick('all')}
              className={`w-full flex items-center gap-3 py-3 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer shadow-sm ${
                isCollapsed ? 'justify-center px-0' : 'px-3.5'
              } ${
                activeTab === 'flashcards' && currentFlashcardFilter === 'all'
                  ? 'bg-[#f5b84c] text-slate-950 shadow-md'
                  : activeTab === 'flashcards'
                  ? 'bg-[#f5b84c]/90 text-slate-950'
                  : 'text-slate-200 hover:bg-black/20 hover:text-white'
              }`}
              title="Luyện Flashcard"
            >
              <Layers className={`w-5 h-5 shrink-0 ${activeTab === 'flashcards' ? 'text-slate-950' : 'text-slate-300'}`} />
              {!isCollapsed && (
                <div className="text-left leading-tight truncate">
                  <div className="font-black text-sm">Flashcard</div>
                  <div className="text-[10px] text-slate-800/80 font-bold truncate">
                    {currentFolder?.title || 'Chủ đề từ vựng'}
                  </div>
                </div>
              )}
            </button>

            {/* Flashcard Sub-items (Đã nhớ, Chưa nhớ, Cần ôn tập) */}
            {!isCollapsed && (
              <div className="pl-4 pr-1 py-1 space-y-0.5">
                
                {/* Đã nhớ */}
                <button
                  onClick={() => handleFlashcardClick('mastered')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'flashcards' && currentFlashcardFilter === 'mastered'
                      ? 'bg-black/30 text-amber-300'
                      : 'text-slate-300 hover:bg-black/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đã nhớ</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-black text-slate-200">
                    {masteredCount}
                  </span>
                </button>

                {/* Chưa nhớ */}
                <button
                  onClick={() => handleFlashcardClick('unmastered')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'flashcards' && currentFlashcardFilter === 'unmastered'
                      ? 'bg-black/30 text-amber-300'
                      : 'text-slate-300 hover:bg-black/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <QuestionIcon className="w-4 h-4 text-rose-400" />
                    <span>Chưa nhớ</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-black text-slate-200">
                    {unmasteredCount}
                  </span>
                </button>

                {/* Cần ôn tập */}
                <button
                  onClick={() => handleFlashcardClick('due_srs')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'flashcards' && currentFlashcardFilter === 'due_srs'
                      ? 'bg-black/30 text-amber-300'
                      : 'text-slate-300 hover:bg-black/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Cần ôn tập</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-black text-amber-300">
                    {dueSRSCount}
                  </span>
                </button>

              </div>
            )}
          </div>

          {/* 4. Thống kê */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'stats'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Thống kê tiến độ"
          >
            <Compass className={`w-5 h-5 shrink-0 ${activeTab === 'stats' ? 'text-slate-950' : 'text-slate-300'}`} />
            {!isCollapsed && <span>Thống kê</span>}
          </button>

          {/* 5. Lịch sử làm bài */}
          <button
            onClick={() => setActiveTab('practice')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'practice'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Luyện tập & Lịch sử làm bài"
          >
            <History className={`w-5 h-5 shrink-0 ${activeTab === 'practice' ? 'text-slate-950' : 'text-slate-300'}`} />
            {!isCollapsed && <span>Lịch sử làm bài</span>}
          </button>

        </div>

        {/* Section 2: CÔNG CỤ NÂNG CAO */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          {!isCollapsed && (
            <div className="text-[11px] font-black uppercase tracking-wider text-white/50 px-3 py-1">
              CÔNG CỤ
            </div>
          )}

          {/* Tra từ điển */}
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'dictionary'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Tra từ điển Cambridge"
          >
            <Search className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Tra từ điển</span>}
          </button>

          {/* Tự tạo thẻ */}
          <button
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'create'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Tự tạo Flashcard"
          >
            <PenTool className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Tự tạo thẻ</span>}
          </button>

          {/* Trắc nghiệm */}
          <button
            onClick={() => setActiveTab('quiz')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'quiz'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Làm bài trắc nghiệm"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Trắc nghiệm</span>}
          </button>

          {/* Trợ lý AI */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              activeTab === 'ai'
                ? 'bg-[#f5b84c] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:bg-black/20 hover:text-white'
            }`}
            title="Trợ lý học AI"
          >
            <Bot className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Trợ lý AI</span>}
          </button>

        </div>

      </div>

      {/* ════════ BOTTOM STREAK & SETTINGS ════════ */}
      <div className="p-3 border-t border-white/10 space-y-2 shrink-0">
        
        {/* Streak Flame Card */}
        {!isCollapsed ? (
          <div className="bg-black/30 rounded-2xl p-3 flex items-center gap-3 border border-white/10 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-black text-white">0 ngày</div>
              <div className="text-[10px] text-white/70 font-bold">Chuỗi học liên tục</div>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs" title="Chuỗi học liên tục">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        )}

        {/* Theme & Settings Row */}
        <div className={`flex items-center gap-1 pt-1 ${isCollapsed ? 'flex-col justify-center' : 'justify-between'}`}>
          {/* Theme Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-slate-200 hover:text-white transition cursor-pointer"
            title="Chuyển chế độ Sáng / Tối"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* API Key Modal trigger */}
          <button
            onClick={onOpenApiKeyModal}
            className={`p-2 rounded-xl bg-black/20 hover:bg-black/40 text-slate-200 hover:text-white transition cursor-pointer ${
              !isCollapsed ? 'flex items-center gap-1.5 text-xs font-black' : ''
            }`}
            title="Cài đặt API Gemini"
          >
            <Key className="w-4 h-4 text-yellow-300" />
            {!isCollapsed && <span>{geminiKey ? 'API Key: Đã lưu' : 'Nhập API'}</span>}
          </button>
        </div>

      </div>

    </aside>
  );
};
