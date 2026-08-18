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
  Sparkle
} from 'lucide-react';
import { calculateNextSRS, isCardDue, formatSRSCountdown, getMemoryLevelName, previewNextInterval } from '../utils/srs';

export type ThemeVibe = 'blue' | 'rose' | 'amber' | 'purple' | 'emerald';

interface ThemeConfig {
  id: ThemeVibe;
  label: string;
  emoji: string;
  dotClass: string;
  pillActiveClass: string;
  
  // Front card styling
  frontBg: string;
  frontBorder: string;
  frontHoverBorder: string;
  frontGlow: string;
  frontAccentText: string;
  frontIpaBg: string;
  frontIpaText: string;
  frontIpaBorder: string;

  // Back card styling
  backBg: string;
  backBorder: string;
  backGlow: string;
  backBadgeBg: string;
  backBadgeText: string;
  backBadgeBorder: string;

  // Buttons & Controls
  primaryBtnGradient: string;
  primaryBtnShadow: string;
  audioBtnUs: string;
  audioBtnUk: string;
}

const THEME_CONFIGS: Record<ThemeVibe, ThemeConfig> = {
  blue: {
    id: 'blue',
    label: 'Xanh Dương',
    emoji: '🌊',
    dotClass: 'bg-blue-500',
    pillActiveClass: 'bg-blue-500 text-white shadow-xs',
    frontBg: 'bg-gradient-to-br from-sky-50 via-blue-50/70 to-white dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-950',
    frontBorder: 'border-blue-200/90 dark:border-blue-900/60',
    frontHoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
    frontGlow: 'hover:shadow-blue-300/40 dark:hover:shadow-blue-900/40 hover:shadow-2xl',
    frontAccentText: 'text-blue-600 dark:text-blue-400',
    frontIpaBg: 'bg-blue-100/70 dark:bg-blue-950/80',
    frontIpaText: 'text-blue-700 dark:text-blue-300',
    frontIpaBorder: 'border-blue-200 dark:border-blue-900',
    backBg: 'bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 dark:from-blue-950 dark:via-blue-900 dark:to-sky-950',
    backBorder: 'border-blue-400/60 dark:border-blue-700/60',
    backGlow: 'shadow-2xl shadow-blue-500/25',
    backBadgeBg: 'bg-white/20 text-white',
    backBadgeText: 'text-white',
    backBadgeBorder: 'border-white/30',
    primaryBtnGradient: 'bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600',
    primaryBtnShadow: 'shadow-blue-500/25',
    audioBtnUs: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-200',
    audioBtnUk: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800 hover:bg-sky-200',
  },
  rose: {
    id: 'rose',
    label: 'Đỏ Ruby',
    emoji: '🔥',
    dotClass: 'bg-rose-500',
    pillActiveClass: 'bg-rose-500 text-white shadow-xs',
    frontBg: 'bg-gradient-to-br from-rose-50 via-red-50/70 to-white dark:from-slate-900 dark:via-rose-950/40 dark:to-slate-950',
    frontBorder: 'border-rose-200/90 dark:border-rose-900/60',
    frontHoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
    frontGlow: 'hover:shadow-rose-300/40 dark:hover:shadow-rose-900/40 hover:shadow-2xl',
    frontAccentText: 'text-rose-600 dark:text-rose-400',
    frontIpaBg: 'bg-rose-100/70 dark:bg-rose-950/80',
    frontIpaText: 'text-rose-700 dark:text-rose-300',
    frontIpaBorder: 'border-rose-200 dark:border-rose-900',
    backBg: 'bg-gradient-to-br from-rose-600 via-red-500 to-amber-500 dark:from-rose-950 dark:via-rose-900 dark:to-red-950',
    backBorder: 'border-rose-400/60 dark:border-rose-700/60',
    backGlow: 'shadow-2xl shadow-rose-500/25',
    backBadgeBg: 'bg-white/20 text-white',
    backBadgeText: 'text-white',
    backBadgeBorder: 'border-white/30',
    primaryBtnGradient: 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600',
    primaryBtnShadow: 'shadow-rose-500/25',
    audioBtnUs: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-200',
    audioBtnUk: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-200',
  },
  amber: {
    id: 'amber',
    label: 'Vàng Gold',
    emoji: '✨',
    dotClass: 'bg-amber-500',
    pillActiveClass: 'bg-amber-500 text-white shadow-xs',
    frontBg: 'bg-gradient-to-br from-amber-50 via-yellow-50/70 to-white dark:from-slate-900 dark:via-amber-950/40 dark:to-slate-950',
    frontBorder: 'border-amber-200/90 dark:border-amber-900/60',
    frontHoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
    frontGlow: 'hover:shadow-amber-300/40 dark:hover:shadow-amber-900/40 hover:shadow-2xl',
    frontAccentText: 'text-amber-600 dark:text-amber-400',
    frontIpaBg: 'bg-amber-100/70 dark:bg-amber-950/80',
    frontIpaText: 'text-amber-800 dark:text-amber-300',
    frontIpaBorder: 'border-amber-200 dark:border-amber-900',
    backBg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 dark:from-amber-950 dark:via-amber-900 dark:to-yellow-950',
    backBorder: 'border-amber-300/60 dark:border-amber-700/60',
    backGlow: 'shadow-2xl shadow-amber-500/25',
    backBadgeBg: 'bg-white/20 text-white',
    backBadgeText: 'text-white',
    backBadgeBorder: 'border-white/30',
    primaryBtnGradient: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    primaryBtnShadow: 'shadow-amber-500/25',
    audioBtnUs: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200',
    audioBtnUk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800 hover:bg-yellow-200',
  },
  purple: {
    id: 'purple',
    label: 'Tím Violet',
    emoji: '🔮',
    dotClass: 'bg-purple-500',
    pillActiveClass: 'bg-purple-600 text-white shadow-xs',
    frontBg: 'bg-gradient-to-br from-purple-50 via-indigo-50/70 to-white dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-950',
    frontBorder: 'border-purple-200/90 dark:border-purple-900/60',
    frontHoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
    frontGlow: 'hover:shadow-purple-300/40 dark:hover:shadow-purple-900/40 hover:shadow-2xl',
    frontAccentText: 'text-purple-600 dark:text-purple-400',
    frontIpaBg: 'bg-purple-100/70 dark:bg-purple-950/80',
    frontIpaText: 'text-purple-800 dark:text-purple-300',
    frontIpaBorder: 'border-purple-200 dark:border-purple-900',
    backBg: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-500 dark:from-purple-950 dark:via-purple-900 dark:to-indigo-950',
    backBorder: 'border-purple-400/60 dark:border-purple-700/60',
    backGlow: 'shadow-2xl shadow-purple-500/25',
    backBadgeBg: 'bg-white/20 text-white',
    backBadgeText: 'text-white',
    backBadgeBorder: 'border-white/30',
    primaryBtnGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
    primaryBtnShadow: 'shadow-purple-500/25',
    audioBtnUs: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-200',
    audioBtnUk: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200',
  },
  emerald: {
    id: 'emerald',
    label: 'Xanh Mint',
    emoji: '🌿',
    dotClass: 'bg-emerald-500',
    pillActiveClass: 'bg-emerald-600 text-white shadow-xs',
    frontBg: 'bg-gradient-to-br from-emerald-50 via-teal-50/70 to-white dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-950',
    frontBorder: 'border-emerald-200/90 dark:border-emerald-900/60',
    frontHoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    frontGlow: 'hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/40 hover:shadow-2xl',
    frontAccentText: 'text-emerald-600 dark:text-emerald-400',
    frontIpaBg: 'bg-emerald-100/70 dark:bg-emerald-950/80',
    frontIpaText: 'text-emerald-800 dark:text-emerald-300',
    frontIpaBorder: 'border-emerald-200 dark:border-emerald-900',
    backBg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950',
    backBorder: 'border-emerald-400/60 dark:border-emerald-700/60',
    backGlow: 'shadow-2xl shadow-emerald-500/25',
    backBadgeBg: 'bg-white/20 text-white',
    backBadgeText: 'text-white',
    backBadgeBorder: 'border-white/30',
    primaryBtnGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    primaryBtnShadow: 'shadow-emerald-500/25',
    audioBtnUs: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200',
    audioBtnUk: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800 hover:bg-teal-200',
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
  const [showBackSettings, setShowBackSettings] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  // 🎨 Theme Vibe state — persisted in localStorage
  const THEME_VIBE_KEY = 'lulu_mimi_card_theme_vibe_v1';
  const [themeVibe, setThemeVibe] = useState<ThemeVibe>(() => {
    try {
      const saved = localStorage.getItem(THEME_VIBE_KEY) as ThemeVibe;
      if (saved && THEME_CONFIGS[saved]) return saved;
    } catch {}
    return 'blue';
  });

  const changeThemeVibe = (newVibe: ThemeVibe) => {
    setThemeVibe(newVibe);
    try {
      localStorage.setItem(THEME_VIBE_KEY, newVibe);
    } catch {}
  };

  const currentTheme = THEME_CONFIGS[themeVibe] || THEME_CONFIGS.blue;

  // 🔄 Card Slide Motion Animation State
  const [animClass, setAnimClass] = useState<string>('animate-card-pop');
  const [isPlayingAudio, setIsPlayingAudio] = useState<'US' | 'UK' | null>(null);

  // ✏️ In-Card Inline Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Flashcard>>({});

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
  const backVisibleCount = useMemo(() => {
    let count = 0;
    if (backSettings.showDefinitionEn) count++;
    if (backSettings.showMeaningVi) count++;
    if (backSettings.showExample) count++;
    if (backSettings.showSynonyms || backSettings.showCollocations) count++;
    if (backSettings.showSRSButtons) count++;
    return count;
  }, [backSettings]);

  const backDensity = backVisibleCount <= 2 ? 'minimal' : backVisibleCount === 3 ? 'medium' : 'full';

  // Count how many cards are due today under SRS
  const dueCardsCount = useMemo(() => {
    return flashcards.filter((c) => isCardDue(srsRecords[c.id])).length;
  }, [flashcards, srsRecords]);

  // 1. Filter cards by selectedTopic, vocabType, and status
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

  // Update working card list when filters change
  useEffect(() => {
    setCardsList(filteredCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsEditing(false);
  }, [filteredCards]);

  const currentCard = cardsList[currentIndex];
  const currentCardSRS = currentCard ? srsRecords[currentCard.id] : undefined;

  // Initialize edit form when opening editor
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

    // Update local card list
    setCardsList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    // Propagate up to App.tsx
    if (onEditCard) {
      onEditCard(updated);
    }

    setIsEditing(false);
  };

  // 2. Audio Pronunciation playback
  const playAudio = useCallback((e?: React.MouseEvent, accent: 'UK' | 'US' = 'US') => {
    if (e) e.stopPropagation();
    if (!currentCard) return;

    setIsPlayingAudio(accent);
    setTimeout(() => setIsPlayingAudio(null), 1200);

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

  // 3. Navigation handlers with smooth slide motion
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

  // 4. Rate SRS Card & jump to next card
  const handleRateSRS = (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!currentCard) return;
    if (onRateCardSRS) {
      onRateCardSRS(currentCard.id, rating);
    }
    handleNext();
  };

  // 5. Keyboard Shortcuts
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
      } else if (e.key === 'e' || e.key === 'E') {
        if (!isEditing) {
          e.preventDefault();
          handleOpenEdit();
        }
      } else if (e.key === '1' && isFlipped && !isEditing) {
        handleRateSRS(1);
      } else if (e.key === '2' && isFlipped && !isEditing) {
        handleRateSRS(2);
      } else if (e.key === '3' && isFlipped && !isEditing) {
        handleRateSRS(3);
      } else if (e.key === '4' && isFlipped && !isEditing) {
        handleRateSRS(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped, isEditing, currentCard]);

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
      
      {/* 🛠️ Top Controls & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white/85 dark:bg-slate-900/85 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
        
        {/* Left: Vocab Type Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1 shrink-0">
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
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 active:scale-95 ${
                selectedVocabType === type.id
                  ? currentTheme.pillActiveClass
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Right: Theme Picker, Quick Add, SRS Filter, Settings, Shuffle */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          
          {/* 🎨 Theme Vibe Selector Dropdown/Pill */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black text-slate-700 dark:text-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
              title="Đổi vibe màu sắc giao diện (Xanh / Đỏ / Vàng / Tím / Mint)"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{currentTheme.emoji} {currentTheme.label}</span>
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl backdrop-blur-md w-48 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-2 py-1">
                  Chọn Vibe Màu Flashcard
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
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${theme.dotClass}`} />
                      <span>{theme.emoji} {theme.label}</span>
                    </span>
                    {themeVibe === theme.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${currentTheme.primaryBtnGradient} text-white text-[11px] font-black rounded-xl shadow-xs transition cursor-pointer active:scale-95`}
              title="Thêm từ vựng mới và tự động tạo flashcard"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>+ Thêm Từ</span>
            </button>
          )}

          {/* SRS Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Lọc theo chu kỳ lặp lại ngắt quãng SM-2"
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-black rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
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
            className={`p-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 ${
              showBackSettings
                ? 'bg-blue-500 text-white border-blue-500 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Tuỳ chỉnh nội dung mặt sau thẻ"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer active:scale-95"
            title="Xáo trộn ngẫu nhiên bộ thẻ"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ⚙️ Back Card Settings Panel */}
      {showBackSettings && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/70 rounded-2xl p-3.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-black uppercase text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tuỳ Chỉnh Các Mục Hiển Thị Mặt Sau
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
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-[11px] font-black transition cursor-pointer text-left ${
                  backSettings[key]
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                  backSettings[key]
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                }`}>
                  {backSettings[key] && <span className="text-[9px]">✓</span>}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Flashcard Container */}
      {cardsList.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
            {statusFilter === 'due_srs'
              ? '🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ thẻ cần ôn tập hôm nay.'
              : 'Không tìm thấy thẻ nào phù hợp với bộ lọc'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
            {statusFilter === 'due_srs'
              ? 'Thuật toán lặp lại ngắt quãng (SM-2) sẽ tự động nhắc nhở bạn ôn lại khi các từ vựng này bước vào giai đoạn sắp quên.'
              : 'Thử thay đổi bộ lọc phân loại hoặc chọn "Tất Cả" để tiếp tục ôn luyện.'}
          </p>
          <button
            onClick={() => {
              setSelectedVocabType('all');
              setStatusFilter('all');
            }}
            className={`px-5 py-2.5 ${currentTheme.primaryBtnGradient} text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md`}
          >
            Xem Tất Cả Flashcards
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          
          {/* Card Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black px-2 text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-1.5">
              {getVocabTypeBadge(currentCard.vocabType)}
              {getWordFormBadge(currentCard.wordForm)}
              {memoryBadge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${memoryBadge.badgeClass}`}>
                  {memoryBadge.label}
                </span>
              )}
              
              {/* Folder Selector / Mover */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                <span>{currentTopicObj?.emoji || '📁'}</span>
                <select
                  value={currentCard.topic}
                  onChange={(e) => onMoveCardToFolder && onMoveCardToFolder(currentCard.id, e.target.value)}
                  aria-label="Chuyển thư mục thẻ này"
                  className="bg-transparent font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
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
              <span className={`font-black ${currentTheme.frontAccentText}`}>
                Thẻ {currentIndex + 1} / {cardsList.length}
              </span>

              {/* ✏️ In-Card Quick Edit Trigger Button */}
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-black transition cursor-pointer active:scale-95"
                title="Chỉnh sửa từ vựng trực tiếp trong khung (Phím tắt: E)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sửa Thẻ</span>
              </button>

              {/* Delete Card Button */}
              {onDeleteCard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Bạn có chắc chắn muốn XÓA từ "${currentCard.front}" khỏi thư mục không?`)) {
                      onDeleteCard(currentCard.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer active:scale-95"
                  title="Xóa từ vựng này khỏi thư mục"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ════════ 3D FLIP CARD & IN-FRAME EDITOR CONTAINER ════════ */}
          <div className={`perspective-1000 w-full h-[520px] sm:h-[600px] lg:h-[650px] relative select-none ${animClass}`}>
            
            {/* ✏️ IN-FRAME DIRECT CARD EDITOR */}
            {isEditing ? (
              <div className="w-full h-full bg-white dark:bg-slate-900 border-2 border-blue-400 dark:border-blue-600 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col justify-between animate-in zoom-in-95 duration-150">
                <form onSubmit={handleSaveEdit} className="space-y-4 my-auto">
                  
                  {/* Editor Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Edit3 className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-black uppercase text-slate-800 dark:text-white">
                        Chỉnh Sửa Từ Vựng Trực Tiếp
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Front Word */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Từ / Cụm từ (Front) *
                      </label>
                      <input
                        type="text"
                        value={editForm.front || ''}
                        onChange={(e) => setEditForm({ ...editForm, front: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. accomplish"
                      />
                    </div>

                    {/* Pronunciation IPA */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Phiên âm IPA
                      </label>
                      <input
                        type="text"
                        value={editForm.pronunciationUs || ''}
                        onChange={(e) => setEditForm({ ...editForm, pronunciationUs: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. /əˈkɑːm.plɪʃ/"
                      />
                    </div>

                    {/* Word Form & Topic */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                          Loại từ
                        </label>
                        <select
                          value={editForm.wordForm || 'noun'}
                          onChange={(e) => setEditForm({ ...editForm, wordForm: e.target.value as WordForm })}
                          className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 outline-none"
                        >
                          <option value="noun">Noun (Danh từ)</option>
                          <option value="verb">Verb (Động từ)</option>
                          <option value="adjective">Adjective (Tính từ)</option>
                          <option value="adverb">Adverb (Trạng từ)</option>
                          <option value="phrase">Phrase (Cụm từ)</option>
                          <option value="idiom">Idiom (Thành ngữ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                          Thư mục
                        </label>
                        <select
                          value={editForm.topic || 'daily'}
                          onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                          className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 outline-none"
                        >
                          {topics.filter((t) => t.id !== 'all').map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.emoji || '📁'} {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Vietnamese Meaning */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Nghĩa Tiếng Việt (Back) *
                      </label>
                      <input
                        type="text"
                        value={editForm.back || ''}
                        onChange={(e) => setEditForm({ ...editForm, back: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. hoàn thành, đạt được"
                      />
                    </div>

                    {/* English Definition */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        🇬🇧 Định Nghĩa Tiếng Anh (Definition)
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.definitionEn || ''}
                        onChange={(e) => setEditForm({ ...editForm, definitionEn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 custom-scrollbar"
                        placeholder="e.g. to finish something successfully or to achieve something"
                      />
                    </div>

                    {/* Example Sentence EN & VI */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Câu ví dụ (English)
                      </label>
                      <input
                        type="text"
                        value={editForm.example || ''}
                        onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. She accomplished such a lot during her visit."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Dịch ví dụ (Tiếng Việt)
                      </label>
                      <input
                        type="text"
                        value={editForm.exampleVi || ''}
                        onChange={(e) => setEditForm({ ...editForm, exampleVi: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. Cô ấy đã đạt được rất nhiều thành quả trong chuyến thăm."
                      />
                    </div>

                    {/* Synonyms & Collocations */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Từ đồng nghĩa (phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={editForm.synonyms?.join(', ') || ''}
                        onChange={(e) => setEditForm({ ...editForm, synonyms: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. achieve, complete, fulfill"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Cụm từ đi kèm (Collocations)
                      </label>
                      <input
                        type="text"
                        value={editForm.collocations?.join(', ') || ''}
                        onChange={(e) => setEditForm({ ...editForm, collocations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. accomplish a goal, easily accomplished"
                      />
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition cursor-pointer active:scale-95"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className={`flex items-center gap-1.5 px-5 py-2 ${currentTheme.primaryBtnGradient} text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer active:scale-95`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Lưu Thay Đổi</span>
                    </button>
                  </div>

                </form>
              </div>
            ) : (
              /* ════════ 3D FLIP CARD INTERFACE ════════ */
              <div
                className="w-full h-full cursor-pointer select-none"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  
                  {/* ════════ FRONT SIDE (ENGLISH WORD) ════════ */}
                  <div className={`absolute inset-0 w-full h-full ${currentTheme.frontBg} border-2 ${currentTheme.frontBorder} rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl backface-hidden group ${currentTheme.frontHoverBorder} ${currentTheme.frontGlow} transition-all duration-300 overflow-y-auto custom-scrollbar`}>
                    
                    {/* Top Info on Front */}
                    <div className="flex items-center justify-between shrink-0">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${currentTheme.frontAccentText} flex items-center gap-1.5`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Mặt Trước • Thuật Ngữ Tiếng Anh
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* ✏️ Quick edit on front */}
                        <button
                          onClick={handleOpenEdit}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-black border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 transition shadow-2xs cursor-pointer active:scale-95"
                          title="Chỉnh sửa từ vựng này (E)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sửa</span>
                        </button>

                        <button
                          onClick={(e) => playAudio(e, 'US')}
                          className={`flex items-center gap-1 px-2.5 py-1 ${currentTheme.audioBtnUs} rounded-xl text-[11px] font-black border transition shadow-2xs cursor-pointer active:scale-95 ${
                            isPlayingAudio === 'US' ? 'scale-105 ring-2 ring-blue-400' : ''
                          }`}
                          title="Nghe phát âm chuẩn US"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>US</span>
                        </button>
                        <button
                          onClick={(e) => playAudio(e, 'UK')}
                          className={`flex items-center gap-1 px-2.5 py-1 ${currentTheme.audioBtnUk} rounded-xl text-[11px] font-black border transition shadow-2xs cursor-pointer active:scale-95 ${
                            isPlayingAudio === 'UK' ? 'scale-105 ring-2 ring-blue-400' : ''
                          }`}
                          title="Nghe phát âm chuẩn UK"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>UK</span>
                        </button>
                      </div>
                    </div>

                    {/* Center Word & Pronunciation (HIGH CONTRAST & BOLD) */}
                    <div className="my-auto text-center space-y-4 py-6">
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight drop-shadow-xs">
                        {currentCard.front}
                      </h2>

                      {(currentCard.pronunciation || currentCard.pronunciationUs || currentCard.pronunciationUk) && (
                        <div className="flex items-center justify-center gap-3">
                          <span className={`font-mono text-base sm:text-lg font-black ${currentTheme.frontIpaText} ${currentTheme.frontIpaBg} px-4 py-1.5 rounded-2xl border ${currentTheme.frontIpaBorder} shadow-2xs`}>
                            {currentCard.pronunciationUs || currentCard.pronunciation || currentCard.pronunciationUk}
                          </span>
                        </div>
                      )}

                      {currentCard.wordFamily && currentCard.wordFamily.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                          {currentCard.wordFamily.map((wf, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
                            >
                              <span className="text-slate-400 font-black">{wf.form}:</span> {wf.word}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Instruction */}
                    <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-bold shrink-0 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="hidden sm:inline">
                        Phím <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 font-black rounded text-slate-700 dark:text-slate-300">Space</kbd> lật thẻ
                      </span>
                      <span className={`mx-auto sm:mx-0 flex items-center gap-1 ${currentTheme.frontAccentText} font-black`}>
                        <RotateCw className="w-3.5 h-3.5" /> Chạm để xem định nghĩa & nghĩa tiếng Việt
                      </span>
                      <span className="hidden sm:inline">
                        Phím <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 font-black rounded text-slate-700 dark:text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 font-black rounded text-slate-700 dark:text-slate-300">→</kbd>
                      </span>
                    </div>
                  </div>

                  {/* ════════ BACK SIDE (ENGLISH DEFINITION & VIETNAMESE MEANING) ════════ */}
                  <div className={`absolute inset-0 w-full h-full ${currentTheme.backBg} text-white border-2 ${currentTheme.backBorder} rounded-3xl p-6 sm:p-8 flex flex-col justify-between ${currentTheme.backGlow} backface-hidden rotate-y-180 overflow-y-auto custom-scrollbar`}>
                    
                    {/* Top Info on Back */}
                    <div className="flex items-center justify-between shrink-0">
                      <span className="text-[11px] font-black uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        Mặt Sau • Định Nghĩa Chi Tiết
                      </span>
                      <div className="flex items-center gap-2">
                        {/* ✏️ Quick edit on back */}
                        <button
                          onClick={handleOpenEdit}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[11px] font-black border border-white/30 transition shadow-2xs cursor-pointer active:scale-95"
                          title="Chỉnh sửa từ vựng này (E)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sửa</span>
                        </button>

                        {currentCardSRS && (
                          <span className="text-[10px] font-black text-white/90 flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-lg border border-white/20">
                            <Clock className="w-3 h-3 text-yellow-300" />
                            Ôn: {formatSRSCountdown(currentCardSRS.nextReviewDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Definition & Details (BOLD & HIGH CONTRAST) */}
                    <div className={`my-auto py-2 transition-all duration-300 ${
                      backDensity === 'minimal' ? 'space-y-6 flex flex-col items-center justify-center text-center' :
                      backDensity === 'medium'  ? 'space-y-4' :
                      'space-y-3.5'
                    }`}>
                      
                      {/* 🇬🇧 English Definition (PRIORITY SPOTLIGHT) */}
                      {backSettings.showDefinitionEn && (
                        <div className={`bg-white/20 backdrop-blur-md border-2 border-white/35 rounded-2xl space-y-2 text-left transition-all duration-300 shadow-lg ${
                          backDensity === 'minimal' ? 'p-8 w-full' :
                          backDensity === 'medium'  ? 'p-6' : 'p-4 sm:p-5'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-black uppercase tracking-wider text-yellow-200 flex items-center gap-1.5 ${
                              backDensity === 'minimal' ? 'text-sm' :
                              backDensity === 'medium'  ? 'text-xs' : 'text-[11px]'
                            }`}>
                              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 🇬🇧 English Definition:
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/25 text-white border border-white/30">
                              {currentCard.wordForm || 'word'}
                            </span>
                          </div>
                          <p className={`font-black text-white leading-relaxed transition-all tracking-wide drop-shadow-xs ${
                            backDensity === 'minimal' ? 'text-2xl sm:text-4xl' :
                            backDensity === 'medium'  ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'
                          }`}>
                            {currentCard.definitionEn || currentCard.back}
                          </p>
                        </div>
                      )}

                      {/* 🇻🇳 Vietnamese Meaning */}
                      {backSettings.showMeaningVi && (
                        <div className={`bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl space-y-1 text-left transition-all duration-300 ${
                          backDensity === 'minimal' ? 'p-5 w-full' :
                          backDensity === 'medium'  ? 'p-4' : 'p-3'
                        }`}>
                          <span className={`font-black uppercase tracking-wider text-yellow-300 ${
                            backDensity === 'minimal' ? 'text-xs block' : 'text-[10px]'
                          }`}>
                            🇻🇳 Bản dịch tiếng Việt:
                          </span>
                          <p className={`font-black text-white leading-snug transition-all drop-shadow-xs ${
                            backDensity === 'minimal' ? 'text-xl sm:text-2xl' :
                            backDensity === 'medium'  ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                          }`}>
                            {currentCard.back}
                          </p>
                        </div>
                      )}

                      {/* Example Sentence */}
                      {backSettings.showExample && currentCard.example && (
                        <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl space-y-2 text-left transition-all duration-300 ${
                          backDensity === 'minimal' ? 'p-6 w-full' :
                          backDensity === 'medium'  ? 'p-5' : 'p-3'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`uppercase font-black tracking-wider text-white/90 ${
                              backDensity === 'minimal' ? 'text-sm' :
                              backDensity === 'medium'  ? 'text-xs' : 'text-[10px]'
                            }`}>
                              Ví Dụ Thực Tế:
                            </span>
                            <button
                              onClick={(e) => playSpeechFallback(currentCard.example || '', 'US')}
                              className="text-white/80 hover:text-white transition cursor-pointer active:scale-95"
                              title="Đọc câu ví dụ"
                            >
                              <Volume2 className={backDensity === 'minimal' ? 'w-6 h-6' : backDensity === 'medium' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
                            </button>
                          </div>
                          <p className={`font-bold text-white/95 leading-relaxed italic transition-all ${
                            backDensity === 'minimal' ? 'text-lg sm:text-2xl' :
                            backDensity === 'medium'  ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
                          }`}>
                            &quot;{currentCard.example}&quot;
                          </p>
                          {currentCard.exampleVi && (
                            <p className={`text-white/80 font-bold pt-0.5 ${
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
                            <div className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transition-all duration-300 ${
                              backDensity === 'minimal' ? 'p-6' :
                              backDensity === 'medium'  ? 'p-4' : 'p-2.5'
                            }`}>
                              <span className={`font-black uppercase text-yellow-300 block ${
                                backDensity === 'minimal' ? 'text-sm mb-2' :
                                backDensity === 'medium'  ? 'text-xs mb-1' : 'text-[10px] mb-0.5'
                              }`}>
                                🔗 Từ Đồng Nghĩa:
                              </span>
                              <span className={`text-white font-black transition-all ${
                                backDensity === 'minimal' ? 'text-lg sm:text-2xl' :
                                backDensity === 'medium'  ? 'text-base' : 'text-[11px]'
                              }`}>
                                {currentCard.synonyms.join(' • ')}
                              </span>
                            </div>
                          )}

                          {backSettings.showCollocations && currentCard.collocations && currentCard.collocations.length > 0 && (
                            <div className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transition-all duration-300 ${
                              backDensity === 'minimal' ? 'p-6' :
                              backDensity === 'medium'  ? 'p-4' : 'p-2.5'
                            }`}>
                              <span className={`font-black uppercase text-yellow-300 block ${
                                backDensity === 'minimal' ? 'text-sm mb-2' :
                                backDensity === 'medium'  ? 'text-xs mb-1' : 'text-[10px] mb-0.5'
                              }`}>
                                📌 Cụm Đi Kèm:
                              </span>
                              <span className={`text-white font-black transition-all ${
                                backDensity === 'minimal' ? 'text-lg sm:text-2xl' :
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
                      <div className="pt-2 border-t border-white/20 space-y-2 shrink-0">
                        <div className={`font-black text-center text-white/80 ${
                          backDensity === 'minimal' ? 'text-xs' : 'text-[10px]'
                        }`}>
                          Đánh giá mức độ ghi nhớ — Spaced Repetition (SM-2):
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                          {/* 1 — Again */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRateSRS(1); }}
                            className={`rounded-xl bg-red-500/30 border border-red-300/40 hover:bg-red-500/50 active:scale-95 text-white font-black transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-md ${
                              backDensity === 'minimal' ? 'py-3.5 px-2 text-sm gap-1' : 'py-2 px-1.5 text-xs gap-0.5'
                            }`}
                            title="Phím tắt: 1 — Quên hoàn toàn, ôn lại ngay"
                          >
                            <ThumbsDown className={backDensity === 'minimal' ? 'w-4 h-4 text-red-200' : 'w-3 h-3 text-red-200'} />
                            <span className="font-black">Quên</span>
                            <span className="text-[9px] text-red-200/90 font-black">
                              {previewNextInterval(currentCardSRS, 1)} ngày
                            </span>
                          </button>

                          {/* 2 — Hard */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRateSRS(2); }}
                            className={`rounded-xl bg-orange-400/30 border border-orange-300/40 hover:bg-orange-400/50 active:scale-95 text-white font-black transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-md ${
                              backDensity === 'minimal' ? 'py-3.5 px-2 text-sm gap-1' : 'py-2 px-1.5 text-xs gap-0.5'
                            }`}
                            title="Phím tắt: 2 — Nhớ nhưng khó, rút ngắn chu kỳ"
                          >
                            <span className={backDensity === 'minimal' ? 'text-lg' : 'text-sm'}>😓</span>
                            <span className="font-black">Khó</span>
                            <span className="text-[9px] text-orange-200/90 font-black">
                              {previewNextInterval(currentCardSRS, 2)} ngày
                            </span>
                          </button>

                          {/* 3 — Good */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRateSRS(3); }}
                            className={`rounded-xl bg-blue-400/30 border border-blue-300/40 hover:bg-blue-400/50 active:scale-95 text-white font-black transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-md ${
                              backDensity === 'minimal' ? 'py-3.5 px-2 text-sm gap-1' : 'py-2 px-1.5 text-xs gap-0.5'
                            }`}
                            title="Phím tắt: 3 — Nhớ bình thường, tăng chu kỳ"
                          >
                            <ThumbsUp className={backDensity === 'minimal' ? 'w-4 h-4 text-blue-200' : 'w-3 h-3 text-blue-200'} />
                            <span className="font-black">Nhớ</span>
                            <span className="text-[9px] text-blue-200/90 font-black">
                              {previewNextInterval(currentCardSRS, 3)} ngày
                            </span>
                          </button>

                          {/* 4 — Easy */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRateSRS(5); }}
                            className={`rounded-xl bg-emerald-400/30 border border-emerald-300/40 hover:bg-emerald-400/50 active:scale-95 text-white font-black transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-md ${
                              backDensity === 'minimal' ? 'py-3.5 px-2 text-sm gap-1' : 'py-2 px-1.5 text-xs gap-0.5'
                            }`}
                            title="Phím tắt: 4 — Rất dễ, khắc sâu vào trí nhớ"
                          >
                            <Zap className={backDensity === 'minimal' ? 'w-4 h-4 text-emerald-200' : 'w-3 h-3 text-emerald-200'} />
                            <span className="font-black">Dễ</span>
                            <span className="text-[9px] text-emerald-200/90 font-black">
                              {previewNextInterval(currentCardSRS, 5)} ngày
                            </span>
                          </button>
                        </div>

                        <div className="text-[9px] text-white/50 text-center font-black">
                          Phím tắt: <kbd className="bg-white/15 px-1 rounded font-black">1</kbd> Quên&nbsp;&nbsp;
                          <kbd className="bg-white/15 px-1 rounded font-black">2</kbd> Khó&nbsp;&nbsp;
                          <kbd className="bg-white/15 px-1 rounded font-black">3</kbd> Nhớ&nbsp;&nbsp;
                          <kbd className="bg-white/15 px-1 rounded font-black">4</kbd> Dễ
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Navigation Arrows & Toggle Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            
            {/* Status Check Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => onToggleNeedReview(currentCard.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
                  needReviewIds.includes(currentCard.id)
                    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Cần Ôn Lại
              </button>

              <button
                onClick={() => onToggleMastered(currentCard.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
                  masteredIds.includes(currentCard.id)
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-xs'
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
                className="flex items-center gap-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-black transition shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              <button
                onClick={handleNext}
                className={`flex items-center gap-1.5 px-5 py-2.5 ${currentTheme.primaryBtnGradient} text-white rounded-xl text-xs font-black transition shadow-md ${currentTheme.primaryBtnShadow} cursor-pointer active:scale-95`}
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
