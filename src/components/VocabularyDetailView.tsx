import React, { useState, useMemo } from 'react';
import { Flashcard, Topic, VocabType, WordForm, TopicId, SRSCardData } from '../types';
import {
  Search,
  BookOpen,
  Sparkles,
  Volume2,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Filter,
  ArrowUpDown,
  Link2,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  Plus,
  Wand2,
} from 'lucide-react';
import { formatSRSCountdown, getMemoryLevelName } from '../utils/srs';

interface VocabularyDetailViewProps {
  flashcards: Flashcard[];
  topics: Topic[];
  selectedTopic: TopicId | string;
  masteredIds: string[];
  needReviewIds: string[];
  srsRecords?: { [cardId: string]: SRSCardData };
  onToggleMastered: (cardId: string) => void;
  onToggleNeedReview: (cardId: string) => void;
  onMoveCardToFolder?: (cardId: string, newTopicId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onOpenQuickAdd?: () => void;
}

export const VocabularyDetailView: React.FC<VocabularyDetailViewProps> = ({
  flashcards,
  topics,
  selectedTopic,
  masteredIds,
  needReviewIds,
  srsRecords = {},
  onToggleMastered,
  onToggleNeedReview,
  onMoveCardToFolder,
  onDeleteCard,
  onOpenQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVocabType, setSelectedVocabType] = useState<VocabType | 'all'>('all');
  const [selectedWordForm, setSelectedWordForm] = useState<WordForm | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmastered' | 'review' | 'mastered'>('all');
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'difficulty' | 'status'>('az');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Toggle expand/collapse of individual cards
  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Play pronunciation
  const playAudio = (card: Flashcard, accent: 'UK' | 'US' = 'US') => {
    const audioUrl = accent === 'UK' ? card.audioUk : card.audioUs;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => playSpeech(card.front, accent));
    } else {
      playSpeech(card.front, accent);
    }
  };

  const playSpeech = (text: string, accent: 'UK' | 'US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy word to clipboard
  const handleCopy = (card: Flashcard) => {
    const textToCopy = `${card.front} (${card.pronunciation || ''})\n🇬🇧 Definition: ${card.definitionEn || ''}\n🇻🇳 Nghĩa: ${card.back}\n📝 Ví dụ: ${card.example || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & sort logic
  const filteredAndSortedCards = useMemo(() => {
    return flashcards
      .filter((card) => {
        // Topic filter
        if (selectedTopic !== 'all' && card.topic !== selectedTopic) {
          return false;
        }

        // Vocab type filter
        if (selectedVocabType !== 'all' && card.vocabType !== selectedVocabType) {
          return false;
        }

        // Word form filter
        if (selectedWordForm !== 'all' && card.wordForm !== selectedWordForm) {
          return false;
        }

        // Status filter
        if (statusFilter === 'mastered' && !masteredIds.includes(card.id)) return false;
        if (statusFilter === 'review' && !needReviewIds.includes(card.id)) return false;
        if (statusFilter === 'unmastered' && masteredIds.includes(card.id)) return false;

        // Search query filter (matches front, back, definitionEn, examples, synonyms)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchFront = card.front.toLowerCase().includes(q);
          const matchBack = card.back.toLowerCase().includes(q);
          const matchDefEn = card.definitionEn?.toLowerCase().includes(q);
          const matchExample = card.example?.toLowerCase().includes(q);
          const matchSynonym = card.synonyms?.some((s) => s.toLowerCase().includes(q));
          if (!matchFront && !matchBack && !matchDefEn && !matchExample && !matchSynonym) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'az') return a.front.localeCompare(b.front);
        if (sortBy === 'za') return b.front.localeCompare(a.front);
        if (sortBy === 'difficulty') {
          const diffMap: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
          return (diffMap[a.difficulty || 'Medium'] || 2) - (diffMap[b.difficulty || 'Medium'] || 2);
        }
        if (sortBy === 'status') {
          const isMasteredA = masteredIds.includes(a.id) ? 1 : 0;
          const isMasteredB = masteredIds.includes(b.id) ? 1 : 0;
          return isMasteredA - isMasteredB;
        }
        return 0;
      });
  }, [flashcards, selectedTopic, selectedVocabType, selectedWordForm, statusFilter, searchQuery, sortBy, masteredIds, needReviewIds]);

  const getVocabTypeBadge = (type: VocabType) => {
    switch (type) {
      case 'word':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <BookOpen className="w-2.5 h-2.5" /> Từ vựng
          </span>
        );
      case 'idiom':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <Sparkles className="w-2.5 h-2.5" /> Idiom
          </span>
        );
      case 'collocation':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <Link2 className="w-2.5 h-2.5" /> Collocation
          </span>
        );
      case 'phrasal-verb':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <ArrowUpDown className="w-2.5 h-2.5" /> Phrasal Verb
          </span>
        );
    }
  };

  const getWordFormBadge = (form?: string) => {
    if (!form) return null;
    const colors: Record<string, string> = {
      noun: 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      verb: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      adjective: 'bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      adverb: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    };
    const style = colors[form.toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';

    return (
      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${style}`}>
        {form}
      </span>
    );
  };

  const currentTopicObj = topics.find((t) => t.id === selectedTopic) || { title: 'Tất Cả Thư Mục', emoji: '📚' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner & Quick Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>{currentTopicObj.emoji || '📚'}</span>
            <span>{currentTopicObj.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredAndSortedCards.length} / {flashcards.length} từ vựng trong danh sách
          </p>
        </div>

        {/* Quick Add Button */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black transition shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
          >
            <Wand2 className="w-4 h-4" />
            <span>+ Thêm Từ & Tự Động Tạo Flashcard</span>
          </button>
        )}
      </div>

      {/* 🔍 Search & Multi-filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tra cứu nhanh theo từ tiếng Anh, định nghĩa, phát âm IPA, nghĩa tiếng Việt, hoặc ví dụ..."
            className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Vocab Type Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Loại:
            </span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'word', label: 'Từ vựng' },
              { id: 'idiom', label: 'Idioms' },
              { id: 'collocation', label: 'Collocations' },
              { id: 'phrasal-verb', label: 'Phrasal Verbs' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedVocabType(type.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  selectedVocabType === type.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Word Form Dropdown & Sorting */}
          <div className="flex items-center gap-2">
            <select
              value={selectedWordForm}
              onChange={(e) => setSelectedWordForm(e.target.value as any)}
              aria-label="Lọc theo dạng từ"
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1.5 font-bold outline-none cursor-pointer"
            >
              <option value="all">Mọi dạng từ (Form)</option>
              <option value="noun">Noun (Danh từ)</option>
              <option value="verb">Verb (Động từ)</option>
              <option value="adjective">Adjective (Tính từ)</option>
              <option value="adverb">Adverb (Trạng từ)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sắp xếp danh sách"
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1.5 font-bold outline-none cursor-pointer"
            >
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="difficulty">Độ khó</option>
              <option value="status">Trạng thái học</option>
            </select>
          </div>
        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Tìm thấy <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{filteredAndSortedCards.length}</span> mục từ vựng
          {searchQuery && <span> cho từ khóa &quot;{searchQuery}&quot;</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allExpanded: Record<string, boolean> = {};
              filteredAndSortedCards.forEach((c) => {
                allExpanded[c.id] = true;
              });
              setExpandedCards(allExpanded);
            }}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold cursor-pointer"
          >
            Mở rộng tất cả
          </button>
          <span>•</span>
          <button
            onClick={() => setExpandedCards({})}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold cursor-pointer"
          >
            Thu gọn
          </button>
        </div>
      </div>

      {/* Vocabulary Cards List */}
      {filteredAndSortedCards.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200">Không tìm thấy từ vựng phù hợp</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục từ vựng.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedCards.map((card) => {
            const isMastered = masteredIds.includes(card.id);
            const isNeedReview = needReviewIds.includes(card.id);
            const isExpanded = expandedCards[card.id] !== false; // Default expanded
            const cardSRS = srsRecords[card.id];
            const memoryBadge = cardSRS ? getMemoryLevelName(cardSRS.memoryLevel) : undefined;

            return (
              <div
                key={card.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md ${
                  isMastered
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isNeedReview
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {/* Top Bar of Each Card */}
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Word, IPA, Badges */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {card.front}
                      </h3>
                      {getVocabTypeBadge(card.vocabType)}
                      {getWordFormBadge(card.wordForm)}

                      {memoryBadge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${memoryBadge.badgeClass}`}>
                          {memoryBadge.label}
                        </span>
                      )}

                      {isMastered && !memoryBadge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          ✓ ĐÃ THUỘC
                        </span>
                      )}
                      {isNeedReview && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                          ⚠ CẦN ÔN LẠI
                        </span>
                      )}
                    </div>

                    {/* Pronunciation & Audio Buttons */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {(card.pronunciationUs || card.pronunciation || card.pronunciationUk) && (
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                          {card.pronunciationUs || card.pronunciation || card.pronunciationUk}
                        </span>
                      )}

                      <button
                        onClick={() => playAudio(card, 'US')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 transition font-bold text-[11px] cursor-pointer"
                        title="Nghe phát âm US"
                      >
                        <Volume2 className="w-3 h-3 text-indigo-500" /> US
                      </button>

                      <button
                        onClick={() => playAudio(card, 'UK')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition font-bold text-[11px] cursor-pointer"
                        title="Nghe phát âm UK"
                      >
                        <Volume2 className="w-3 h-3 text-blue-500" /> UK
                      </button>

                      {cardSRS && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-2">
                          <Clock className="w-3 h-3 text-amber-500" /> Ôn tiếp: {formatSRSCountdown(cardSRS.nextReviewDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Action Icons */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleCopy(card)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Sao chép từ vựng"
                    >
                      {copiedId === card.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Card Button */}
                    {onDeleteCard && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn XÓA từ "${card.front}" khỏi thư mục không?`)) {
                            onDeleteCard(card.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Xóa từ vựng này khỏi thư mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(card.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title={isExpanded ? 'Thu gọn' : 'Mở rộng chi tiết'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Card Body: English Definition (PRIORITY) & Vietnamese Meaning */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  
                  {/* 🇬🇧 English Definition (HERO BLOCK) */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-slate-50 dark:from-indigo-950/70 dark:via-purple-950/40 dark:to-slate-900 border border-indigo-200/90 dark:border-indigo-800/80 shadow-2xs space-y-1">
                    <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 🇬🇧 English Definition:
                    </span>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {card.definitionEn || card.back}
                    </p>
                  </div>

                  {/* 🇻🇳 Vietnamese Meaning (Supporting Translation) */}
                  <div className="flex items-center gap-2 px-1 text-xs sm:text-sm">
                    <span className="text-[11px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
                      🇻🇳 Bản dịch:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {card.back}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 text-xs animate-in fade-in duration-150">
                    
                    {/* Example Sentence */}
                    {card.example && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                            Ví dụ câu:
                          </span>
                          <button
                            onClick={() => playSpeech(card.example || '', 'US')}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          &quot;{card.example}&quot;
                        </p>
                        {card.exampleVi && (
                          <p className="text-slate-500 dark:text-slate-400">
                            👉 {card.exampleVi}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Synonyms & Collocations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {card.synonyms && card.synonyms.length > 0 && (
                        <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                            🔗 Từ đồng nghĩa:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {card.synonyms.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.collocations && card.collocations.length > 0 && (
                        <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                            🤝 Cụm thường gặp (Collocations):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {card.collocations.map((c, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 rounded-md border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Word Family */}
                    {card.wordFamily && card.wordFamily.length > 0 && (
                      <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          📦 Gia đình từ (Word Family):
                        </span>
                        {card.wordFamily.map((wf, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
                          >
                            <strong className="text-indigo-600 dark:text-indigo-400">{wf.form}:</strong> {wf.word}
                            {wf.meaningVi ? ` (${wf.meaningVi})` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {card.notes && (
                      <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-[11px]">
                        💡 <strong>Mẹo ghi nhớ:</strong> {card.notes}
                      </div>
                    )}

                    {/* Action Bar (Folder Move & Mastered/Need Review Toggles) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-bold">📁 Thư mục:</span>
                        <select
                          value={card.topic}
                          onChange={(e) => onMoveCardToFolder && onMoveCardToFolder(card.id, e.target.value)}
                          aria-label="Chuyển thư mục"
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-0.5 font-bold outline-none cursor-pointer text-[11px]"
                        >
                          {topics.filter((t) => t.id !== 'all').map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.emoji || '📁'} {t.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleNeedReview(card.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                            isNeedReview
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          Cần ôn lại
                        </button>

                        <button
                          onClick={() => onToggleMastered(card.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                            isMastered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Đã thuộc
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
