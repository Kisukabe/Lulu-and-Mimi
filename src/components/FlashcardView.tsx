import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Flashcard, Topic, VocabType, TopicId, SRSCardData, WordForm } from '../types';
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
  ThumbsDown,
  ThumbsUp,
  Zap,
  SlidersHorizontal,
  X,
  Trash2,
  Plus,
  Wand2,
  Edit3,
  Check,
  Palette,
  Eye,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Moon,
  Flame,
  Award,
  Headphones,
  HelpCircle,
  Mic,
  Smile,
  Star
} from 'lucide-react';
import { calculateNextSRS, isCardDue, formatSRSCountdown, getMemoryLevelName, previewNextInterval } from '../utils/srs';

export type ThemeVibe = 'dark-space' | 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';

interface ThemeConfig {
  id: ThemeVibe;
  label: string;
  emoji: string;
  dotClass: string;
  
  // Front card
  frontBg: string;
  frontBorder: string;
  frontTextColor: string;
  starColor: string;
  
  // Back card
  backBg: string;
  backBorder: string;
  backTextColor: string;
  
  // Accent & Buttons
  accentColor: string;
  actionBtnBg: string;
}

const THEME_CONFIGS: Record<ThemeVibe, ThemeConfig> = {
  'dark-space': {
    id: 'dark-space',
    label: 'IELTS Đêm Sao',
    emoji: '🌌',
    dotClass: 'bg-indigo-900 border border-amber-400',
    frontBg: 'bg-gradient-to-b from-[#132743] via-[#0f1d33] to-[#0a1526]',
    frontBorder: 'border-blue-500/30 shadow-[0_0_40px_rgba(15,29,51,0.6)]',
    frontTextColor: 'text-white',
    starColor: 'text-blue-200/50',
    backBg: 'bg-gradient-to-b from-[#3f5624] via-[#4d692b] to-[#36491e]',
    backBorder: 'border-lime-500/30 shadow-[0_0_40px_rgba(63,86,36,0.5)]',
    backTextColor: 'text-white',
    accentColor: 'text-amber-400',
    actionBtnBg: 'bg-[#556b2f] hover:bg-[#627b37]',
  },
  blue: {
    id: 'blue',
    label: 'Xanh Đại Dương',
    emoji: '🌊',
    dotClass: 'bg-blue-500',
    frontBg: 'bg-gradient-to-b from-[#0f2c59] via-[#091e3d] to-[#06142a]',
    frontBorder: 'border-cyan-500/30 shadow-[0_0_40px_rgba(15,44,89,0.5)]',
    frontTextColor: 'text-white',
    starColor: 'text-cyan-200/50',
    backBg: 'bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985]',
    backBorder: 'border-cyan-400/40 shadow-[0_0_40px_rgba(2,132,199,0.4)]',
    backTextColor: 'text-white',
    accentColor: 'text-cyan-300',
    actionBtnBg: 'bg-cyan-700 hover:bg-cyan-600',
  },
  rose: {
    id: 'rose',
    label: 'Đỏ Ruby',
    emoji: '🔥',
    dotClass: 'bg-rose-500',
    frontBg: 'bg-gradient-to-b from-[#3d0f1e] via-[#2a0914] to-[#1a050c]',
    frontBorder: 'border-rose-500/30 shadow-[0_0_40px_rgba(61,15,30,0.5)]',
    frontTextColor: 'text-white',
    starColor: 'text-rose-200/50',
    backBg: 'bg-gradient-to-b from-[#be123c] via-[#9f1239] to-[#881337]',
    backBorder: 'border-rose-400/40 shadow-[0_0_40px_rgba(190,18,60,0.4)]',
    backTextColor: 'text-white',
    accentColor: 'text-rose-300',
    actionBtnBg: 'bg-rose-800 hover:bg-rose-700',
  },
  amber: {
    id: 'amber',
    label: 'Vàng Sunset',
    emoji: '✨',
    dotClass: 'bg-amber-500',
    frontBg: 'bg-gradient-to-b from-[#33220c] via-[#241708] to-[#170e05]',
    frontBorder: 'border-amber-500/30 shadow-[0_0_40px_rgba(51,34,12,0.5)]',
    frontTextColor: 'text-white',
    starColor: 'text-amber-200/50',
    backBg: 'bg-gradient-to-b from-[#b45309] via-[#92400e] to-[#78350f]',
    backBorder: 'border-amber-400/40 shadow-[0_0_40px_rgba(180,83,9,0.4)]',
    backTextColor: 'text-white',
    accentColor: 'text-amber-300',
    actionBtnBg: 'bg-amber-700 hover:bg-amber-600',
  },
  emerald: {
    id: 'emerald',
    label: 'Xanh Rừng Rậm',
    emoji: '🌿',
    dotClass: 'bg-emerald-500',
    frontBg: 'bg-gradient-to-b from-[#0a2f1d] via-[#062013] to-[#04150c]',
    frontBorder: 'border-emerald-500/30 shadow-[0_0_40px_rgba(10,47,29,0.5)]',
    frontTextColor: 'text-white',
    starColor: 'text-emerald-200/50',
    backBg: 'bg-gradient-to-b from-[#047857] via-[#065f46] to-[#064e3b]',
    backBorder: 'border-emerald-400/40 shadow-[0_0_40px_rgba(4,120,87,0.4)]',
    backTextColor: 'text-white',
    accentColor: 'text-emerald-300',
    actionBtnBg: 'bg-emerald-800 hover:bg-emerald-700',
  },
  purple: {
    id: 'purple',
    label: 'Tím Huyền Bí',
    emoji: '🔮',
    dotClass: 'bg-purple-500',
    frontBg: 'bg-gradient-to-b from-[#24133b] via-[#190c29] to-[#0f071a]',
    frontBorder: 'border-purple-500/30 shadow-[0_0_40px_rgba(36,19,59,0.5)]',
    frontTextColor: 'text-white',
    starColor: 'text-purple-200/50',
    backBg: 'bg-gradient-to-b from-[#7e22ce] via-[#6b21a8] to-[#581c87]',
    backBorder: 'border-purple-400/40 shadow-[0_0_40px_rgba(126,34,206,0.4)]',
    backTextColor: 'text-white',
    accentColor: 'text-purple-300',
    actionBtnBg: 'bg-purple-800 hover:bg-purple-700',
  },
};

interface FlashcardViewProps {
  flashcards: Flashcard[];
  topics: Topic[];
  selectedTopic: TopicId | string;
  masteredIds: string[];
  needReviewIds: string[];
  srsRecords?: { [cardId: string]: SRSCardData };
  onToggleMastered: (cardId: string) => void;
  onToggleNeedReview: (cardId: string) => void;
  onRateCardSRS?: (cardId: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  onMoveCardToFolder?: (cardId: string, newTopicId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onEditCard?: (updatedCard: Flashcard) => void;
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
  onEditCard,
  onOpenQuickAdd,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedVocabType, setSelectedVocabType] = useState<VocabType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_srs' | 'unmastered' | 'review' | 'mastered'>('all');
  const [cardsList, setCardsList] = useState<Flashcard[]>([]);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showBackSettings, setShowBackSettings] = useState(false);

  // Auto-play audio preference
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lulu_mimi_auto_play_audio') === 'true';
    } catch {
      return false;
    }
  });

  const [preferredAccent, setPreferredAccent] = useState<'US' | 'UK'>('US');

  const toggleAutoPlayAudio = () => {
    setAutoPlayAudio((prev) => {
      const next = !prev;
      try { localStorage.setItem('lulu_mimi_auto_play_audio', String(next)); } catch {}
      return next;
    });
  };

  // Theme Vibe
  const THEME_VIBE_KEY = 'lulu_mimi_card_theme_vibe_v2';
  const [themeVibe, setThemeVibe] = useState<ThemeVibe>(() => {
    try {
      const saved = localStorage.getItem(THEME_VIBE_KEY) as ThemeVibe;
      if (saved && THEME_CONFIGS[saved]) return saved;
    } catch {}
    return 'dark-space'; // Default matching The IELTS Dictionary!
  });

  const changeThemeVibe = (newVibe: ThemeVibe) => {
    setThemeVibe(newVibe);
    try { localStorage.setItem(THEME_VIBE_KEY, newVibe); } catch {}
  };

  const currentTheme = THEME_CONFIGS[themeVibe] || THEME_CONFIGS['dark-space'];

  // Card animation
  const [animClass, setAnimClass] = useState<string>('animate-card-pop');
  const [isPlayingAudio, setIsPlayingAudio] = useState<'US' | 'UK' | null>(null);

  // In-Card Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Flashcard>>({});

  // Back settings
  const BACK_SETTINGS_KEY = 'lulu_mimi_back_card_settings_v2';
  const [backSettings, setBackSettings] = useState<{
    showDefinitionEn: boolean;
    showMeaningVi: boolean;
    showExample: boolean;
    showSynonyms: boolean;
    showCollocations: boolean;
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
    };
  });

  const updateBackSetting = (key: keyof typeof backSettings, value: boolean) => {
    const updated = { ...backSettings, [key]: value };
    setBackSettings(updated);
    try { localStorage.setItem(BACK_SETTINGS_KEY, JSON.stringify(updated)); } catch {}
  };

  // Due SRS Count
  const dueCardsCount = useMemo(() => {
    return flashcards.filter((c) => isCardDue(srsRecords[c.id])).length;
  }, [flashcards, srsRecords]);

  // Filter cards
  const filteredCards = useMemo(() => {
    return flashcards.filter((card) => {
      if (selectedTopic !== 'all' && card.topic !== selectedTopic) {
        return false;
      }
      if (selectedVocabType !== 'all' && card.vocabType !== selectedVocabType) {
        return false;
      }
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

  useEffect(() => {
    setCardsList(filteredCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsEditing(false);
  }, [filteredCards]);

  const currentCard = cardsList[currentIndex];
  const currentCardSRS = currentCard ? srsRecords[currentCard.id] : undefined;

  // Mastered & Progress Stats for current set
  const currentTopicObj = topics.find((t) => t.id === selectedTopic);
  const totalCardsInSet = cardsList.length;
  const masteredCardsInSet = useMemo(() => {
    return cardsList.filter((c) => masteredIds.includes(c.id)).length;
  }, [cardsList, masteredIds]);
  const unmasteredCardsInSet = totalCardsInSet - masteredCardsInSet;
  const masteryPercentage = totalCardsInSet > 0 ? Math.round((masteredCardsInSet / totalCardsInSet) * 100) : 0;
  const masteryLevel = masteryPercentage >= 80 ? 5 : masteryPercentage >= 60 ? 4 : masteryPercentage >= 40 ? 3 : masteryPercentage >= 20 ? 2 : 1;

  // Play Audio
  const playAudio = useCallback((e?: React.MouseEvent, accent: 'UK' | 'US' = preferredAccent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;

    setIsPlayingAudio(accent);
    setTimeout(() => setIsPlayingAudio(null), 1000);

    const audioUrl = accent === 'UK' ? currentCard.audioUk : currentCard.audioUs;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => playSpeechFallback(currentCard.front, accent));
    } else {
      playSpeechFallback(currentCard.front, accent);
    }
  }, [currentCard, preferredAccent]);

  const playSpeechFallback = (text: string, accent: 'UK' | 'US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-play audio on card change
  useEffect(() => {
    if (autoPlayAudio && currentCard && !isFlipped && !isEditing) {
      const timeout = setTimeout(() => {
        playAudio(undefined, preferredAccent);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, autoPlayAudio, preferredAccent]);

  // Navigation
  const handleNext = useCallback(() => {
    if (cardsList.length === 0) return;
    setIsFlipped(false);
    setIsEditing(false);
    setAnimClass('');
    requestAnimationFrame(() => {
      setAnimClass('animate-slide-right');
      setCurrentIndex((prev) => (prev + 1) % cardsList.length);
    });
  }, [cardsList.length]);

  const handlePrev = useCallback(() => {
    if (cardsList.length === 0) return;
    setIsFlipped(false);
    setIsEditing(false);
    setAnimClass('');
    requestAnimationFrame(() => {
      setAnimClass('animate-slide-left');
      setCurrentIndex((prev) => (prev - 1 + cardsList.length) % cardsList.length);
    });
  }, [cardsList.length]);

  const handleShuffle = () => {
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsEditing(false);
    setAnimClass('');
    requestAnimationFrame(() => {
      setAnimClass('animate-card-pop');
    });
  };

  // Quick Action Buttons
  const handleMarkNotRemembered = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    if (onToggleNeedReview && !needReviewIds.includes(currentCard.id)) {
      onToggleNeedReview(currentCard.id);
    }
    if (onRateCardSRS) {
      onRateCardSRS(currentCard.id, 1);
    }
    handleNext();
  };

  const handleMarkRemembered = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    if (onToggleMastered && !masteredIds.includes(currentCard.id)) {
      onToggleMastered(currentCard.id);
    }
    if (onRateCardSRS) {
      onRateCardSRS(currentCard.id, 3);
    }
    handleNext();
  };

  // Edit handler
  const handleOpenEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    setEditForm({
      id: currentCard.id,
      front: currentCard.front,
      back: currentCard.back,
      definitionEn: currentCard.definitionEn || currentCard.back,
      pronunciationUs: currentCard.pronunciationUs || currentCard.pronunciation || '',
      pronunciationUk: currentCard.pronunciationUk || '',
      wordForm: currentCard.wordForm || 'noun',
      vocabType: currentCard.vocabType || 'word',
      topic: currentCard.topic,
      example: currentCard.example || '',
      exampleVi: currentCard.exampleVi || '',
      synonyms: currentCard.synonyms ? [...currentCard.synonyms] : [],
      collocations: currentCard.collocations ? [...currentCard.collocations] : [],
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentCard || !editForm.front?.trim()) return;

    const updated: Flashcard = {
      ...currentCard,
      ...editForm,
      front: editForm.front.trim(),
      back: editForm.back?.trim() || currentCard.back,
      definitionEn: editForm.definitionEn?.trim() || currentCard.definitionEn,
      pronunciationUs: editForm.pronunciationUs?.trim(),
      pronunciationUk: editForm.pronunciationUk?.trim(),
      pronunciation: editForm.pronunciationUs?.trim() || editForm.pronunciationUk?.trim() || currentCard.pronunciation,
      example: editForm.example?.trim(),
      exampleVi: editForm.exampleVi?.trim(),
    };

    setCardsList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (onEditCard) {
      onEditCard(updated);
    }
    setIsEditing(false);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isEditing) {
          setIsFlipped((prev) => !prev);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleMarkNotRemembered();
      } else if (e.key === '2') {
        e.preventDefault();
        handleMarkRemembered();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (!isEditing) handleOpenEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped, isEditing, currentCard]);

  const getWordFormLabel = (form?: string) => {
    if (!form) return 'Từ vựng';
    const map: Record<string, string> = {
      noun: 'Danh từ',
      verb: 'Động từ',
      adjective: 'Tính từ',
      adverb: 'Trạng từ',
      phrase: 'Cụm từ',
      idiom: 'Thành ngữ',
      preposition: 'Giới từ',
      conjunction: 'Liên từ',
    };
    return map[form.toLowerCase()] || form;
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 font-sans text-slate-100">
      
      {/* ════════ TOP BREADCRUMB & CONTROLS BAR (IELTS DICTIONARY STYLE) ════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161a15] dark:bg-[#121612] p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md">
        
        {/* Left: Breadcrumbs */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            ĐANG HỌC • BỘ THẺ
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              {currentTopicObj?.emoji || '📚'} {currentTopicObj?.title || 'IELTS Từ Vựng'}
            </h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {currentCard?.vocabType || 'Academic'}
            </span>
          </div>
        </div>

        {/* Right: Controls Strip */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          
          {/* Trộn thẻ */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Xáo trộn ngẫu nhiên bộ thẻ"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Trộn thẻ</span>
          </button>

          {/* Tự động phát âm Toggle */}
          <button
            onClick={toggleAutoPlayAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer active:scale-95 ${
              autoPlayAudio
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Bật/Tắt tự động phát âm khi chuyển thẻ"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tự động phát âm</span>
            <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${autoPlayAudio ? 'bg-amber-500' : 'bg-slate-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoPlayAudio ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Giọng phát âm Dropdown */}
          <select
            value={preferredAccent}
            onChange={(e) => setPreferredAccent(e.target.value as 'US' | 'UK')}
            className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-black rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="US">🎙️ Giọng: US (Mỹ)</option>
            <option value="UK">🎙️ Giọng: UK (Anh)</option>
          </select>

          {/* 🎨 Theme Vibe Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker((v) => !v)}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer active:scale-95"
              title="Đổi phong cách màu thẻ"
            >
              <Palette className="w-4 h-4 text-amber-400" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-[#161a15] border border-slate-800 rounded-2xl p-2 shadow-2xl w-48 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-black uppercase text-slate-400 px-2 py-1">
                  Chọn Phong Cách Thẻ
                </div>
                {(Object.values(THEME_CONFIGS) as ThemeConfig[]).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      changeThemeVibe(theme.id);
                      setShowThemePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      themeVibe === theme.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${theme.dotClass}`} />
                      <span>{theme.emoji} {theme.label}</span>
                    </span>
                    {themeVibe === theme.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add */}
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ</span>
            </button>
          )}

        </div>
      </div>

      {cardsList.length === 0 ? (
        <div className="bg-[#161a15] border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">
            {statusFilter === 'due_srs' ? '🎉 Bạn đã ôn tập xong các từ đến hạn hôm nay!' : 'Không có từ nào trong bộ lọc này'}
          </h3>
          <button
            onClick={() => setStatusFilter('all')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer"
          >
            Xem Tất Cả Flashcards
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* ════════ MAIN GRID: FLASHCARD (LEFT 70%) + COMPANION WIDGETS (RIGHT 30%) ════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* 🎴 FLASHCARD CENTER STAGE (8 COLS) */}
            <div className="lg:col-span-8 space-y-3">
              
              {/* Card Viewport Container */}
              <div className={`perspective-1000 w-full h-[460px] sm:h-[500px] relative select-none ${animClass}`}>
                
                {/* ✏️ IN-CARD EDITOR OVERLAY */}
                {isEditing ? (
                  <div className="w-full h-full bg-[#18201a] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col justify-between animate-in zoom-in-95 duration-150 text-slate-200">
                    <form onSubmit={handleSaveEdit} className="space-y-3 my-auto">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" /> Sửa Từ Vựng Trực Tiếp
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">Từ vựng *</label>
                          <input
                            type="text"
                            value={editForm.front || ''}
                            onChange={(e) => setEditForm({ ...editForm, front: e.target.value })}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-white outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">Phiên âm IPA</label>
                          <input
                            type="text"
                            value={editForm.pronunciationUs || ''}
                            onChange={(e) => setEditForm({ ...editForm, pronunciationUs: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">Loại từ</label>
                          <select
                            value={editForm.wordForm || 'noun'}
                            onChange={(e) => setEditForm({ ...editForm, wordForm: e.target.value as WordForm })}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 outline-none"
                          >
                            <option value="noun">Danh từ (Noun)</option>
                            <option value="verb">Động từ (Verb)</option>
                            <option value="adjective">Tính từ (Adjective)</option>
                            <option value="adverb">Trạng từ (Adverb)</option>
                            <option value="phrase">Cụm từ (Phrase)</option>
                            <option value="idiom">Thành ngữ (Idiom)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">Nghĩa tiếng Việt *</label>
                          <input
                            type="text"
                            value={editForm.back || ''}
                            onChange={(e) => setEditForm({ ...editForm, back: e.target.value })}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-black text-white outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">Định nghĩa tiếng Anh</label>
                          <textarea
                            rows={2}
                            value={editForm.definitionEn || ''}
                            onChange={(e) => setEditForm({ ...editForm, definitionEn: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">Câu ví dụ tiếng Anh</label>
                          <input
                            type="text"
                            value={editForm.example || ''}
                            onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-black rounded-xl cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-md"
                        >
                          Lưu Thay Đổi
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ════════ 3D FLIP CARD BODY ════════ */
                  <div
                    className="w-full h-full cursor-pointer select-none"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div
                      className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      
                      {/* 🌌 FRONT SIDE (NIGHT SKY / STARRY DEEP OCEAN AESTHETIC) */}
                      <div className={`absolute inset-0 w-full h-full ${currentTheme.frontBg} border-2 ${currentTheme.frontBorder} rounded-3xl p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-2xl overflow-hidden`}>
                        
                        {/* Star Sparkle Particles Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                          <div className="absolute top-6 left-12 text-white/40 text-xs">✦</div>
                          <div className="absolute top-16 right-20 text-white/50 text-sm">✨</div>
                          <div className="absolute bottom-20 left-24 text-white/30 text-xs">✦</div>
                          <div className="absolute bottom-12 right-16 text-white/40 text-sm">✨</div>
                          <div className="absolute top-1/2 left-1/3 text-white/20 text-xs">✦</div>
                          <div className="absolute top-1/3 right-1/4 text-white/30 text-xs">✦</div>
                        </div>

                        {/* Top Bar on Front */}
                        <div className="flex items-center justify-between z-10">
                          {/* Part of Speech Pill */}
                          <span className="px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-xs font-black text-slate-200">
                            {getWordFormLabel(currentCard.wordForm)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Speaker Button */}
                            <button
                              onClick={(e) => playAudio(e, preferredAccent)}
                              className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 border border-white/10 transition cursor-pointer active:scale-95"
                              title={`Nghe phát âm chuẩn ${preferredAccent}`}
                            >
                              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-amber-400 scale-110' : ''}`} />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={handleOpenEdit}
                              className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 border border-white/10 transition cursor-pointer active:scale-95"
                              title="Chỉnh sửa từ vựng (E)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Center Stage: Word, Phonetics, Category Tag */}
                        <div className="my-auto text-center space-y-3 z-10">
                          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
                            {currentCard.front}
                          </h1>

                          {(currentCard.pronunciation || currentCard.pronunciationUs || currentCard.pronunciationUk) && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono text-base sm:text-lg font-bold text-slate-300">
                                {currentCard.pronunciationUs || currentCard.pronunciation || currentCard.pronunciationUk}
                              </span>
                              <button
                                onClick={(e) => playAudio(e, 'US')}
                                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
                                title="Phát âm"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                              </button>
                            </div>
                          )}

                          {/* Category Hashtag Pill */}
                          <div className="inline-block">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-black text-slate-300 border border-white/10">
                              # {currentTopicObj?.title || 'Từ vựng'}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row on Front */}
                        <div className="flex items-end justify-between z-10">
                          {/* Cute Mascot Moon Avatar in Corner */}
                          <div className="w-12 h-12 rounded-full bg-slate-900/70 border border-white/20 flex items-center justify-center shadow-lg text-amber-300">
                            <span className="text-xl">🌙</span>
                          </div>

                          {/* Flip CTA Link */}
                          <div className="text-xs font-black text-slate-300/90 flex items-center gap-1 hover:text-white transition">
                            <span>Nhấn để xem nghĩa</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>

                      </div>

                      {/* 🍃 BACK SIDE (OLIVE FOREST GREEN / HIGH CONTRAST) */}
                      <div className={`absolute inset-0 w-full h-full ${currentTheme.backBg} border-2 ${currentTheme.backBorder} rounded-3xl p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl overflow-y-auto custom-scrollbar`}>
                        
                        {/* Top Row on Back */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-white/80">
                            NGHĨA TIẾNG VIỆT
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => playAudio(e, preferredAccent)}
                              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white border border-white/20 transition cursor-pointer active:scale-95"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleOpenEdit}
                              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white border border-white/20 transition cursor-pointer active:scale-95"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Center Stage: Vietnamese Meaning & Example Container */}
                        <div className="my-auto space-y-4 py-2">
                          
                          {/* Big Bold Meaning */}
                          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            {currentCard.back}
                          </h2>

                          {/* English Definition Box */}
                          {backSettings.showDefinitionEn && currentCard.definitionEn && (
                            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 space-y-1 text-left">
                              <span className="text-[10px] font-black uppercase text-yellow-200">
                                🇬🇧 ĐỊNH NGHĨA TIẾNG ANH:
                              </span>
                              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                                {currentCard.definitionEn}
                              </p>
                            </div>
                          )}

                          {/* Real Example Box */}
                          {backSettings.showExample && currentCard.example && (
                            <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-l-4 border-amber-300 border-t border-r border-b border-white/10 space-y-1 text-left">
                              <span className="text-[10px] font-black uppercase text-white/80">
                                VÍ DỤ
                              </span>
                              <p className="text-sm sm:text-base font-bold italic text-white/95 leading-relaxed">
                                &quot;{currentCard.example}&quot;
                              </p>
                              {currentCard.exampleVi && (
                                <p className="text-xs text-white/80 font-medium pt-0.5">
                                  👉 {currentCard.exampleVi}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Synonyms & Collocations */}
                          {(currentCard.synonyms?.length || currentCard.collocations?.length) ? (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {currentCard.synonyms?.map((syn, idx) => (
                                <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-black/20 text-xs font-bold text-white border border-white/10">
                                  🔗 {syn}
                                </span>
                              ))}
                              {currentCard.collocations?.map((col, idx) => (
                                <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-black/20 text-xs font-bold text-yellow-200 border border-white/10">
                                  📌 {col}
                                </span>
                              ))}
                            </div>
                          ) : null}

                        </div>

                        {/* Bottom Row on Back */}
                        <div className="flex items-center justify-between text-xs font-black text-white/70">
                          {currentCardSRS && (
                            <span>Ôn tiếp: {formatSRSCountdown(currentCardSRS.nextReviewDate)}</span>
                          )}
                          <span className="ml-auto hover:text-white transition flex items-center gap-1">
                            <RotateCw className="w-3.5 h-3.5" /> Chạm để lật lại
                          </span>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* ════════ 3 BIG ROUNDED ACTION BUTTONS (IELTS DICTIONARY STYLE) ════════ */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                
                {/* 🔴 Button 1: Chưa nhớ [1] */}
                <button
                  onClick={handleMarkNotRemembered}
                  className="py-3 px-2 rounded-2xl bg-[#3d1818] hover:bg-[#4d1f1f] border border-rose-800/60 text-rose-200 text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                  title="Phím tắt: 1"
                >
                  <span>❓ Chưa nhớ</span>
                  <kbd className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-700/60 rounded-md text-[10px] text-rose-300 font-bold">1</kbd>
                </button>

                {/* 🟢 Button 2: Lật thẻ [Space] */}
                <button
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="py-3 px-2 rounded-2xl bg-[#4a5f28] hover:bg-[#577030] border border-lime-600/60 text-lime-100 text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                  title="Phím tắt: Space"
                >
                  <RotateCw className="w-4 h-4 text-lime-200" />
                  <span>Lật thẻ</span>
                  <kbd className="px-1.5 py-0.5 bg-lime-950/80 border border-lime-700/60 rounded-md text-[10px] text-lime-300 font-bold">Space</kbd>
                </button>

                {/* 🟢 Button 3: Đã nhớ [2] */}
                <button
                  onClick={handleMarkRemembered}
                  className="py-3 px-2 rounded-2xl bg-[#1e4428] hover:bg-[#255532] border border-emerald-700/60 text-emerald-200 text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                  title="Phím tắt: 2"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã nhớ</span>
                  <kbd className="px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-600/60 rounded-md text-[10px] text-emerald-300 font-bold">2</kbd>
                </button>

              </div>

              {/* ⌨️ KEYBOARD SHORTCUTS HINT BAR */}
              <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-500 py-1 flex-wrap">
                <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">SPACE</kbd> LẬT THẺ</span>
                <span>•</span>
                <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">1</kbd> CHƯA NHỚ</span>
                <span>•</span>
                <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">2</kbd> ĐÃ NHỚ</span>
                <span>•</span>
                <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">← / →</kbd> ĐIỀU HƯỚNG</span>
              </div>

              {/* 📊 PROGRESS BAR */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs font-black text-slate-400">
                  <span>Thẻ <strong className="text-white">{currentIndex + 1}</strong> / {totalCardsInSet}</span>
                  <span>{Math.round(((currentIndex + 1) / (totalCardsInSet || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / (totalCardsInSet || 1)) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* 🌟 RIGHT SIDE COMPANION PANELS (4 COLS) */}
            <div className="lg:col-span-4 space-y-3">
              
              {/* 1. TID / LULU & MIMI ĐỒNG HÀNH WIDGET */}
              <div className="bg-gradient-to-b from-[#182a46] to-[#101d32] border border-blue-500/20 rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-3">
                {/* Floating sparkle background */}
                <div className="absolute top-2 right-2 text-blue-300/30 text-xs">✨</div>
                <div className="absolute bottom-4 right-6 text-blue-300/20 text-sm">✦</div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    LULU & MIMI ĐỒNG HÀNH
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-400/30 flex items-center justify-center text-sm shadow-xs">
                    🐱
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white leading-snug">
                    Cố lên, chinh phục cả bộ từ nào! 🌱
                  </h4>
                  <p className="text-xs text-blue-200/80 mt-1 font-medium">
                    Học ngắt quãng hàng ngày giúp bạn nhớ lâu hơn gấp 3 lần.
                  </p>
                </div>

                <div className="inline-block px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-400/20 text-xs font-black text-blue-300">
                  Còn lại <strong className="text-amber-400">{unmasteredCardsInSet}</strong> từ chưa thuộc
                </div>
              </div>

              {/* 2. MỨC ĐỘ THÀNH THẠO (PROGRESS & MASTERY RING) */}
              <div className="bg-[#18201a] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    MỨC ĐỘ THÀNH THẠO
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cấp {masteryLevel}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Radial Progress Ring */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-400 transition-all duration-500"
                        strokeDasharray={`${masteryPercentage}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-white">
                      {masteryPercentage}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-300">
                      Bạn đã thuộc <strong className="text-amber-400">{masteredCardsInSet}/{totalCardsInSet}</strong> từ trong bộ này.
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1.5 flex-1 rounded-full ${
                            lvl <= masteryLevel ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. BỘ ĐIỀU HƯỚNG TRƯỚC / SAU (COMPACT) */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handlePrev}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black text-slate-200 transition cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>

                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition shadow-md cursor-pointer active:scale-95"
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* ════════ BOTTOM PRACTICE MODES STRIP (CHẾ ĐỘ LUYỆN TẬP) ════════ */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              CHẾ ĐỘ LUYỆN TẬP MỞ RỘNG
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              <div className="bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">3D Flashcard</div>
                  <div className="text-[10px] text-amber-300/80 font-bold">Đang học</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 hover:border-slate-700 transition cursor-pointer">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Luyện Nghe</div>
                  <div className="text-[10px] text-slate-400 font-bold">Phát âm chuẩn</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 hover:border-slate-700 transition cursor-pointer">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Trắc Nghiệm</div>
                  <div className="text-[10px] text-slate-400 font-bold">Kiểm tra nhớ</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 hover:border-slate-700 transition cursor-pointer">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Sổ Ghi Chú</div>
                  <div className="text-[10px] text-slate-400 font-bold">Xem danh sách</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
