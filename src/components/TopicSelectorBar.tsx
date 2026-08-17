import React, { useState } from 'react';
import { Topic, TopicId } from '../types';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface TopicSelectorBarProps {
  topics: Topic[];
  selectedTopic: TopicId | string;
  onSelectTopic: (topicId: TopicId | string) => void;
  topicCounts?: { [topicId: string]: number };
}

export const TopicSelectorBar: React.FC<TopicSelectorBarProps> = ({
  topics,
  selectedTopic,
  onSelectTopic,
  topicCounts = {},
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentTopicObj = topics.find((t) => t.id === selectedTopic) || topics[0];
  const count = topicCounts[selectedTopic] || 0;

  return (
    <>
      {/* Ultra-Slim Minimalist Topic Bar */}
      <section
        aria-label="Topic Selector"
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-2 sm:px-4 py-1.5 transition-all text-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Active Topic Badge & Quick Dropdown Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-extrabold transition cursor-pointer shadow-2xs"
              title="Nhấn để đổi chuyên mục học"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Chủ Đề:</span>
              <span className="text-indigo-950 dark:text-white underline decoration-indigo-400">
                {currentTopicObj?.title}
              </span>
              {count > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* Center: Scrollable Chips (Hidden if user collapses to save 100% screen) */}
          {!isCollapsed && (
            <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar py-0.5 scroll-smooth flex-1 max-w-2xl mx-2">
              {topics.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                const topicCount = topicCounts[topic.id] || 0;

                return (
                  <button
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-[11px] ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs scale-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{topic.title}</span>
                    {topicCount > 0 && (
                      <span className={`text-[9px] px-1 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'opacity-70'}`}>
                        {topicCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: Collapse / Expand Toggle to save screen */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title={isCollapsed ? 'Mở rộng thanh chủ đề' : 'Thu gọn thanh chủ đề để rộng màn hình'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

        </div>
      </section>

      {/* Slide-out Topic Selection Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-full max-w-sm bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Chọn Chuyên Mục Học
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Lọc flashcards và bài tập theo mục tiêu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Topic Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {topics.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                const topicCount = topicCounts[topic.id] || 0;

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      onSelectTopic(topic.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                        <span>{topic.title}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {topic.description}
                      </p>
                    </div>

                    {topicCount > 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        {topicCount} thẻ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
              <button
                onClick={() => {
                  onSelectTopic('all');
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Xem Toàn Bộ Tất Cả Chủ Đề
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
