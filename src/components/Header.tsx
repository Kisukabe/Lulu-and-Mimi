import React, { useState } from 'react';
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
  Monitor,
  Check,
  Sparkles,
  Folder,
  FolderPlus,
  ChevronDown,
  Settings2,
  Dumbbell,
  Key,
} from 'lucide-react';
import { Topic } from '../types';

interface HeaderProps {
  activeTab: 'flashcards' | 'vocabulary' | 'dictionary' | 'create' | 'quiz' | 'practice' | 'ai' | 'stats';
  setActiveTab: (tab: 'flashcards' | 'vocabulary' | 'dictionary' | 'create' | 'quiz' | 'practice' | 'ai' | 'stats') => void;
  masteredCount: number;
  totalCards: number;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  folders: Topic[];
  selectedTopic: string;
  onSelectTopic: (topicId: string) => void;
  onOpenFolderManager: () => void;
  geminiKey: string;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  masteredCount,
  totalCards,
  themeMode,
  setThemeMode,
  folders,
  selectedTopic,
  onSelectTopic,
  onOpenFolderManager,
  geminiKey,
  onOpenApiKeyModal,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  const currentFolder = folders.find((f) => f.id === selectedTopic) || folders[0];

  const navItems = [
    {
      id: 'flashcards',
      label: 'Flashcards',
      shortLabel: 'Cards',
      icon: Layers,
      color: 'bg-indigo-600 text-white shadow-xs',
      iconColor: 'text-indigo-500',
    },
    {
      id: 'vocabulary',
      label: 'Từ Vựng',
      shortLabel: 'Từ Vựng',
      icon: BookOpen,
      color: 'bg-blue-600 text-white shadow-xs',
      iconColor: 'text-blue-500',
    },
    {
      id: 'dictionary',
      label: 'Tra Từ Điển',
      shortLabel: 'Từ Điển',
      icon: Search,
      color: 'bg-teal-600 text-white shadow-xs',
      iconColor: 'text-teal-500',
    },
    {
      id: 'create',
      label: 'Tự Tạo Thẻ',
      shortLabel: 'Tạo Thẻ',
      icon: PenTool,
      color: 'bg-amber-600 text-white shadow-xs',
      iconColor: 'text-amber-500',
    },
    {
      id: 'quiz',
      label: 'Trắc Nghiệm',
      shortLabel: 'Thi',
      icon: HelpCircle,
      color: 'bg-rose-600 text-white shadow-xs',
      iconColor: 'text-rose-500',
    },
    {
      id: 'practice',
      label: 'Luyện Tập',
      shortLabel: 'Luyện',
      icon: Dumbbell,
      color: 'bg-violet-600 text-white shadow-xs',
      iconColor: 'text-violet-500',
    },
    {
      id: 'ai',
      label: 'Trợ Lý AI',
      shortLabel: 'AI',
      icon: Bot,
      color: 'bg-purple-600 text-white shadow-xs',
      iconColor: 'text-purple-500',
    },
    {
      id: 'stats',
      label: 'Thống Kê',
      shortLabel: 'Tiến Độ',
      icon: BarChart2,
      color: 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs',
      iconColor: 'text-slate-500',
    },
  ] as const;

  return (
    <header className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-13 gap-2">
          
          {/* Left: Logo & Folder Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Logo */}
            <div
              className="flex items-center space-x-1.5 cursor-pointer group"
              onClick={() => setActiveTab('flashcards')}
              title="Lulu & Mimi"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-slate-100 hidden sm:inline">
                Lulu & Mimi
              </span>
            </div>

            {/* 📁 Integrated Folder Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFolderMenu(!showFolderMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 text-xs font-black transition cursor-pointer shadow-2xs"
                title="Đổi Thư Mục Học Tập"
              >
                <span className="text-sm">{currentFolder?.emoji || '📁'}</span>
                <span className="max-w-[110px] sm:max-w-[150px] truncate">
                  {currentFolder?.title}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
              </button>

              {/* Folder Quick Dropdown Menu */}
              {showFolderMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFolderMenu(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in duration-100 max-h-80 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        Thư Mục Học Tập
                      </span>
                      <button
                        onClick={() => {
                          setShowFolderMenu(false);
                          onOpenFolderManager();
                        }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" /> Quản Lý
                      </button>
                    </div>

                    {folders.map((f) => {
                      const isSelected = selectedTopic === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => {
                            onSelectTopic(f.id);
                            setShowFolderMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-800'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm shrink-0">{f.emoji || '📁'}</span>
                            <span className="truncate">{f.title}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setShowFolderMenu(false);
                          onOpenFolderManager();
                        }}
                        className="w-full py-1.5 px-2 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>+ Thêm Thư Mục Mới</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-100 dark:bg-slate-900 p-0.5 sm:p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? `${item.color} shadow-xs`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.iconColor}`} />
                  <span className="hidden sm:inline text-[11px]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Progress, API Key & Theme */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Quick Badge */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              <span>{masteredCount}/{totalCards}</span>
            </div>

            {/* API Key Settings Button */}
            <button
              id="btn-api-key-settings"
              onClick={onOpenApiKeyModal}
              className="relative p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60"
              title={geminiKey ? 'API Key đã cài đặt — Nhấn để cập nhật' : 'Cài đặt Gemini API Key'}
            >
              <Key className="w-3.5 h-3.5" />
              {/* Status dot */}
              <span
                className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-950 ${
                  geminiKey ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60"
                title="Sáng / Tối"
              >
                {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                {themeMode === 'system' && <Monitor className="w-3.5 h-3.5 text-blue-500" />}
              </button>

              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)}></div>
                  <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 text-xs space-y-0.5 animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        setThemeMode('light');
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left cursor-pointer ${
                        themeMode === 'light' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sáng</span>
                      </div>
                      {themeMode === 'light' && <Check className="w-3 h-3 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setThemeMode('dark');
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left cursor-pointer ${
                        themeMode === 'dark' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tối</span>
                      </div>
                      {themeMode === 'dark' && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>

                    <button
                      onClick={() => {
                        setThemeMode('system');
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left cursor-pointer ${
                        themeMode === 'system' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-blue-500" />
                        <span>Hệ thống</span>
                      </div>
                      {themeMode === 'system' && <Check className="w-3 h-3 text-blue-500" />}
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
