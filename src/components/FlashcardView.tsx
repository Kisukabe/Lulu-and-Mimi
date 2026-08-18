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
  Star
} from 'lucide-react';
import { calculateNextSRS, isCardDue, formatSRSCountdown, getMemoryLevelName } from '../utils/srs';

export type ThemeVibe = 'dark-space' | 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';

interface ThemeConfig {
  id: ThemeVibe;
  label: string;
  emoji: string;
  dotClass: string;
  
  // Page / Container
  topBarBg: string;
  topBarBorder: string;
  
  // Front card
  frontBg: string;
  frontBorder: string;
  frontTextColor: string;
  frontAccent: string;
  frontTagBg: string;
  frontTagText: string;
  
  // Back card
  backBg: string;
  backBorder: string;
  backTextColor: string;
  backBoxBg: string;
  backBoxBorder: string;
  
  // Action Buttons
  btn1Bg: string;
  btn1Border: string;
  btn1Text: string;
  btn1Kbd: string;
  
  btnSpaceBg: string;
  btnSpaceBorder: string;
  btnSpaceText: string;
  btnSpaceKbd: string;
  
  btn2Bg: string;
  btn2Border: string;
  btn2Text: string;
  btn2Kbd: string;
  
  // Companion Widgets
  companion1Bg: string;
  companion1Border: string;
  companion1TagBg: string;
  companion1TagText: string;
  
  companion2Bg: string;
  companion2Border: string;
  
  // Accent & Highlights
  accentColor: string;
  accentBg: string;
  accentText: string;
  progressBarColor: string;
  nextBtnBg: string;
}

const THEME_CONFIGS: Record<ThemeVibe, ThemeConfig> = {
  'dark-space': {
    id: 'dark-space',
    label: 'IELTS Đêm Sao',
    emoji: '🌌',
    dotClass: 'bg-indigo-900 border border-amber-400',
    topBarBg: 'bg-[#111722]',
    topBarBorder: 'border-slate-800/80',
    frontBg: 'bg-gradient-to-b from-[#132743] via-[#0f1d33] to-[#0a1526]',
    frontBorder: 'border-blue-500/40 shadow-[0_0_50px_rgba(15,29,51,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-amber-400',
    frontTagBg: 'bg-slate-900/70 border-white/10',
    frontTagText: 'text-slate-200',
    backBg: 'bg-gradient-to-b from-[#203a43] via-[#0f2027] to-[#2c5364]',
    backBorder: 'border-cyan-500/40 shadow-[0_0_50px_rgba(32,58,67,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-black/35 backdrop-blur-md',
    backBoxBorder: 'border-cyan-500/20',
    btn1Bg: 'bg-rose-950/70 hover:bg-rose-900/80',
    btn1Border: 'border-rose-700/60',
    btn1Text: 'text-rose-200',
    btn1Kbd: 'bg-rose-950 text-rose-300 border-rose-700/60',
    btnSpaceBg: 'bg-cyan-950/70 hover:bg-cyan-900/80',
    btnSpaceBorder: 'border-cyan-600/60',
    btnSpaceText: 'text-cyan-100',
    btnSpaceKbd: 'bg-cyan-950 text-cyan-300 border-cyan-700/60',
    btn2Bg: 'bg-emerald-950/70 hover:bg-emerald-900/80',
    btn2Border: 'border-emerald-600/60',
    btn2Text: 'text-emerald-200',
    btn2Kbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#132743] to-[#0a1526]',
    companion1Border: 'border-blue-500/30',
    companion1TagBg: 'bg-blue-950/80 border-blue-400/30',
    companion1TagText: 'text-blue-300',
    companion2Bg: 'bg-[#111722]',
    companion2Border: 'border-slate-800',
    accentColor: '#f59e0b',
    accentBg: 'bg-amber-500 hover:bg-amber-400',
    accentText: 'text-amber-400',
    progressBarColor: 'bg-amber-400',
    nextBtnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  },
  blue: {
    id: 'blue',
    label: 'Xanh Đại Dương',
    emoji: '🌊',
    dotClass: 'bg-blue-500',
    topBarBg: 'bg-[#091b35]',
    topBarBorder: 'border-blue-900/60',
    frontBg: 'bg-gradient-to-b from-[#0f2c59] via-[#091e3d] to-[#06142a]',
    frontBorder: 'border-cyan-500/40 shadow-[0_0_50px_rgba(15,44,89,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-cyan-300',
    frontTagBg: 'bg-blue-950/80 border-cyan-400/20',
    frontTagText: 'text-cyan-200',
    backBg: 'bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0f172a]',
    backBorder: 'border-blue-400/50 shadow-[0_0_50px_rgba(30,58,138,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-blue-950/50 backdrop-blur-md',
    backBoxBorder: 'border-blue-400/30',
    btn1Bg: 'bg-rose-950/80 hover:bg-rose-900',
    btn1Border: 'border-rose-700/60',
    btn1Text: 'text-rose-200',
    btn1Kbd: 'bg-rose-950 text-rose-300 border-rose-700/60',
    btnSpaceBg: 'bg-blue-900/80 hover:bg-blue-800',
    btnSpaceBorder: 'border-blue-500/60',
    btnSpaceText: 'text-blue-100',
    btnSpaceKbd: 'bg-blue-950 text-blue-300 border-blue-600/60',
    btn2Bg: 'bg-emerald-950/80 hover:bg-emerald-900',
    btn2Border: 'border-emerald-600/60',
    btn2Text: 'text-emerald-200',
    btn2Kbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#0f2c59] to-[#07172f]',
    companion1Border: 'border-cyan-500/30',
    companion1TagBg: 'bg-blue-950/90 border-cyan-400/30',
    companion1TagText: 'text-cyan-300',
    companion2Bg: 'bg-[#091b35]',
    companion2Border: 'border-blue-900/60',
    accentColor: '#38bdf8',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400',
    accentText: 'text-cyan-300',
    progressBarColor: 'bg-cyan-400',
    nextBtnBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
  },
  rose: {
    id: 'rose',
    label: 'Đỏ Ruby',
    emoji: '🔥',
    dotClass: 'bg-rose-500',
    topBarBg: 'bg-[#220712]',
    topBarBorder: 'border-rose-950/80',
    frontBg: 'bg-gradient-to-b from-[#3d0f1e] via-[#2a0914] to-[#1a050c]',
    frontBorder: 'border-rose-500/40 shadow-[0_0_50px_rgba(61,15,30,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-rose-300',
    frontTagBg: 'bg-rose-950/80 border-rose-400/20',
    frontTagText: 'text-rose-200',
    backBg: 'bg-gradient-to-b from-[#881337] via-[#4c0519] to-[#1f020a]',
    backBorder: 'border-rose-400/50 shadow-[0_0_50px_rgba(136,19,55,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-rose-950/50 backdrop-blur-md',
    backBoxBorder: 'border-rose-400/30',
    btn1Bg: 'bg-rose-950/90 hover:bg-rose-900',
    btn1Border: 'border-rose-700/60',
    btn1Text: 'text-rose-200',
    btn1Kbd: 'bg-rose-950 text-rose-300 border-rose-700/60',
    btnSpaceBg: 'bg-rose-900/80 hover:bg-rose-800',
    btnSpaceBorder: 'border-rose-500/60',
    btnSpaceText: 'text-rose-100',
    btnSpaceKbd: 'bg-rose-950 text-rose-300 border-rose-600/60',
    btn2Bg: 'bg-emerald-950/80 hover:bg-emerald-900',
    btn2Border: 'border-emerald-600/60',
    btn2Text: 'text-emerald-200',
    btn2Kbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#380e1c] to-[#1f050e]',
    companion1Border: 'border-rose-500/30',
    companion1TagBg: 'bg-rose-950/90 border-rose-400/30',
    companion1TagText: 'text-rose-300',
    companion2Bg: 'bg-[#220712]',
    companion2Border: 'border-rose-950/80',
    accentColor: '#fb7185',
    accentBg: 'bg-rose-500 hover:bg-rose-400',
    accentText: 'text-rose-300',
    progressBarColor: 'bg-rose-400',
    nextBtnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
  },
  amber: {
    id: 'amber',
    label: 'Vàng Sunset',
    emoji: '✨',
    dotClass: 'bg-amber-500',
    topBarBg: 'bg-[#221303]',
    topBarBorder: 'border-amber-950/80',
    frontBg: 'bg-gradient-to-b from-[#3a2208] via-[#281604] to-[#170c02]',
    frontBorder: 'border-amber-500/40 shadow-[0_0_50px_rgba(58,34,8,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-amber-300',
    frontTagBg: 'bg-amber-950/80 border-amber-400/20',
    frontTagText: 'text-amber-200',
    backBg: 'bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#1c0a01]',
    backBorder: 'border-amber-400/50 shadow-[0_0_50px_rgba(120,53,15,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-amber-950/50 backdrop-blur-md',
    backBoxBorder: 'border-amber-400/30',
    btn1Bg: 'bg-rose-950/80 hover:bg-rose-900',
    btn1Border: 'border-rose-700/60',
    btn1Text: 'text-rose-200',
    btn1Kbd: 'bg-rose-950 text-rose-300 border-rose-700/60',
    btnSpaceBg: 'bg-amber-900/80 hover:bg-amber-800',
    btnSpaceBorder: 'border-amber-500/60',
    btnSpaceText: 'text-amber-100',
    btnSpaceKbd: 'bg-amber-950 text-amber-300 border-amber-600/60',
    btn2Bg: 'bg-emerald-950/80 hover:bg-emerald-900',
    btn2Border: 'border-emerald-600/60',
    btn2Text: 'text-emerald-200',
    btn2Kbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#351e06] to-[#1d0f02]',
    companion1Border: 'border-amber-500/30',
    companion1TagBg: 'bg-amber-950/90 border-amber-400/30',
    companion1TagText: 'text-amber-300',
    companion2Bg: 'bg-[#221303]',
    companion2Border: 'border-amber-950/80',
    accentColor: '#f59e0b',
    accentBg: 'bg-amber-500 hover:bg-amber-400',
    accentText: 'text-amber-300',
    progressBarColor: 'bg-amber-400',
    nextBtnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  },
  emerald: {
    id: 'emerald',
    label: 'Xanh Rừng Rậm',
    emoji: '🌿',
    dotClass: 'bg-emerald-500',
    topBarBg: 'bg-[#082016]',
    topBarBorder: 'border-emerald-950/80',
    frontBg: 'bg-gradient-to-b from-[#0a2f1d] via-[#062013] to-[#03130b]',
    frontBorder: 'border-emerald-500/40 shadow-[0_0_50px_rgba(10,47,29,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-emerald-300',
    frontTagBg: 'bg-emerald-950/80 border-emerald-400/20',
    frontTagText: 'text-emerald-200',
    backBg: 'bg-gradient-to-b from-[#065f46] via-[#064e3b] to-[#022c22]',
    backBorder: 'border-emerald-400/50 shadow-[0_0_50px_rgba(6,95,70,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-emerald-950/50 backdrop-blur-md',
    backBoxBorder: 'border-emerald-400/30',
    btn1Bg: 'bg-rose-950/80 hover:bg-rose-900',
    btn1Border: 'border-rose-700/60',
    btn1Text: 'text-rose-200',
    btn1Kbd: 'bg-rose-950 text-rose-300 border-rose-700/60',
    btnSpaceBg: 'bg-emerald-900/80 hover:bg-emerald-800',
    btnSpaceBorder: 'border-emerald-500/60',
    btnSpaceText: 'text-emerald-100',
    btnSpaceKbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    btn2Bg: 'bg-emerald-950/80 hover:bg-emerald-900',
    btn2Border: 'border-emerald-600/60',
    btn2Text: 'text-emerald-200',
    btn2Kbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#0a2e1d] to-[#04170e]',
    companion1Border: 'border-emerald-500/30',
    companion1TagBg: 'bg-emerald-950/90 border-emerald-400/30',
    companion1TagText: 'text-emerald-300',
    companion2Bg: 'bg-[#082016]',
    companion2Border: 'border-emerald-950/80',
    accentColor: '#34d399',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400',
    accentText: 'text-emerald-300',
    progressBarColor: 'bg-emerald-400',
    nextBtnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
  },
  purple: {
    id: 'purple',
    label: 'Tím Huyền Bí',
    emoji: '🔮',
    dotClass: 'bg-purple-500',
    topBarBg: 'bg-[#1a0a2b]',
    topBarBorder: 'border-purple-950/80',
    frontBg: 'bg-gradient-to-b from-[#24133b] via-[#190c29] to-[#0e0618]',
    frontBorder: 'border-purple-500/40 shadow-[0_0_50px_rgba(36,19,59,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-purple-300',
    frontTagBg: 'bg-purple-950/80 border-purple-400/20',
    frontTagText: 'text-purple-200',
    backBg: 'bg-gradient-to-b from-[#581c87] via-[#3b0764] to-[#1c0332]',
    backBorder: 'border-purple-400/50 shadow-[0_0_50px_rgba(88,28,135,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-purple-950/50 backdrop-blur-md',
    backBoxBorder: 'border-purple-400/30',
    btn1Bg: 'bg-rose-950/80 hover:bg-rose-900',
    btn1Border: 'border-rose-700/60',
    btn1Text: 'text-rose-200',
    btn1Kbd: 'bg-rose-950 text-rose-300 border-rose-700/60',
    btnSpaceBg: 'bg-purple-900/80 hover:bg-purple-800',
    btnSpaceBorder: 'border-purple-500/60',
    btnSpaceText: 'text-purple-100',
    btnSpaceKbd: 'bg-purple-950 text-purple-300 border-purple-600/60',
    btn2Bg: 'bg-emerald-950/80 hover:bg-emerald-900',
    btn2Border: 'border-emerald-600/60',
    btn2Text: 'text-emerald-200',
    btn2Kbd: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#25103d] to-[#120520]',
    companion1Border: 'border-purple-500/30',
    companion1TagBg: 'bg-purple-950/90 border-purple-400/30',
    companion1TagText: 'text-purple-300',
    companion2Bg: 'bg-[#1a0a2b]',
    companion2Border: 'border-purple-950/80',
    accentColor: '#c084fc',
    accentBg: 'bg-purple-500 hover:bg-purple-400',
    accentText: 'text-purple-300',
    progressBarColor: 'bg-purple-400',
    nextBtnBg: 'bg-purple-500 hover:bg-purple-400 text-white',
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
  const THEME_VIBE_KEY = 'lulu_mimi_card_theme_vibe_v3';
  const [themeVibe, setThemeVibe] = useState<ThemeVibe>(() => {
    try {
      const saved = localStorage.getItem(THEME_VIBE_KEY) as ThemeVibe;
      if (saved && THEME_CONFIGS[saved]) return saved;
    } catch {}
    return 'dark-space';
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
      
      {/* ════════ TOP BREADCRUMB & CONTROLS BAR (COORDINATED WITH THEME) ════════ */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${currentTheme.topBarBg} p-3.5 sm:p-4 rounded-3xl border ${currentTheme.topBarBorder} shadow-lg transition-colors duration-300`}>
        
        {/* Left: Breadcrumbs */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            ĐANG HỌC • BỘ THẺ
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              {currentTopicObj?.emoji || '📚'} {currentTopicObj?.title || 'IELTS Từ Vựng'}
            </h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-black/40 text-slate-300 border border-white/10">
              {currentCard?.vocabType || 'Academic'}
            </span>
          </div>
        </div>

        {/* Right: Controls Strip */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          
          {/* Trộn thẻ */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-xs font-black text-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Xáo trộn ngẫu nhiên bộ thẻ"
          >
            <Shuffle className={`w-3.5 h-3.5 ${currentTheme.accentText}`} />
            <span>Trộn thẻ</span>
          </button>

          {/* Tự động phát âm Toggle */}
          <button
            onClick={toggleAutoPlayAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer active:scale-95 ${
              autoPlayAudio
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Bật/Tắt tự động phát âm khi chuyển thẻ"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tự động phát âm</span>
            <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${autoPlayAudio ? currentTheme.accentBg : 'bg-slate-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoPlayAudio ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Giọng phát âm Dropdown */}
          <select
            value={preferredAccent}
            onChange={(e) => setPreferredAccent(e.target.value as 'US' | 'UK')}
            className="bg-black/40 border border-white/10 text-slate-200 text-xs font-black rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="US">🎙️ Giọng: US (Mỹ)</option>
            <option value="UK">🎙️ Giọng: UK (Anh)</option>
          </select>

          {/* 🎨 Theme Vibe Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-slate-200 text-xs font-black transition cursor-pointer active:scale-95"
              title="Đổi phong cách màu thẻ"
            >
              <Palette className={`w-3.5 h-3.5 ${currentTheme.accentText}`} />
              <span className="hidden sm:inline">{currentTheme.label}</span>
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl w-48 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-black uppercase text-slate-400 px-2 py-1">
                  Chọn Vibe Màu
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
                        ? 'bg-white/20 text-white'
                        : 'text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${theme.dotClass}`} />
                      <span>{theme.emoji} {theme.label}</span>
                    </span>
                    {themeVibe === theme.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add */}
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className={`flex items-center gap-1 px-3 py-1.5 ${currentTheme.accentBg} text-slate-950 text-xs font-black rounded-xl shadow-xs transition cursor-pointer active:scale-95`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ</span>
            </button>
          )}

        </div>
      </div>

      {cardsList.length === 0 ? (
        <div className="bg-[#111722] border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">
            {statusFilter === 'due_srs' ? '🎉 Bạn đã ôn tập xong các từ đến hạn hôm nay!' : 'Không có từ nào trong bộ lọc này'}
          </h3>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-5 py-2.5 ${currentTheme.accentBg} text-slate-950 text-xs font-black rounded-xl transition cursor-pointer`}
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
              
              {/* Card Viewport Container (TĂNG KÍCH THƯỚC KHUNG FLASHCARD) */}
              <div className={`perspective-[1200px] w-full h-[520px] sm:h-[580px] lg:h-[620px] relative select-none ${animClass}`}>
                
                {/* ✏️ IN-CARD EDITOR OVERLAY */}
                {isEditing ? (
                  <div className={`w-full h-full ${currentTheme.frontBg} border-2 ${currentTheme.frontBorder} rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col justify-between animate-in zoom-in-95 duration-150 text-slate-200 z-30`}>
                    <form onSubmit={handleSaveEdit} className="space-y-3 my-auto">
                      <div className="flex items-center justify-between pb-2 border-b border-white/15">
                        <span className={`text-xs font-black uppercase ${currentTheme.accentText} flex items-center gap-1.5`}>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Từ vựng *</label>
                          <input
                            type="text"
                            value={editForm.front || ''}
                            onChange={(e) => setEditForm({ ...editForm, front: e.target.value })}
                            required
                            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-sm font-black text-white outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Phiên âm IPA</label>
                          <input
                            type="text"
                            value={editForm.pronunciationUs || ''}
                            onChange={(e) => setEditForm({ ...editForm, pronunciationUs: e.target.value })}
                            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-sm font-mono font-bold text-white outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Loại từ</label>
                          <select
                            value={editForm.wordForm || 'noun'}
                            onChange={(e) => setEditForm({ ...editForm, wordForm: e.target.value as WordForm })}
                            className="w-full px-2 py-2 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-slate-200 outline-none"
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
                            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-sm font-black text-white outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Định nghĩa tiếng Anh</label>
                          <textarea
                            rows={2}
                            value={editForm.definitionEn || ''}
                            onChange={(e) => setEditForm({ ...editForm, definitionEn: e.target.value })}
                            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-slate-300 mb-1">Câu ví dụ tiếng Anh</label>
                          <input
                            type="text"
                            value={editForm.example || ''}
                            onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs font-medium text-white outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/15">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-black rounded-xl cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className={`px-5 py-2 ${currentTheme.accentBg} text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-md`}
                        >
                          Lưu Thay Đổi
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ════════ 3D FLIP CARD BODY (SMOOTH ROTATION & NO CLIP) ════════ */
                  <div
                    className="w-full h-full cursor-pointer select-none"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div
                      className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      
                      {/* 🌌 FRONT SIDE (STARRY DEEP OCEAN AESTHETIC) */}
                      <div
                        className={`card-face-front rounded-3xl ${currentTheme.frontBg} border-2 ${currentTheme.frontBorder} shadow-2xl overflow-hidden ${
                          isFlipped ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg) translate3d(0, 0, 0)',
                          transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
                        }}
                      >
                        <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between relative">
                          
                          {/* Star Sparkle Overlay */}
                          <div className="absolute inset-0 pointer-events-none opacity-40">
                            <div className="absolute top-6 left-12 text-white/40 text-xs">✦</div>
                            <div className="absolute top-16 right-20 text-white/50 text-sm">✨</div>
                            <div className="absolute bottom-20 left-24 text-white/30 text-xs">✦</div>
                            <div className="absolute bottom-12 right-16 text-white/40 text-sm">✨</div>
                            <div className="absolute top-1/2 left-1/3 text-white/20 text-xs">✦</div>
                          </div>

                          {/* Top Bar on Front */}
                          <div className="flex items-center justify-between z-10 shrink-0">
                            {/* Part of Speech Pill */}
                            <span className={`px-3.5 py-1 rounded-full ${currentTheme.frontTagBg} border ${currentTheme.frontTagText} text-xs font-black backdrop-blur-md`}>
                              {getWordFormLabel(currentCard.wordForm)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Speaker Button */}
                              <button
                                onClick={(e) => playAudio(e, preferredAccent)}
                                className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-200 border border-white/15 transition cursor-pointer active:scale-95 shadow-xs"
                                title={`Nghe phát âm chuẩn ${preferredAccent}`}
                              >
                                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-amber-400 scale-110' : ''}`} />
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={handleOpenEdit}
                                className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-200 border border-white/15 transition cursor-pointer active:scale-95 shadow-xs"
                                title="Chỉnh sửa từ vựng (E)"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Center Stage: Word, Phonetics, Category Tag */}
                          <div className="my-auto text-center space-y-4 z-10 py-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                              {currentCard.front}
                            </h1>

                            {(currentCard.pronunciation || currentCard.pronunciationUs || currentCard.pronunciationUk) && (
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-mono text-base sm:text-xl font-bold text-slate-300">
                                  {currentCard.pronunciationUs || currentCard.pronunciation || currentCard.pronunciationUk}
                                </span>
                                <button
                                  onClick={(e) => playAudio(e, 'US')}
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
                                  title="Phát âm"
                                >
                                  <Volume2 className={`w-4 h-4 ${currentTheme.accentText}`} />
                                </button>
                              </div>
                            )}

                            {/* Category Hashtag Pill */}
                            <div className="inline-block pt-1">
                              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 text-xs font-black text-slate-200 border border-white/15">
                                # {currentTopicObj?.title || 'Từ vựng'}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Row on Front */}
                          <div className="flex items-end justify-between z-10 shrink-0">
                            {/* Cute Mascot Moon Avatar in Corner */}
                            <div className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center shadow-lg text-amber-300">
                              <span className="text-xl">🌙</span>
                            </div>

                            {/* Flip CTA Link */}
                            <div className="text-xs font-black text-slate-200 flex items-center gap-1 hover:text-white transition">
                              <span>Nhấn để xem nghĩa</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* 🍃 BACK SIDE (COLOR-COORDINATED & HIGH CONTRAST) */}
                      <div
                        className={`card-face-back rounded-3xl ${currentTheme.backBg} border-2 ${currentTheme.backBorder} shadow-2xl overflow-hidden ${
                          !isFlipped ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg) translate3d(0, 0, 0)',
                          transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
                        }}
                      >
                        <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                          
                          {/* Top Row on Back */}
                          <div className="flex items-center justify-between shrink-0 pb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-white/80">
                              NGHĨA TIẾNG VIỆT
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => playAudio(e, preferredAccent)}
                                className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-white border border-white/20 transition cursor-pointer active:scale-95"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleOpenEdit}
                                className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-white border border-white/20 transition cursor-pointer active:scale-95"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Center Stage: Vietnamese Meaning & Example Container */}
                          <div className="my-auto space-y-3.5 py-2">
                            
                            {/* Big Bold Meaning */}
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                              {currentCard.back}
                            </h2>

                            {/* English Definition Box */}
                            {currentCard.definitionEn && (
                              <div className={`${currentTheme.backBoxBg} rounded-2xl p-3.5 sm:p-4 border ${currentTheme.backBoxBorder} space-y-1 text-left shadow-lg`}>
                                <span className={`text-[10px] font-black uppercase ${currentTheme.accentText}`}>
                                  🇬🇧 ĐỊNH NGHĨA TIẾNG ANH:
                                </span>
                                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                                  {currentCard.definitionEn}
                                </p>
                              </div>
                            )}

                            {/* Real Example Box */}
                            {currentCard.example && (
                              <div className={`${currentTheme.backBoxBg} rounded-2xl p-3.5 sm:p-4 border-l-4 border-amber-300 border-t border-r border-b ${currentTheme.backBoxBorder} space-y-1 text-left shadow-lg`}>
                                <span className="text-[10px] font-black uppercase text-white/80">
                                  VÍ DỤ
                                </span>
                                <p className="text-xs sm:text-sm font-bold italic text-white leading-relaxed">
                                  &quot;{currentCard.example}&quot;
                                </p>
                                {currentCard.exampleVi && (
                                  <p className="text-xs text-white/80 font-bold pt-0.5">
                                    👉 {currentCard.exampleVi}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Synonyms & Collocations */}
                            {(currentCard.synonyms?.length || currentCard.collocations?.length) ? (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {currentCard.synonyms?.map((syn, idx) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-black/30 text-xs font-black text-white border border-white/15">
                                    🔗 {syn}
                                  </span>
                                ))}
                                {currentCard.collocations?.map((col, idx) => (
                                  <span key={idx} className={`px-2.5 py-1 rounded-xl bg-black/30 text-xs font-black ${currentTheme.accentText} border border-white/15`}>
                                    📌 {col}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                          </div>

                          {/* Bottom Row on Back */}
                          <div className="flex items-center justify-between text-xs font-black text-white/80 shrink-0 pt-3 border-t border-white/15">
                            {currentCardSRS ? (
                              <span>Ôn tiếp: {formatSRSCountdown(currentCardSRS.nextReviewDate)}</span>
                            ) : (
                              <span>Mới học</span>
                            )}
                            <span className="ml-auto hover:text-white transition flex items-center gap-1">
                              <RotateCw className="w-3.5 h-3.5" /> Chạm để lật lại
                            </span>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* ════════ 3 BIG ROUNDED ACTION BUTTONS (THEME COORDINATED) ════════ */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                
                {/* 🔴 Button 1: Chưa nhớ [1] */}
                <button
                  onClick={handleMarkNotRemembered}
                  className={`py-3.5 px-3 rounded-2xl ${currentTheme.btn1Bg} border ${currentTheme.btn1Border} ${currentTheme.btn1Text} text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-md`}
                  title="Phím tắt: 1"
                >
                  <span>❓ Chưa nhớ</span>
                  <kbd className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${currentTheme.btn1Kbd}`}>1</kbd>
                </button>

                {/* 🟢 Button 2: Lật thẻ [Space] */}
                <button
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className={`py-3.5 px-3 rounded-2xl ${currentTheme.btnSpaceBg} border ${currentTheme.btnSpaceBorder} ${currentTheme.btnSpaceText} text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-md`}
                  title="Phím tắt: Space"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Lật thẻ</span>
                  <kbd className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${currentTheme.btnSpaceKbd}`}>Space</kbd>
                </button>

                {/* 🟢 Button 3: Đã nhớ [2] */}
                <button
                  onClick={handleMarkRemembered}
                  className={`py-3.5 px-3 rounded-2xl ${currentTheme.btn2Bg} border ${currentTheme.btn2Border} ${currentTheme.btn2Text} text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-md`}
                  title="Phím tắt: 2"
                >
                  <Check className="w-4 h-4" />
                  <span>Đã nhớ</span>
                  <kbd className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${currentTheme.btn2Kbd}`}>2</kbd>
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
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-black text-slate-400">
                  <span>Thẻ <strong className="text-white">{currentIndex + 1}</strong> / {totalCardsInSet}</span>
                  <span>{Math.round(((currentIndex + 1) / (totalCardsInSet || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className={`${currentTheme.progressBarColor} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${((currentIndex + 1) / (totalCardsInSet || 1)) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* 🌟 RIGHT SIDE COMPANION PANELS (4 COLS - FULLY COORDINATED WITH THEME) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* 1. LULU & MIMI ĐỒNG HÀNH WIDGET */}
              <div className={`${currentTheme.companion1Bg} border ${currentTheme.companion1Border} rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-3`}>
                <div className="absolute top-2 right-2 text-white/20 text-xs">✨</div>
                <div className="absolute bottom-4 right-6 text-white/10 text-sm">✦</div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Sparkles className={`w-3 h-3 ${currentTheme.accentText}`} />
                    LULU & MIMI ĐỒNG HÀNH
                  </span>
                  <div className="w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-base shadow-xs">
                    🐱
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white leading-snug">
                    Cố lên, chinh phục cả bộ từ nào! 🌱
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    Học ngắt quãng hàng ngày giúp bạn nhớ lâu hơn gấp 3 lần.
                  </p>
                </div>

                <div className={`inline-block px-3.5 py-1.5 rounded-xl ${currentTheme.companion1TagBg} text-xs font-black ${currentTheme.companion1TagText}`}>
                  Còn lại <strong className="text-white">{unmasteredCardsInSet}</strong> từ chưa thuộc
                </div>
              </div>

              {/* 2. MỨC ĐỘ THÀNH THẠO (PROGRESS & MASTERY RING) */}
              <div className={`${currentTheme.companion2Bg} border ${currentTheme.companion2Border} rounded-3xl p-5 shadow-xl space-y-3.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    MỨC ĐỘ THÀNH THẠO
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-white/10 ${currentTheme.accentText} border border-white/10`}>
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
                        className={`${currentTheme.progressBarColor} transition-all duration-500`}
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
                      Bạn đã thuộc <strong className="text-white">{masteredCardsInSet}/{totalCardsInSet}</strong> từ trong bộ này.
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1.5 flex-1 rounded-full ${
                            lvl <= masteryLevel ? currentTheme.progressBarColor : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. BỘ ĐIỀU HƯỚNG TRƯỚC / SAU */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handlePrev}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl text-xs font-black text-slate-200 transition cursor-pointer active:scale-95 shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>

                <button
                  onClick={handleNext}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 ${currentTheme.nextBtnBg} rounded-2xl text-xs font-black transition shadow-lg cursor-pointer active:scale-95`}
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
