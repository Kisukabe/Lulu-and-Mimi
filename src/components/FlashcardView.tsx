import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Flashcard, Topic, VocabType, TopicId, SRSCardData } from '../types';
import {
  RotateCw,
  Sparkles,
  Volume2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  ArrowUpDown,
  Link2,
  Filter,
  Clock,
  ThumbsUp,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  X,
  Trash2,
  Plus,
  Wand2,
} from 'lucide-react';
import { calculateNextSRS, isCardDue, formatSRSCountdown, getMemoryLevelName } from '../utils/srs';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  topics: Topic[];
  selectedTopic: TopicId | string;
  masteredIds: string[];
  needReviewIds: string[];
  srsRecords?: { [cardId: string]: SRSCardData };
  onToggleMastered: (cardId: string) => void;
  onToggleNeedReview: (cardId: string) => void;
  onRateCardSRS?: (cardId: string, rating: 1 | 3 | 5) => void;
  onMoveCardToFolder?: (cardId: string, newTopicId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onOpenQuickAdd?: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcards,
  topics,
  selectedTopic,
  masteredIds,
  needReviewIds,
  srsRecords = {},
  onToggleMastered,
  onToggleNeedReview,
  onRateCardSRS,
  onMoveCardToFolder,
  onDeleteCard,
  onOpenQuickAdd,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedVocabType, setSelectedVocabType] = useState<VocabType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_srs' | 'unmastered' | 'review' | 'mastered'>('all');
  const [cardsList, setCardsList] = useState<Flashcard[]>([]);
  const [showBackSettings, setShowBackSettings] = useState(false);

  // Back card display settings — persisted in localStorage
  const BACK_SETTINGS_KEY = 'lulu_mimi_back_card_settings_v1';
  const [backSettings, setBackSettings] = useState<{
    showDefinitionEn: boolean;
    showMeaningVi: boolean;
    showExample: boolean;
    showSynonyms: boolean;
    showCollocations: boolean;
    showSRSButtons: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem(BACK_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      showDefinitionEn: true,
      showMeaningVi: true,
      showExample: true,
      showSynonyms: true,
      showCollocations: true,
      showSRSButtons: true,
    };
  });

  const updateBackSetting = (key: keyof typeof backSettings, value: boolean) => {
    const updated = { ...backSettings, [key]: value };
    setBackSettings(updated);
    try { localStorage.setItem(BACK_SETTINGS_KEY, JSON.stringify(updated)); } catch {}
  };

  // Compute density: how many sections will actually render on the back?
  // Used to scale up remaining content when some sections are hidden.
  const backVisibleCount = useMemo(() => {
    let count = 0;
    if (backSettings.showDefinitionEn) count++;     // EN definition
    if (backSettings.showMeaningVi) count++;         // VN meaning
    if (backSettings.showExample) count++;           // example
    if (backSettings.showSynonyms || backSettings.showCollocations) count++; // synonyms/colloc row
    if (backSettings.showSRSButtons) count++;        // SRS buttons
    return count;
  }, [backSettings]);

  // Density levels: 'minimal' (1-2 sections), 'medium' (3), 'full' (4-5)
  const backDensity = backVisibleCount <= 2 ? 'minimal' : backVisibleCount === 3 ? 'medium' : 'full';

  // Count how many cards are due today under SRS
  const dueCardsCount = useMemo(() => {
    return flashcards.filter((c) => isCardDue(srsRecords[c.id])).length;
  }, [flashcards, srsRecords]);

  // 1. Filter cards by selectedTopic, vocabType, and status (including SRS Due Today)
  const filteredCards = useMemo(() => {
    return flashcards.filter((card) => {
      // Topic match
      if (selectedTopic !== 'all' && card.topic !== selectedTopic) {
        return false;
      }
      // Vocab type match
      if (selectedVocabType !== 'all' && card.vocabType !== selectedVocabType) {
        return false;
      }
      // Status match
      if (statusFilter === 'due_srs') {
        return isCardDue(srsRecords[card.id]);
      }
      if (statusFilter === 'mastered') {
        return masteredIds.includes(card.id);
      }
      if (statusFilter === 'review') {
        return needReviewIds.includes(card.id);
      }
      if (statusFilter === 'unmastered') {
        return !masteredIds.includes(card.id);
      }
      return true;
    });
  }, [flashcards, selectedTopic, selectedVocabType, statusFilter, masteredIds, needReviewIds, srsRecords]);

  // Update working card list when filters change
  useEffect(() => {
    setCardsList(filteredCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filteredCards]);

  const currentCard = cardsList[currentIndex];
  const currentCardSRS = currentCard ? srsRecords[currentCard.id] : undefined;

  // 2. Audio Pronunciation playback
  const playAudio = useCallback((e?: React.MouseEvent, accent: 'UK' | 'US' = 'US') => {
    if (e) e.stopPropagation();
    if (!currentCard) return;

    const audioUrl = accent === 'UK' ? currentCard.audioUk : currentCard.audioUs;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => playSpeechFallback(currentCard.front, accent));
    } else {
      playSpeechFallback(currentCard.front, accent);
    }
  }, [currentCard]);

  const playSpeechFallback = (text: string, accent: 'UK' | 'US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 3. Navigation handlers
  const handleNext = useCallback(() => {
    if (cardsList.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cardsList.length);
  }, [cardsList.length]);

  const handlePrev = useCallback(() => {
    if (cardsList.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cardsList.length) % cardsList.length);
  }, [cardsList.length]);

  const handleShuffle = () => {
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // 4. Rate SRS Card & automatically jump to next card
  const handleRateSRS = (rating: 1 | 3 | 5) => {
    if (!currentCard) return;
    if (onRateCardSRS) {
      onRateCardSRS(currentCard.id, rating);
    }
    handleNext();
  };

  // 5. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && isFlipped) {
        handleRateSRS(1);
      } else if (e.key === '2' && isFlipped) {
        handleRateSRS(3);
      } else if (e.key === '3' && isFlipped) {
        handleRateSRS(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped]);

  const getVocabTypeBadge = (type: VocabType) => {
    switch (type) {
      case 'word':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <BookOpen className="w-3 h-3" /> Từ Vựng
          </span>
        );
      case 'idiom':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Thành Ngữ (Idiom)
          </span>
        );
      case 'collocation':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <Link2 className="w-3 h-3" /> Cụm Từ (Collocation)
          </span>
        );
      case 'phrasal-verb':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <ArrowUpDown className="w-3 h-3" /> Cụm Động Từ (Phrasal Verb)
          </span>
        );
    }
  };

  const getWordFormBadge = (form?: string) => {
    if (!form) return null;
    const colors: Record<string, string> = {
      noun: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
      verb: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      adjective: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300',
      adverb: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      phrase: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      idiom: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    };
    const style = colors[form.toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

    return (
      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${style}`}>
        {form}
      </span>
    );
  };

  const currentTopicObj = topics.find((t) => t.id === selectedTopic);
  const memoryBadge = currentCardSRS ? getMemoryLevelName(currentCardSRS.memoryLevel) : undefined;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
      
      {/* Header Controls & Filter Section (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs backdrop-blur-md">
        
        {/* Left: Vocab Type Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Loại:
          </span>
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'word', label: 'Từ Vựng' },
            { id: 'collocation', label: 'Collocations' },
            { id: 'phrasal-verb', label: 'Phrasal Verbs' },
            { id: 'idiom', label: 'Idioms' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedVocabType(type.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                selectedVocabType === type.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Right: Quick Add, SRS Filter, Back Settings & Shuffle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[11px] font-black rounded-xl shadow-xs transition cursor-pointer"
              title="Thêm từ vựng mới và tự động tạo flashcard"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>+ Thêm Từ</span>
            </button>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Lọc theo chu kỳ lặp lại ngắt quãng SM-2"
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">Tất cả ({flashcards.length})</option>
            <option value="due_srs">⏰ Cần ôn hôm nay ({dueCardsCount})</option>
            <option value="unmastered">Chưa thuộc ({flashcards.length - masteredIds.length})</option>
            <option value="review">Cần ôn lại ({needReviewIds.length})</option>
            <option value="mastered">Đã thuộc ({masteredIds.length})</option>
          </select>

          {/* ⚙️ Back Card Settings Toggle */}
          <button
            onClick={() => setShowBackSettings((v) => !v)}
            className={`p-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              showBackSettings
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700'
            }`}
            title="Tuỳ chỉnh mặt sau thẻ"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Xáo trộn ngẫu nhiên bộ thẻ"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ⚙️ Back Card Settings Panel */}
      {showBackSettings && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 rounded-2xl p-3.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tuỳ Chỉnh Mặt Sau Flashcard
            </span>
            <button
              onClick={() => setShowBackSettings(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              { key: 'showDefinitionEn', label: '🇬🇧 Định nghĩa tiếng Anh' },
              { key: 'showMeaningVi',    label: '🇻🇳 Nghĩa tiếng Việt' },
              { key: 'showExample',     label: '📝 Câu ví dụ' },
              { key: 'showSynonyms',    label: '🔗 Từ đồng nghĩa' },
              { key: 'showCollocations',label: '📌 Cụm từ đi kèm' },
              { key: 'showSRSButtons',  label: '⏰ Đánh giá SM-2' },
            ] as { key: keyof typeof backSettings; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateBackSetting(key, !backSettings[key])}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer text-left ${
                  backSettings[key]
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                  backSettings[key]
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                }`}>
                  {backSettings[key] && <span className="text-[9px]">✓</span>}
                </span>
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            💡 Cài đặt được lưu tự động và áp dụng cho toàn bộ thẻ trong bộ flashcard.
          </p>
        </div>
      )}

      {/* Main Flashcard Container */}
      {cardsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {statusFilter === 'due_srs'
              ? '🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ thẻ cần ôn tập hôm nay.'
              : 'Không tìm thấy thẻ nào phù hợp với bộ lọc'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {statusFilter === 'due_srs'
              ? 'Thuật toán lặp lại ngắt quãng (SM-2) sẽ tự động nhắc nhở bạn ôn lại khi các từ vựng này bước vào giai đoạn sắp quên.'
              : 'Thử thay đổi bộ lọc phân loại hoặc chọn "Tất Cả" để tiếp tục ôn luyện.'}
          </p>
          <button
            onClick={() => {
              setSelectedVocabType('all');
              setStatusFilter('all');
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Xem Tất Cả Flashcards
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Card Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold px-2 text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-1.5">
              {getVocabTypeBadge(currentCard.vocabType)}
              {getWordFormBadge(currentCard.wordForm)}
              {memoryBadge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${memoryBadge.badgeClass}`}>
                  {memoryBadge.label}
                </span>
              )}
              
              {/* Folder Selector / Mover */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                <span>{currentTopicObj?.emoji || '📁'}</span>
                <select
                  value={currentCard.topic}
                  onChange={(e) => onMoveCardToFolder && onMoveCardToFolder(currentCard.id, e.target.value)}
                  aria-label="Chuyển thư mục thẻ này"
                  className="bg-transparent font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  {topics.filter((t) => t.id !== 'all').map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji || '📁'} {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                Thẻ {currentIndex + 1} / {cardsList.length}
              </span>

              {/* Delete Current Card Button */}
              {onDeleteCard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Bạn có chắc chắn muốn XÓA từ "${currentCard.front}" khỏi thư mục không?`)) {
                      onDeleteCard(currentCard.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Xóa từ vựng này khỏi thư mục"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3D Flip Card */}
          <div
            className="perspective-1000 w-full h-[420px] sm:h-[480px] cursor-pointer select-none relative"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              
              {/* ════════ FRONT SIDE (ENGLISH WORD) ════════ */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-2 border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl backface-hidden group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all overflow-y-auto custom-scrollbar">
                
                {/* Top Info on Front */}
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Mặt Trước • Thuật Ngữ Tiếng Anh
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => playAudio(e, 'US')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-extrabold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
                      title="Nghe phát âm chuẩn US"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>US</span>
                    </button>
                    <button
                      onClick={(e) => playAudio(e, 'UK')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl text-[11px] font-extrabold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                      title="Nghe phát âm chuẩn UK"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>UK</span>
                    </button>
                  </div>
                </div>

                {/* Center Word & Pronunciation */}
                <div className="my-auto text-center space-y-4 py-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {currentCard.front}
                  </h2>

                  {(currentCard.pronunciation || currentCard.pronunciationUs || currentCard.pronunciationUk) && (
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-base sm:text-lg text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/60 px-4 py-1 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
                        {currentCard.pronunciationUs || currentCard.pronunciation || currentCard.pronunciationUk}
                      </span>
                    </div>
                  )}

                  {currentCard.wordFamily && currentCard.wordFamily.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                      {currentCard.wordFamily.map((wf, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg"
                        >
                          <span className="text-slate-400 font-bold">{wf.form}:</span> {wf.word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Instruction */}
                <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="hidden sm:inline">
                    Phím <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-bold rounded">Space</kbd> để lật thẻ
                  </span>
                  <span className="mx-auto sm:mx-0 flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                    <RotateCw className="w-3.5 h-3.5" /> Chạm để xem định nghĩa tiếng Anh & nghĩa tiếng Việt
                  </span>
                  <span className="hidden sm:inline">
                    Phím <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-bold rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-bold rounded">→</kbd>
                  </span>
                </div>
              </div>

              {/* ════════ BACK SIDE (ENGLISH DEFINITION & VIETNAMESE MEANING) ════════ */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white border-2 border-indigo-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backface-hidden rotate-y-180 overflow-y-auto custom-scrollbar">
                
                {/* Top Info on Back */}
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mặt Sau • Định Nghĩa Chi Tiết
                  </span>
                  {currentCardSRS && (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Ôn tiếp: {formatSRSCountdown(currentCardSRS.nextReviewDate)}
                    </span>
                  )}
                </div>

                {/* Main Definition & Details */}
                <div className={`my-auto py-2 transition-all duration-300 ${
                  backDensity === 'minimal' ? 'space-y-6 flex flex-col items-center justify-center text-center' :
                  backDensity === 'medium'  ? 'space-y-4' :
                  'space-y-3.5'
                }`}>
                  
                  {/* 🇬🇧 English Definition (PRIORITY SPOTLIGHT) */}
                  {backSettings.showDefinitionEn && (
                    <div className={`bg-gradient-to-br from-indigo-950/90 to-purple-950/80 border-2 border-indigo-500/40 rounded-2xl space-y-2 text-left transition-all duration-300 shadow-lg ${
                      backDensity === 'minimal' ? 'p-8 w-full' :
                      backDensity === 'medium'  ? 'p-6' : 'p-4 sm:p-5'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 ${
                          backDensity === 'minimal' ? 'text-sm' :
                          backDensity === 'medium'  ? 'text-xs' : 'text-[11px]'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 🇬🇧 English Definition (Định Nghĩa Tiếng Anh):
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                          {currentCard.wordForm || 'word'}
                        </span>
                      </div>
                      <p className={`font-bold text-white leading-relaxed transition-all tracking-wide ${
                        backDensity === 'minimal' ? 'text-3xl sm:text-4xl' :
                        backDensity === 'medium'  ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                      }`}>
                        {currentCard.definitionEn || currentCard.back}
                      </p>
                    </div>
                  )}

                  {/* 🇻🇳 Vietnamese Meaning (Supporting Translation) */}
                  {backSettings.showMeaningVi && (
                    <div className={`bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1 text-left transition-all duration-300 ${
                      backDensity === 'minimal' ? 'p-5 w-full' :
                      backDensity === 'medium'  ? 'p-4' : 'p-3'
                    }`}>
                      <span className={`font-bold uppercase tracking-wider text-emerald-400 ${
                        backDensity === 'minimal' ? 'text-xs block' : 'text-[10px]'
                      }`}>
                        🇻🇳 Bản dịch tiếng Việt:
                      </span>
                      <p className={`font-extrabold text-emerald-300 leading-snug transition-all ${
                        backDensity === 'minimal' ? 'text-xl sm:text-2xl' :
                        backDensity === 'medium'  ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                      }`}>
                        {currentCard.back}
                      </p>
                    </div>
                  )}

                  {/* Example Sentence */}
                  {backSettings.showExample && currentCard.example && (
                    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl space-y-2 text-left transition-all duration-300 ${
                      backDensity === 'minimal' ? 'p-6 w-full' :
                      backDensity === 'medium'  ? 'p-5' : 'p-3'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`uppercase font-black tracking-wider text-slate-400 ${
                          backDensity === 'minimal' ? 'text-sm' :
                          backDensity === 'medium'  ? 'text-xs' : 'text-[10px]'
                        }`}>
                          Ví Dụ Thực Tế:
                        </span>
                        <button
                          onClick={(e) => playSpeechFallback(currentCard.example || '', 'US')}
                          className="text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                          title="Đọc câu ví dụ"
                        >
                          <Volume2 className={backDensity === 'minimal' ? 'w-6 h-6' : backDensity === 'medium' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
                        </button>
                      </div>
                      <p className={`font-medium text-slate-100 leading-relaxed italic transition-all ${
                        backDensity === 'minimal' ? 'text-xl sm:text-2xl' :
                        backDensity === 'medium'  ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
                      }`}>
                        &quot;{currentCard.example}&quot;
                      </p>
                      {currentCard.exampleVi && (
                        <p className={`text-slate-400 pt-0.5 ${
                          backDensity === 'minimal' ? 'text-base' :
                          backDensity === 'medium'  ? 'text-sm' : 'text-[11px]'
                        }`}>
                          👉 {currentCard.exampleVi}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Synonyms & Collocations Grid */}
                  {(backSettings.showSynonyms || backSettings.showCollocations) && (
                    <div className={`grid gap-3 text-left transition-all ${
                      backDensity !== 'full' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                      {backSettings.showSynonyms && currentCard.synonyms && currentCard.synonyms.length > 0 && (
                        <div className={`bg-slate-800/40 rounded-2xl border border-slate-700/40 transition-all duration-300 ${
                          backDensity === 'minimal' ? 'p-6' :
                          backDensity === 'medium'  ? 'p-4' : 'p-2.5'
                        }`}>
                          <span className={`font-bold uppercase text-indigo-400 block ${
                            backDensity === 'minimal' ? 'text-sm mb-2' :
                            backDensity === 'medium'  ? 'text-xs mb-1' : 'text-[10px] mb-0.5'
                          }`}>
                            🔗 Từ Đồng Nghĩa:
                          </span>
                          <span className={`text-slate-200 font-medium transition-all ${
                            backDensity === 'minimal' ? 'text-xl sm:text-2xl' :
                            backDensity === 'medium'  ? 'text-base' : 'text-[11px]'
                          }`}>
                            {currentCard.synonyms.join(' • ')}
                          </span>
                        </div>
                      )}

                      {backSettings.showCollocations && currentCard.collocations && currentCard.collocations.length > 0 && (
                        <div className={`bg-slate-800/40 rounded-2xl border border-slate-700/40 transition-all duration-300 ${
                          backDensity === 'minimal' ? 'p-6' :
                          backDensity === 'medium'  ? 'p-4' : 'p-2.5'
                        }`}>
                          <span className={`font-bold uppercase text-amber-400 block ${
                            backDensity === 'minimal' ? 'text-sm mb-2' :
                            backDensity === 'medium'  ? 'text-xs mb-1' : 'text-[10px] mb-0.5'
                          }`}>
                            📌 Cụm Đi Kèm:
                          </span>
                          <span className={`text-slate-200 font-medium transition-all ${
                            backDensity === 'minimal' ? 'text-xl sm:text-2xl' :
                            backDensity === 'medium'  ? 'text-base' : 'text-[11px]'
                          }`}>
                            {currentCard.collocations.join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom SRS Rating Buttons (SM-2 Algorithm) */}
                {backSettings.showSRSButtons && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 shrink-0">
                    <div className={`font-bold text-center text-slate-400 ${
                      backDensity === 'minimal' ? 'text-xs' : 'text-[10px]'
                    }`}>
                      Đánh giá mức độ ghi nhớ theo thuật toán Spaced Repetition (SM-2):
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRateSRS(1);
                        }}
                        className={`rounded-xl bg-rose-950/70 border border-rose-800/80 hover:bg-rose-900/80 text-rose-300 font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                          backDensity === 'minimal' ? 'py-4 px-3 text-sm' : 'py-2 px-2 text-xs'
                        }`}
                        title="Phím tắt: 1"
                      >
                        <span className="flex items-center gap-1">
                          <RotateCcw className={backDensity === 'minimal' ? 'w-4 h-4' : 'w-3 h-3'} /> Quên / Khó
                        </span>
                        <span className="text-[9px] opacity-75">(Ôn lại sau 1 ngày)</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRateSRS(3);
                        }}
                        className={`rounded-xl bg-amber-950/70 border border-amber-800/80 hover:bg-amber-900/80 text-amber-300 font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                          backDensity === 'minimal' ? 'py-4 px-3 text-sm' : 'py-2 px-2 text-xs'
                        }`}
                        title="Phím tắt: 2"
                      >
                        <span className="flex items-center gap-1">
                          <ThumbsUp className={backDensity === 'minimal' ? 'w-4 h-4' : 'w-3 h-3'} /> Đã Nhớ
                        </span>
                        <span className="text-[9px] opacity-75">(Ôn sau 3 - 6 ngày)</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRateSRS(5);
                        }}
                        className={`rounded-xl bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900/80 text-emerald-300 font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                          backDensity === 'minimal' ? 'py-4 px-3 text-sm' : 'py-2 px-2 text-xs'
                        }`}
                        title="Phím tắt: 3"
                      >
                        <span className="flex items-center gap-1">
                          <Zap className={backDensity === 'minimal' ? 'w-4 h-4' : 'w-3 h-3'} /> Rất Dễ
                        </span>
                        <span className="text-[9px] opacity-75">(Ôn sau 15+ ngày)</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Navigation Arrows & Toggle Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            
            {/* Status Check Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => onToggleNeedReview(currentCard.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  needReviewIds.includes(currentCard.id)
                    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Cần Ôn Lại
              </button>

              <button
                onClick={() => onToggleMastered(currentCard.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  masteredIds.includes(currentCard.id)
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Đã Thuộc
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                Tiếp Theo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
