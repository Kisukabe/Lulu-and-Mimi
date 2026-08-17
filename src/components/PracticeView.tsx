import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Flashcard, Topic } from '../types';
import {
  Dumbbell,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  Shuffle,
  Link2,
  Puzzle,
  Lightbulb,
  Volume2,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

interface PracticeViewProps {
  flashcards: Flashcard[];
  topics: Topic[];
  selectedTopic: string;
}

// ─────────────────────────────────────────────────────────────
// CLOZE TEST MODE
// ─────────────────────────────────────────────────────────────
interface ClozeQuestion {
  card: Flashcard;
  sentence: string;      // sentence with the phrase replaced by ___
  answer: string;        // correct answer (front phrase)
  options: string[];     // 4 choices
  hint: string;          // definition in EN
}

function buildClozeQuestions(cards: Flashcard[], allCards: Flashcard[]): ClozeQuestion[] {
  return cards
    .filter((c) => c.example && c.example.length > 0)
    .map((card) => {
      // Build sentence with blank
      const phrase = card.front.toLowerCase();
      const sentence = card.example!.replace(
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        '___'
      );
      // If replacement didn't work, use a generic blank
      const cleanSentence = sentence === card.example
        ? card.example.replace(/^(.{0,40}\s)/, '___  ')
        : sentence;

      // 3 wrong options from similar vocab type
      const wrongPool = allCards
        .filter(
          (c) =>
            c.id !== card.id &&
            (c.vocabType === card.vocabType || c.vocabType === 'collocation' || c.vocabType === 'phrasal-verb') &&
            c.front.length < 35
        )
        .map((c) => c.front);

      const shuffledWrong = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [card.front, ...shuffledWrong].sort(() => Math.random() - 0.5);

      return {
        card,
        sentence: cleanSentence,
        answer: card.front,
        options,
        hint: card.definitionEn || card.back,
      };
    })
    .sort(() => Math.random() - 0.5);
}

// ─────────────────────────────────────────────────────────────
// MATCHING GAME MODE
// ─────────────────────────────────────────────────────────────
interface MatchCard {
  id: string;
  text: string;
  type: 'phrase' | 'meaning';
  pairId: string;
}

function buildMatchCards(cards: Flashcard[]): MatchCard[] {
  const selected = cards.slice(0, 6);
  const phrases: MatchCard[] = selected.map((c) => ({
    id: `phrase_${c.id}`,
    text: c.front,
    type: 'phrase',
    pairId: c.id,
  }));
  const meanings: MatchCard[] = selected.map((c) => ({
    id: `meaning_${c.id}`,
    text: c.back,
    type: 'meaning',
    pairId: c.id,
  }));
  return [...phrases, ...meanings.sort(() => Math.random() - 0.5)];
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export const PracticeView: React.FC<PracticeViewProps> = ({
  flashcards,
  topics,
  selectedTopic,
}) => {
  const [mode, setMode] = useState<'menu' | 'cloze' | 'matching'>('menu');

  // Filtered cards: collocations, idioms, phrasal-verbs in current folder
  const practiceCards = useMemo(() => {
    return flashcards.filter(
      (c) =>
        (selectedTopic === 'all' || c.topic === selectedTopic) &&
        (c.vocabType === 'collocation' || c.vocabType === 'idiom' || c.vocabType === 'phrasal-verb')
    );
  }, [flashcards, selectedTopic]);

  const currentFolder = topics.find((t) => t.id === selectedTopic);

  if (mode === 'cloze') {
    return (
      <ClozeMode
        cards={practiceCards}
        allCards={flashcards}
        onBack={() => setMode('menu')}
      />
    );
  }

  if (mode === 'matching') {
    return (
      <MatchingMode
        cards={practiceCards}
        onBack={() => setMode('menu')}
      />
    );
  }

  // ── Menu Screen ──────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_70%)]" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wider uppercase">
            <Dumbbell className="w-3.5 h-3.5" /> Luyện Tập Chuyên Sâu
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Collocations, Idioms & Phrasal Verbs
          </h2>
          <p className="text-sm text-violet-100 font-medium leading-relaxed max-w-xl">
            Luyện nhớ cụm từ trong ngữ cảnh thực tế — hiệu quả hơn 3–4x so với học flashcard thông thường.
          </p>
          <div className="flex items-center gap-3 pt-1 text-xs font-bold text-violet-200">
            <span>📁 {currentFolder?.emoji} {currentFolder?.title}</span>
            <span>•</span>
            <span>{practiceCards.length} cụm từ luyện tập</span>
          </div>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Cloze Test */}
        <button
          onClick={() => practiceCards.length >= 4 ? setMode('cloze') : undefined}
          disabled={practiceCards.filter(c => c.example).length < 4}
          className={`group relative p-6 rounded-3xl border-2 text-left transition-all cursor-pointer shadow-sm hover:shadow-xl ${
            practiceCards.filter(c => c.example).length >= 4
              ? 'bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/60 hover:border-violet-500 hover:scale-[1.02]'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-md shadow-violet-500/30 group-hover:scale-110 transition-transform">
            <Puzzle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
            🎯 Điền Vào Chỗ Trống
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Đọc câu thật → Đoán cụm từ bị ẩn → Chọn đáp án đúng. Luyện nhớ trong ngữ cảnh tự nhiên.
          </p>
          <div className="flex items-center gap-3 mt-4 text-[11px] font-bold">
            <span className="px-2 py-1 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-lg">
              {practiceCards.filter(c => c.example).length} câu có sẵn
            </span>
            <span className="text-slate-400">• Trắc nghiệm 4 lựa chọn</span>
          </div>
          {practiceCards.filter(c => c.example).length < 4 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-bold">
              ⚠️ Cần ít nhất 4 thẻ có câu ví dụ
            </p>
          )}
        </button>

        {/* Matching Game */}
        <button
          onClick={() => practiceCards.length >= 4 ? setMode('matching') : undefined}
          disabled={practiceCards.length < 4}
          className={`group relative p-6 rounded-3xl border-2 text-left transition-all cursor-pointer shadow-sm hover:shadow-xl ${
            practiceCards.length >= 4
              ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-500 hover:scale-[1.02]'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-4 shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <Link2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
            🔗 Nối Từ (Matching)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Nối cụm từ tiếng Anh với nghĩa tiếng Việt. Cách luyện phản xạ nhận diện nhanh.
          </p>
          <div className="flex items-center gap-3 mt-4 text-[11px] font-bold">
            <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg">
              {Math.min(6, practiceCards.length)} cặp / lượt
            </span>
            <span className="text-slate-400">• Tính thời gian</span>
          </div>
          {practiceCards.length < 4 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-bold">
              ⚠️ Cần ít nhất 4 thẻ
            </p>
          )}
        </button>
      </div>

      {/* Tips Section */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-black text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Tại Sao Collocations & Idioms Khó Nhớ?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <div className="space-y-1.5">
            <p className="font-bold">❌ Cách học SAI (flashcard đơn thuần):</p>
            <p className="opacity-80">Học "make progress" → Dịch "tiến bộ" → Quên ngay sau 2 ngày vì não không có kết nối ngữ cảnh.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold">✅ Cách học ĐÚNG (cloze + matching):</p>
            <p className="opacity-80">Đọc câu thật → Đoán cụm bị ẩn → Não ghi nhớ theo pattern câu → Dùng được ngay trong thực tế.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CLOZE TEST COMPONENT
// ─────────────────────────────────────────────────────────────
const ClozeMode: React.FC<{
  cards: Flashcard[];
  allCards: Flashcard[];
  onBack: () => void;
}> = ({ cards, allCards, onBack }) => {
  const [questions, setQuestions] = useState<ClozeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const q = buildClozeQuestions(cards, allCards);
    setQuestions(q);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setWrongAnswers([]);
    setIsFinished(false);
  }, [cards, allCards]);

  const current = questions[currentIdx];
  const isCorrect = selectedAnswer === current?.answer;
  const isAnswered = selectedAnswer !== null;
  const totalQuestions = questions.length;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    if (option === current.answer) {
      setScore((s) => s + 1);
    } else {
      setWrongAnswers((prev) => [...prev, current.answer]);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= totalQuestions) {
      setIsFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowHint(false);
    }
  };

  const handleRestart = () => {
    const q = buildClozeQuestions(cards, allCards);
    setQuestions(q);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setWrongAnswers([]);
    setIsFinished(false);
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  if (isFinished) {
    const pct = Math.round((score / totalQuestions) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl ${
            pct >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/60' : pct >= 50 ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-rose-50 dark:bg-rose-950/60'
          }`}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {pct >= 80 ? 'Xuất Sắc! 🎉' : pct >= 50 ? 'Không Tệ! 💪' : 'Cần Luyện Thêm 📖'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Đúng <strong className="text-indigo-600">{score}/{totalQuestions}</strong> câu — Đạt {pct}%
            </p>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="text-left bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4">
              <p className="text-xs font-black text-rose-700 dark:text-rose-300 mb-2">Các cụm cần ôn lại:</p>
              <div className="flex flex-wrap gap-1.5">
                {wrongAnswers.map((w, i) => (
                  <span key={i} className="px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 rounded-lg text-xs font-bold">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25"
            >
              <RotateCcw className="w-4 h-4" />
              Thử Lại
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition cursor-pointer"
            >
              Về Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Không có đủ câu ví dụ để luyện tập. Hãy thêm ví dụ vào các thẻ.
        </p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer">Về Menu</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-bold cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Về Menu
        </button>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">{currentIdx + 1} / {totalQuestions}</span>
          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full">
            ✓ {score} đúng
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className={`bg-white dark:bg-slate-900 border-2 rounded-3xl p-6 shadow-lg transition-all ${
        isAnswered
          ? isCorrect
            ? 'border-emerald-400 dark:border-emerald-600'
            : 'border-rose-400 dark:border-rose-600'
          : 'border-slate-200 dark:border-slate-800'
      }`}>
        {/* Vocab type badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
            current.card.vocabType === 'collocation' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
            current.card.vocabType === 'idiom' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
            'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
          }`}>
            {current.card.vocabType === 'collocation' ? '📌 Collocation' :
             current.card.vocabType === 'idiom' ? '💬 Idiom' : '🔄 Phrasal Verb'}
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
          >
            <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
          </button>
        </div>

        {/* Hint */}
        {showHint && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 animate-in fade-in duration-200">
            💡 <strong>Gợi ý:</strong> {current.hint}
          </div>
        )}

        {/* Sentence with blank */}
        <div className="mb-6">
          <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-wider">
            Điền vào chỗ trống:
          </p>
          <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
            {current.sentence.split('___').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`mx-1 px-3 py-0.5 rounded-xl font-black border-b-2 text-sm ${
                    !isAnswered
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-500'
                      : isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-700 dark:text-rose-300'
                  }`}>
                    {isAnswered ? current.answer : '___________'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>

          {/* Vietnamese translation after answering */}
          {isAnswered && current.card.exampleVi && (
            <div className="flex items-start gap-2 mt-3">
              <button
                onClick={() => playSpeech(current.card.example || '')}
                className="p-1 text-slate-400 hover:text-indigo-500 cursor-pointer mt-0.5"
                title="Nghe phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
                👉 {current.card.exampleVi}
              </p>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {current.options.map((option) => {
            let style = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-800';
            if (isAnswered) {
              if (option === current.answer) {
                style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 font-black';
              } else if (option === selectedAnswer) {
                style = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 text-rose-800 dark:text-rose-200';
              } else {
                style = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-60';
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer ${style} ${isAnswered ? 'cursor-default' : ''}`}
              >
                <span>{option}</span>
                {isAnswered && option === current.answer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                {isAnswered && option === selectedAnswer && option !== current.answer && <X className="w-4 h-4 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next */}
        {isAnswered && (
          <div className="mt-5 space-y-3 animate-in fade-in duration-200">
            <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              <div>
                <p>{isCorrect ? '✅ Chính xác! ' : `❌ Đáp án đúng là: "${current.answer}". `}</p>
                {current.card.notes && <p className="mt-1 opacity-80">💡 {current.card.notes}</p>}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-black transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {currentIdx + 1 >= totalQuestions ? (
                <><Trophy className="w-4 h-4" /> Xem Kết Quả</>
              ) : (
                <>Câu Tiếp Theo <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MATCHING GAME COMPONENT
// ─────────────────────────────────────────────────────────────
const MatchingMode: React.FC<{
  cards: Flashcard[];
  onBack: () => void;
}> = ({ cards, onBack }) => {
  const [round, setRound] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const shuffledCards = useMemo(() => {
    const pool = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);
    return pool;
  }, [cards, round]);

  const leftCol = useMemo(() => shuffledCards.map(c => ({ id: c.id, text: c.front })), [shuffledCards]);
  const rightCol = useMemo(() => [...shuffledCards].sort(() => Math.random() - 0.5).map(c => ({ id: c.id, text: c.back })), [shuffledCards]);

  const total = shuffledCards.length;
  const isFinished = matchedPairs.length === total;

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [isFinished, startTime]);

  // Handle right selection
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;
    const left = leftCol.find(c => c.id === selectedLeft);
    const right = rightCol.find(c => c.id === selectedRight);
    if (!left || !right) return;

    setAttempts(a => a + 1);

    if (left.id === right.id) {
      // Correct match
      setMatchedPairs(prev => [...prev, left.id]);
      setScore(s => s + 1);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong match - flash error then clear
      setWrongPair([selectedLeft, selectedRight]);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  }, [selectedLeft, selectedRight]);

  const handleNewRound = () => {
    setRound(r => r + 1);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    setScore(0);
    setAttempts(0);
    setStartTime(Date.now());
    setElapsed(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const accuracy = attempts > 0 ? Math.round((matchedPairs.length / attempts) * 100) : 100;

  if (isFinished) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="text-5xl">🏆</div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Hoàn Thành!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Bạn đã nối đúng tất cả {total} cặp từ</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl">
              <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{formatTime(elapsed)}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Thời Gian</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{accuracy}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Độ Chính Xác</p>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl">
              <p className="text-xl font-black text-violet-700 dark:text-violet-300">{attempts}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Lần Thử</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={handleNewRound}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" /> Vòng Mới
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition cursor-pointer"
            >
              Về Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-bold cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Về Menu
        </button>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span>⏱ {formatTime(elapsed)}</span>
          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full">
            ✓ {matchedPairs.length}/{total}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl px-4 py-2.5 text-[11px] text-indigo-700 dark:text-indigo-300 font-bold text-center">
        Chọn cụm từ bên trái → Chọn nghĩa tiếng Việt bên phải để nối cặp
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Left Column: English phrases */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Cụm từ tiếng Anh</p>
          {leftCol.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const isWrong = wrongPair?.[0] === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !isMatched && setSelectedLeft(isSelected ? null : item.id)}
                disabled={isMatched}
                className={`w-full px-3 py-3 rounded-2xl border-2 text-xs sm:text-sm font-bold transition-all text-center leading-snug cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 opacity-70 cursor-default'
                    : isWrong
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-300 animate-pulse'
                    : isSelected
                    ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 dark:border-violet-500 text-violet-800 dark:text-violet-200 shadow-md shadow-violet-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30'
                }`}
              >
                {isMatched && <span className="mr-1">✅</span>}
                {item.text}
              </button>
            );
          })}
        </div>

        {/* Right Column: Vietnamese meanings */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Nghĩa tiếng Việt</p>
          {rightCol.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedRight === item.id;
            const isWrong = wrongPair?.[1] === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !isMatched && selectedLeft && setSelectedRight(isSelected ? null : item.id)}
                disabled={isMatched || !selectedLeft}
                className={`w-full px-3 py-3 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all text-center leading-snug cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 opacity-70 cursor-default'
                    : isWrong
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-300 animate-pulse'
                    : isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 text-indigo-800 dark:text-indigo-200 shadow-md shadow-indigo-500/20 scale-[1.02]'
                    : selectedLeft
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                {isMatched && <span className="mr-1">✅</span>}
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
