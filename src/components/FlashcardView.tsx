import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Headphones,
  HelpCircle,
  Star,
  Bookmark
} from 'lucide-react';
import { calculateNextSRS, isCardDue, formatSRSCountdown, getMemoryLevelName } from '../utils/srs';
import { ThemeVibe, THEME_CONFIGS } from '../config/themes';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  topics: Topic[];
  selectedTopic: TopicId | string;
  masteredIds: string[];
  needReviewIds: string[];
  srsRecords?: { [cardId: string]: SRSCardData };
  initialFilter?: 'all' | 'due_srs' | 'unmastered' | 'review' | 'mastered';
  onToggleMastered: (cardId: string) => void;
  onToggleNeedReview: (cardId: string) => void;
  onRateCardSRS?: (cardId: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  onMoveCardToFolder?: (cardId: string, newTopicId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onEditCard?: (updatedCard: Flashcard) => void;
  onOpenQuickAdd?: () => void;
  themeVibe?: ThemeVibe;
  onSelectThemeVibe?: (vibe: ThemeVibe) => void;
  onSelectStatusFilter?: (filter: 'all' | 'due_srs' | 'unmastered' | 'review' | 'mastered') => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcards,
  topics,
  selectedTopic,
  masteredIds,
  needReviewIds,
  srsRecords = {},
  initialFilter = 'all',
  onToggleMastered,
  onToggleNeedReview,
  onRateCardSRS,
  onMoveCardToFolder,
  onDeleteCard,
  onEditCard,
  onOpenQuickAdd,
  themeVibe: controlledThemeVibe,
  onSelectThemeVibe,
  onSelectStatusFilter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedVocabType, setSelectedVocabType] = useState<VocabType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_srs' | 'unmastered' | 'review' | 'mastered'>(initialFilter);
  const [cardsList, setCardsList] = useState<Flashcard[]>([]);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    setStatusFilter(initialFilter);
  }, [initialFilter]);

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

  // Theme Vibe state
  const THEME_VIBE_KEY = 'lulu_mimi_card_theme_vibe_v5';
  const [localThemeVibe, setLocalThemeVibe] = useState<ThemeVibe>(() => {
    try {
      const saved = localStorage.getItem(THEME_VIBE_KEY) as ThemeVibe;
      if (saved && THEME_CONFIGS[saved]) return saved;
    } catch {}
    return 'amber-gold';
  });

  const activeThemeVibe = controlledThemeVibe || localThemeVibe;
  const currentTheme = THEME_CONFIGS[activeThemeVibe] || THEME_CONFIGS['amber-gold'];

  const changeThemeVibe = (newVibe: ThemeVibe) => {
    setLocalThemeVibe(newVibe);
    try { localStorage.setItem(THEME_VIBE_KEY, newVibe); } catch {}
    if (onSelectThemeVibe) {
      onSelectThemeVibe(newVibe);
    }
  };

  // Custom Companion Avatar (Upload from device)
  const CUSTOM_AVATAR_KEY = 'lulu_mimi_custom_companion_avatar';
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_AVATAR_KEY);
    } catch {
      return null;
    }
  });

  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCustomAvatar(base64);
        try {
          localStorage.setItem(CUSTOM_AVATAR_KEY, base64);
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomAvatar(null);
    try {
      localStorage.removeItem(CUSTOM_AVATAR_KEY);
    } catch {}
  };

  // Sound Engine
  const playNativeSound = useCallback((type: 'flip' | 'master' | 'again' | 'swoosh') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'master') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'again') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(240, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // AudioContext muted or not allowed
    }
  }, []);

  // Filter Cards
  useEffect(() => {
    let filtered = flashcards;

    if (selectedTopic !== 'all') {
      filtered = filtered.filter((card) => card.topic === selectedTopic);
    }

    if (selectedVocabType !== 'all') {
      filtered = filtered.filter((card) => card.vocabType === selectedVocabType);
    }

    if (statusFilter === 'due_srs') {
      filtered = filtered.filter((card) => isCardDue(srsRecords[card.id]));
    } else if (statusFilter === 'unmastered') {
      filtered = filtered.filter((card) => !masteredIds.includes(card.id));
    } else if (statusFilter === 'review') {
      filtered = filtered.filter((card) => needReviewIds.includes(card.id));
    } else if (statusFilter === 'mastered') {
      filtered = filtered.filter((card) => masteredIds.includes(card.id));
    }

    setCardsList(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards, selectedTopic, selectedVocabType, statusFilter, masteredIds, needReviewIds, srsRecords]);

  // Current Card
  const currentCard = cardsList[currentIndex] || null;

  // Speak word
  const speakText = useCallback(
    (text: string, accent: 'US' | 'UK' = preferredAccent) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [preferredAccent]
  );

  // Play pronunciation from audio URL or fallback
  const playPronunciation = useCallback(
    (accent: 'US' | 'UK' = preferredAccent) => {
      if (!currentCard) return;
      const audioUrl = accent === 'UK' ? currentCard.audioUk : currentCard.audioUs;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => speakText(currentCard.front, accent));
      } else {
        speakText(currentCard.front, accent);
      }
    },
    [currentCard, preferredAccent, speakText]
  );

  // Auto-play pronunciation when card changes
  useEffect(() => {
    if (autoPlayAudio && currentCard && !isFlipped) {
      const timer = setTimeout(() => {
        playPronunciation(preferredAccent);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoPlayAudio, currentCard, preferredAccent, playPronunciation, isFlipped]);

  // Card Animation state
  const [animDirection, setAnimDirection] = useState<'next' | 'prev' | null>(null);

  const nextCard = useCallback(() => {
    if (cardsList.length <= 1) return;
    setAnimDirection('next');
    playNativeSound('swoosh');
    setTimeout(() => {
      setIsFlipped(false);
      setCurrentIndex((prev) => (prev + 1) % cardsList.length);
      setAnimDirection(null);
    }, 120);
  }, [cardsList.length, playNativeSound]);

  const prevCard = useCallback(() => {
    if (cardsList.length <= 1) return;
    setAnimDirection('prev');
    playNativeSound('swoosh');
    setTimeout(() => {
      setIsFlipped(false);
      setCurrentIndex((prev) => (prev - 1 + cardsList.length) % cardsList.length);
      setAnimDirection(null);
    }, 120);
  }, [cardsList.length, playNativeSound]);

  const flipCard = useCallback(() => {
    playNativeSound('flip');
    setIsFlipped((prev) => !prev);
  }, [playNativeSound]);

  const shuffleCards = () => {
    playNativeSound('swoosh');
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard Shortcuts (Space: flip, 1: unmastered, 2: mastered, Left/Right: nav)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        flipCard();
      } else if (e.key === '1') {
        e.preventDefault();
        if (currentCard) {
          playNativeSound('again');
          if (onRateCardSRS) onRateCardSRS(currentCard.id, 1);
          if (masteredIds.includes(currentCard.id)) onToggleMastered(currentCard.id);
          nextCard();
        }
      } else if (e.key === '2') {
        e.preventDefault();
        if (currentCard) {
          playNativeSound('master');
          if (onRateCardSRS) onRateCardSRS(currentCard.id, 4);
          if (!masteredIds.includes(currentCard.id)) onToggleMastered(currentCard.id);
          nextCard();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipCard, nextCard, prevCard, currentCard, onRateCardSRS, masteredIds, onToggleMastered, playNativeSound]);

  // Direct In-Card Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Flashcard>>({});

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    setEditForm({ ...currentCard });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || !onEditCard) return;
    const updated: Flashcard = {
      ...currentCard,
      ...editForm,
      front: editForm.front?.trim() || currentCard.front,
      back: editForm.back?.trim() || currentCard.back,
    };
    onEditCard(updated);
    setIsEditing(false);
  };

  const currentTopic = topics.find((t) => t.id === selectedTopic);
  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;
  const isCurrentNeedReview = currentCard ? needReviewIds.includes(currentCard.id) : false;
  const currentCardSRS = currentCard ? srsRecords[currentCard.id] : undefined;

  // Animation CSS class
  const animClass =
    animDirection === 'next'
      ? 'opacity-0 translate-x-12 scale-95 duration-150'
      : animDirection === 'prev'
      ? 'opacity-0 -translate-x-12 scale-95 duration-150'
      : 'opacity-100 translate-x-0 scale-100 duration-200';

  const masteredTotalInFolder = useMemo(() => {
    return flashcards.filter(c => (selectedTopic === 'all' || c.topic === selectedTopic) && masteredIds.includes(c.id)).length;
  }, [flashcards, selectedTopic, masteredIds]);

  const totalInFolder = useMemo(() => {
    return flashcards.filter(c => (selectedTopic === 'all' || c.topic === selectedTopic)).length;
  }, [flashcards, selectedTopic]);

  const masteredPercent = totalInFolder > 0 ? Math.round((masteredTotalInFolder / totalInFolder) * 100) : 0;
  const unmasteredCount = Math.max(0, totalInFolder - masteredTotalInFolder);

  const cardIpa = useMemo(() => {
    const raw = (currentCard?.pronunciationUs || currentCard?.pronunciationUk || '').trim();
    if (!raw) return '';
    if (raw === '//' || raw === '/.../' || raw === '/ /') return '';
    return raw;
  }, [currentCard]);

  const hasIpa = Boolean(cardIpa && cardIpa.length > 2);

  return (
    <div className="w-full max-w-[1680px] mx-auto px-2 sm:px-6 xl:px-8 py-2 sm:py-4 flex flex-col justify-center min-h-[calc(100vh-70px)] space-y-6 font-sans">
      
      {/* ════════ TOP BREADCRUMB & TOOLBAR (ENLARGED 5 SIZES) ════════ */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${currentTheme.topBarBorder}`}>
        
        {/* Left: Breadcrumbs & Topic Name */}
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>ĐANG HỌC</span>
              <span>•</span>
              <span>BỘ THẺ</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {currentTopic?.title || 'Tất Cả Thư Mục'}
              </h2>
              <span className="px-3 py-1 rounded-xl bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-black uppercase">
                {currentCard?.vocabType || 'word'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Preferences (Enlarged Buttons) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Trộn thẻ */}
          <button
            onClick={shuffleCards}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm sm:text-base font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-95 shadow-sm"
            title="Trộn ngẫu nhiên danh sách thẻ"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Trộn thẻ</span>
          </button>

          {/* Tự động phát âm toggle */}
          <label className="flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm sm:text-base font-black text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm">
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Tự động phát âm</span>
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={toggleAutoPlayAudio}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          {/* Giọng phát âm dropdown */}
          <select
            value={preferredAccent}
            onChange={(e) => setPreferredAccent(e.target.value as 'US' | 'UK')}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm sm:text-base font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer shadow-sm"
          >
            <option value="US">🎙️ Giọng: US (Mỹ)</option>
            <option value="UK">🎙️ Giọng: UK (Anh)</option>
          </select>

          {/* 🎨 Theme Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm sm:text-base font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
              title="Đổi Vibe Giao Diện"
            >
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span className="hidden sm:inline">{currentTheme.emoji}</span>
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-black uppercase text-slate-400 px-2 py-1">
                  Chọn Vibe Màu Toàn Bộ
                </div>
                {Object.values(THEME_CONFIGS).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      changeThemeVibe(theme.id);
                      setShowThemePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      activeThemeVibe === theme.id
                        ? 'bg-white/20 text-white'
                        : 'text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${theme.dotClass}`} />
                      <span>{theme.emoji} {theme.label}</span>
                    </span>
                    {activeThemeVibe === theme.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add */}
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className={`flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 ${currentTheme.nextBtnBg} text-sm sm:text-base font-black rounded-2xl shadow-md transition cursor-pointer active:scale-95`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Thêm từ</span>
            </button>
          )}

        </div>
      </div>

      {cardsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {statusFilter === 'due_srs' ? '🎉 Bạn đã ôn tập xong các từ đến hạn hôm nay!' : 'Không có từ nào trong bộ lọc này'}
          </h3>
          <button
            onClick={() => {
              setStatusFilter('all');
              if (onSelectStatusFilter) onSelectStatusFilter('all');
            }}
            className={`px-5 py-2.5 ${currentTheme.nextBtnBg} text-xs font-black rounded-xl transition cursor-pointer shadow-md`}
          >
            Xem Tất Cả Flashcards
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* ════════ MAIN GRID: WIDE FLASHCARD (LEFT 75%) + COMPANION WIDGETS (RIGHT 25%) ════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* 🎴 WIDE FLASHCARD CENTER STAGE (9 COLS - EXPANSIVE HORIZONTAL REACH) */}
            <div className="lg:col-span-9 xl:col-span-9 space-y-4 flex flex-col">
              
              {/* WIDE HORIZONTAL CARD CONTAINER (RỘNG VÀ CAO CÂN ĐỐI - KHÔNG CẦN CUỘN) */}
              <div className={`perspective-[1200px] w-full h-[540px] sm:h-[600px] lg:h-[650px] relative select-none ${animClass}`}>
                
                {/* ✏️ IN-CARD EDITOR OVERLAY */}
                {isEditing ? (
                  <div className="w-full h-full bg-slate-900/95 border-2 border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col justify-between text-white animate-in zoom-in-95 duration-150 z-30">
                    <form onSubmit={handleSaveEdit} className="space-y-3 my-auto text-white">
                      <div className="flex items-center justify-between pb-2 border-b border-white/15">
                        <span className="text-xs font-black uppercase text-yellow-300 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" /> Sửa Từ Vựng Trực Tiếp
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Từ vựng *</label>
                          <input
                            type="text"
                            value={editForm.front || ''}
                            onChange={(e) => setEditForm({ ...editForm, front: e.target.value })}
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-black text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Phiên âm IPA</label>
                          <input
                            type="text"
                            value={editForm.pronunciationUs || ''}
                            onChange={(e) => setEditForm({ ...editForm, pronunciationUs: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Loại từ</label>
                          <select
                            value={editForm.wordForm || 'noun'}
                            onChange={(e) => setEditForm({ ...editForm, wordForm: e.target.value as WordForm })}
                            className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
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
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Nghĩa tiếng Việt *</label>
                          <input
                            type="text"
                            value={editForm.back || ''}
                            onChange={(e) => setEditForm({ ...editForm, back: e.target.value })}
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Định nghĩa tiếng Anh</label>
                        <textarea
                          rows={2}
                          value={editForm.definitionEn || ''}
                          onChange={(e) => setEditForm({ ...editForm, definitionEn: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Câu ví dụ (English)</label>
                          <input
                            type="text"
                            value={editForm.example || ''}
                            onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Dịch ví dụ (Tiếng Việt)</label>
                          <input
                            type="text"
                            value={editForm.exampleVi || ''}
                            onChange={(e) => setEditForm({ ...editForm, exampleVi: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 rounded-xl cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer hover:bg-amber-300"
                        >
                          Lưu Thay Đổi
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div
                    className="w-full h-full cursor-pointer select-none"
                    onClick={flipCard}
                  >
                    <div
                      className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      
                      {/* ──────────────── FRONT FACE (MẶT TRƯỚC: TỪ VỰNG TO ĐẬM HOÀNG GIA) ──────────────── */}
                      <div
                        className={`card-face-front rounded-3xl ${currentTheme.frontBg} border-2 ${currentTheme.frontBorder} p-6 sm:p-10 flex flex-col justify-between overflow-hidden ${
                          isFlipped ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg) translate3d(0, 0, 0)',
                          transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out'
                        }}
                      >
                        {/* Front Top Bar */}
                        <div className="flex items-center justify-between">
                          {/* Part of Speech Pill - TĂNG 3 SIZE */}
                          <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-black/85 text-white flex items-center justify-center font-black text-sm sm:text-base tracking-wider shadow-lg border-2 border-white/20 uppercase">
                            {currentCard?.wordForm ? currentCard.wordForm : 'word'}
                          </div>

                          {/* Controls (Speaker, Bookmark, Edit) */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playPronunciation(preferredAccent);
                              }}
                              className={`w-11 h-11 rounded-2xl ${currentTheme.frontControlBtn} flex items-center justify-center transition cursor-pointer active:scale-90`}
                              title="Phát âm từ vựng"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentCard) onToggleNeedReview(currentCard.id);
                              }}
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition cursor-pointer active:scale-90 ${
                                isCurrentNeedReview ? 'bg-amber-400 text-slate-950 shadow-md' : currentTheme.frontControlBtn
                              }`}
                              title={isCurrentNeedReview ? 'Đã đánh dấu cần ôn tập' : 'Đánh dấu cần ôn tập'}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </button>

                            <button
                              onClick={handleStartEdit}
                              className={`w-11 h-11 rounded-2xl ${currentTheme.frontControlBtn} flex items-center justify-center transition cursor-pointer active:scale-90`}
                              title="Chỉnh sửa từ vựng này"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Front Center: BIG BOLD WORD + IPA PHONETICS */}
                        <div className="my-auto text-center space-y-4">
                          <h1 className={`text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight ${currentTheme.frontTextColor} drop-shadow-xs leading-none`}>
                            {currentCard?.front}
                          </h1>

                          {/* Phonetic transcription badge (Chỉ hiện khi có IPA hợp lệ, không hiện // hoặc /.../) */}
                          {hasIpa ? (
                            <div className="flex items-center justify-center gap-2.5">
                              <span className={`text-lg sm:text-2xl font-mono font-bold tracking-wider ${currentTheme.frontIpaBg} px-6 py-2 rounded-full shadow-xs`}>
                                {cardIpa}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playPronunciation(preferredAccent);
                                }}
                                className={`p-2 rounded-full ${currentTheme.frontControlBtn} transition cursor-pointer active:scale-90`}
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playPronunciation(preferredAccent);
                                }}
                                className={`p-2 rounded-full ${currentTheme.frontControlBtn} transition cursor-pointer active:scale-90`}
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}

                          {/* Topic Hashtag */}
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black ${currentTheme.frontTagBg} ${currentTheme.frontTagText}`}>
                              <span>#</span>
                              <span>{currentTopic?.title || 'Từ vựng'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Front Bottom Bar: Mascot on left, Flip hint on right */}
                        <div className="flex items-center justify-between pt-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              avatarFileInputRef.current?.click();
                            }}
                            className={`w-16 h-16 rounded-2xl ${currentTheme.mascotBg} overflow-hidden flex items-center justify-center text-4xl shadow-lg transform -rotate-6 hover:rotate-0 transition-transform cursor-pointer group`}
                            title="Nhấn để đổi ảnh avatar từ thiết bị"
                          >
                            {customAvatar ? (
                              <img src={customAvatar} alt="Mascot" className="w-full h-full object-cover" />
                            ) : (
                              <span>{currentTheme.mascotEmoji}</span>
                            )}
                          </div>

                          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-black ${currentTheme.frontHintText} group`}>
                            <span>Nhấn để xem nghĩa</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                      </div>

                      {/* ──────────────── BACK FACE (MẶT SAU: THẤY HẾT TOÀN BỘ KHÔNG CẦN CUỘN) ──────────────── */}
                      <div
                        className={`card-face-back rounded-3xl ${currentTheme.backBg} border-2 ${currentTheme.backBorder} p-5 sm:p-7 flex flex-col justify-between overflow-hidden ${
                          !isFlipped ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg) translate3d(0, 0, 0)',
                          transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out'
                        }}
                      >
                        {/* Back Top Bar (Hiển thị loại từ + Từ vựng + IPA + Nghĩa tiếng Việt) */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-white/15 shrink-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Part of Speech Pill */}
                            <div className="px-3.5 py-1.5 rounded-xl bg-black/80 text-white flex items-center justify-center font-black text-xs sm:text-sm tracking-wider shadow-md border-2 border-white/20 uppercase">
                              {currentCard?.wordForm ? currentCard.wordForm : 'word'}
                            </div>

                            {/* Từ vựng + Phiên âm IPA ở mặt sau */}
                            <div className="flex items-center gap-2 bg-black/35 px-3 py-1 rounded-xl border border-white/15">
                              <span className="text-sm sm:text-base font-black text-yellow-300">
                                {currentCard?.front}
                              </span>
                              {hasIpa && (
                                <span className="text-xs sm:text-sm font-mono font-bold text-slate-200">
                                  {cardIpa}
                                </span>
                              )}
                            </div>

                            {/* Nghĩa tiếng Việt */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/30 text-lime-300 border border-lime-400/30">
                                🇻🇳 NGHĨA
                              </span>
                              <span className="text-sm sm:text-lg font-black text-white leading-tight">
                                {currentCard?.back}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playPronunciation(preferredAccent);
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleStartEdit}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                              title="Sửa từ này"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Back Content Body (Phân bổ gọn gàng để nhìn hết) */}
                        <div className="my-auto space-y-2.5 py-1 flex-1 flex flex-col justify-center">
                          
                          {/* 🇬🇧 English Definition Box (TO RÕ RÀNG) */}
                          {currentCard?.definitionEn && (
                            <div className={`p-3.5 sm:p-4 rounded-xl ${currentTheme.backBoxBg} border-2 ${currentTheme.backBoxBorder} space-y-1 shadow-sm`}>
                              <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
                                <span>Definition</span>
                              </div>
                              <p className="text-sm sm:text-base lg:text-lg font-bold text-white leading-snug tracking-wide">
                                {currentCard.definitionEn}
                              </p>
                            </div>
                          )}

                          {/* Example Box */}
                          {currentCard?.example && (
                            <div className={`p-3 sm:p-3.5 rounded-xl ${currentTheme.backBoxBg} border ${currentTheme.backBoxBorder} space-y-0.5`}>
                              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-300">
                                Example
                              </div>
                              <p className="text-xs sm:text-sm italic font-semibold text-white leading-tight">
                                "{currentCard.example}"
                              </p>
                            </div>
                          )}

                          {/* 🔗 Dedicated Box: COLLOCATIONS */}
                          {currentCard?.collocations && currentCard.collocations.length > 0 && (
                            <div className={`p-2.5 sm:p-3 rounded-xl ${currentTheme.backBoxBg} border ${currentTheme.backBoxBorder} space-y-1.5`}>
                              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-300">
                                Collocations
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {currentCard.collocations.map((col, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-lg bg-black/40 text-yellow-200 text-xs sm:text-sm font-bold border border-yellow-400/25 tracking-tight"
                                  >
                                    {col}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ⚖️ Dedicated Box: SYNONYMS & ANTONYMS */}
                          {((currentCard?.synonyms && currentCard.synonyms.length > 0) || (currentCard?.antonyms && currentCard.antonyms.length > 0)) && (
                            <div className={`p-2.5 sm:p-3 rounded-xl ${currentTheme.backBoxBg} border ${currentTheme.backBoxBorder} space-y-1.5`}>
                              {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] font-black uppercase text-lime-300 tracking-wider min-w-[80px]">
                                    Synonyms:
                                  </span>
                                  <div className="flex flex-wrap gap-1 flex-1">
                                    {currentCard.synonyms.map((syn, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2.5 py-0.5 rounded-md bg-black/35 text-lime-200 text-xs sm:text-sm font-bold border border-lime-400/20"
                                      >
                                        {syn}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {currentCard.antonyms && currentCard.antonyms.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
                                  <span className="text-[11px] font-black uppercase text-rose-300 tracking-wider min-w-[80px]">
                                    Antonyms:
                                  </span>
                                  <div className="flex flex-wrap gap-1 flex-1">
                                    {currentCard.antonyms.map((ant, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2.5 py-0.5 rounded-md bg-black/35 text-rose-200 text-xs sm:text-sm font-bold border border-rose-400/20"
                                      >
                                        {ant}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 🌳 Dedicated Box: WORD FORMS */}
                          {((currentCard?.wordForms && currentCard.wordForms.length > 0) || (currentCard?.wordFamily && currentCard.wordFamily.length > 0)) && (
                            <div className={`p-2.5 sm:p-3 rounded-xl ${currentTheme.backBoxBg} border ${currentTheme.backBoxBorder} space-y-1`}>
                              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-300">
                                Word Forms
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                {(currentCard.wordForms || currentCard.wordFamily || []).map((wf, idx) => (
                                  <div
                                    key={idx}
                                    className="px-2 py-1 rounded-lg bg-black/40 border border-white/15 space-y-0.5"
                                  >
                                    <span className="text-[9px] font-black uppercase tracking-wider text-yellow-400/90 block">
                                      {wf.form}
                                    </span>
                                    <span className="text-xs font-bold text-white block truncate">
                                      {wf.word}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Back Bottom Bar */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-white/15 text-[11px] text-white/80 font-bold shrink-0">
                          <span>
                            {currentCardSRS ? `Ôn tiếp: ${formatSRSCountdown(currentCardSRS.nextReviewDate)}` : 'Trạng thái: Mới học'}
                          </span>
                          <span className="flex items-center gap-1">
                            <RotateCw className="w-3 h-3" />
                            <span>Chạm để lật lại</span>
                          </span>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* ════════ 3 COMPACT SLEEK ACTION BUTTONS (THU NHỎ 5 SIZE & ĐẨY GẦN DƯỚI) ════════ */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 sm:pt-4">
                
                {/* 1. Chưa nhớ */}
                <button
                  onClick={() => {
                    if (currentCard) {
                      playNativeSound('again');
                      if (onRateCardSRS) onRateCardSRS(currentCard.id, 1);
                      if (masteredIds.includes(currentCard.id)) onToggleMastered(currentCard.id);
                      nextCard();
                    }
                  }}
                  className={`h-10 sm:h-11 rounded-xl ${currentTheme.btn1Bg} border ${currentTheme.btn1Border} ${currentTheme.btn1Text} flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95`}
                >
                  <span className="text-xs">❓</span>
                  <span>Chưa nhớ</span>
                  <span className={`px-1.5 py-0.5 rounded-md ${currentTheme.btn1Kbd} text-[9px] font-mono font-bold`}>
                    1
                  </span>
                </button>

                {/* 2. Lật thẻ */}
                <button
                  onClick={flipCard}
                  className={`h-10 sm:h-11 rounded-xl ${currentTheme.btnSpaceBg} border ${currentTheme.btnSpaceBorder} ${currentTheme.btnSpaceText} flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Lật thẻ</span>
                  <span className={`px-1.5 py-0.5 rounded-md ${currentTheme.btnSpaceKbd} text-[9px] font-mono font-bold`}>
                    Space
                  </span>
                </button>

                {/* 3. Đã nhớ */}
                <button
                  onClick={() => {
                    if (currentCard) {
                      playNativeSound('master');
                      if (onRateCardSRS) onRateCardSRS(currentCard.id, 4);
                      if (!masteredIds.includes(currentCard.id)) onToggleMastered(currentCard.id);
                      nextCard();
                    }
                  }}
                  className={`h-10 sm:h-11 rounded-xl ${currentTheme.btn2Bg} border ${currentTheme.btn2Border} ${currentTheme.btn2Text} flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95`}
                >
                  <span className="text-xs">✓</span>
                  <span>Đã nhớ</span>
                  <span className={`px-1.5 py-0.5 rounded-md ${currentTheme.btn2Kbd} text-[9px] font-mono font-bold`}>
                    2
                  </span>
                </button>

              </div>

              {/* Keyboard Shortcuts Bar (Nhỏ gọn thanh lịch) */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 py-1">
                <span><strong className="text-slate-700 dark:text-slate-200">SPACE:</strong> LẬT THẺ</span>
                <span>•</span>
                <span><strong className="text-slate-700 dark:text-slate-200">1:</strong> CHƯA NHỚ</span>
                <span>•</span>
                <span><strong className="text-slate-700 dark:text-slate-200">2:</strong> ĐÃ NHỚ</span>
                <span>•</span>
                <span><strong className="text-slate-700 dark:text-slate-200">← / →:</strong> ĐIỀU HƯỚNG</span>
              </div>

            </div>

            {/* ════════ RIGHT COLUMN: COMPANION WIDGETS (3 COLS, SCALED DOWN 80% & SNUG) ════════ */}
            <div className="lg:col-span-3 xl:col-span-3 space-y-3 flex flex-col items-end w-full">
              <div className="w-full space-y-3">
                
                {/* 1. LULU & MIMI ĐỒNG HÀNH WIDGET (COMPACT 80%) */}
                <div className={`rounded-2xl ${currentTheme.companion1Bg} border-2 ${currentTheme.companion1Border} p-4 sm:p-4.5 text-white space-y-2 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${currentTheme.companion1TagBg} ${currentTheme.companion1TagText}`}>
                      LULU & MIMI ĐỒNG HÀNH
                    </span>
                    
                    {/* Interactive Avatar with Upload */}
                    <div className="relative group">
                      <input
                        type="file"
                        ref={avatarFileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          avatarFileInputRef.current?.click();
                        }}
                        className="relative w-8 h-8 rounded-xl bg-amber-400 overflow-hidden flex items-center justify-center text-sm shadow-xs cursor-pointer hover:ring-2 hover:ring-white transition-all active:scale-95"
                        title="Nhấn để tải ảnh đại diện từ thiết bị của bạn"
                      >
                        {customAvatar ? (
                          <img src={customAvatar} alt="Companion Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{currentTheme.companion1Mascot}</span>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[11px] text-white">
                          📷
                        </div>
                      </button>

                      {/* Reset custom avatar button if set */}
                      {customAvatar && (
                        <button
                          type="button"
                          onClick={handleRemoveCustomAvatar}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black shadow-sm hover:bg-rose-600 transition cursor-pointer"
                          title="Gỡ ảnh tùy chỉnh (dùng lại icon theme)"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                      Cố lên, chinh phục cả bộ từ nào! 🌱
                    </h3>
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-black/40 text-[10px] sm:text-[11px] font-black text-yellow-300">
                      Còn lại {unmasteredCount} từ chưa thuộc
                    </div>
                  </div>
                </div>

                {/* 2. MỨC ĐỘ THÀNH THẠO WIDGET (COMPACT 80%) */}
                <div className={`rounded-2xl ${currentTheme.companion2Bg} border-2 ${currentTheme.companion2Border} p-4 sm:p-4.5 space-y-3 shadow-sm`}>
                  
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      MỨC ĐỘ THÀNH THẠO
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[9px] sm:text-[10px] font-black">
                      Cấp {Math.min(5, Math.floor(masteredPercent / 20) + 1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Percent Circle (Compact) */}
                    <div className="relative w-11 h-11 rounded-full border-3 border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-amber-400 stroke-current transition-all duration-500"
                          strokeWidth="4"
                          strokeDasharray={`${masteredPercent}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {masteredPercent}%
                      </span>
                    </div>

                    {/* Level text */}
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                        Thuộc <strong className="text-amber-500">{masteredTotalInFolder}</strong>/{totalInFolder} từ trong bộ.
                      </p>
                      {/* 5 progress bars */}
                      <div className="grid grid-cols-5 gap-1 pt-0.5">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-1.5 rounded-full transition-colors ${
                              masteredPercent >= lvl * 20 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons (‹ Trước | Tiếp theo ›) */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={prevCard}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Trước</span>
                    </button>

                    <button
                      onClick={nextCard}
                      className={`flex items-center justify-center gap-1 py-2 rounded-xl ${currentTheme.nextBtnBg} text-xs font-black transition cursor-pointer active:scale-95 shadow-xs`}
                    >
                      <span>Tiếp theo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* ════════ BOTTOM PROGRESS CONTINUOUS BAR (SÁT ĐÁY MÀN HÌNH) ════════ */}
          <div className="space-y-1 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
              <span>Thẻ {currentIndex + 1} / {cardsList.length}</span>
              <span className="text-amber-500">
                {cardsList.length > 0 ? Math.round(((currentIndex + 1) / cardsList.length) * 100) : 0}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
              <div
                className={`h-full ${currentTheme.progressBarColor} transition-all duration-300 rounded-full`}
                style={{
                  width: `${cardsList.length > 0 ? ((currentIndex + 1) / cardsList.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
