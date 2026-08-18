import React, { useState, useEffect } from 'react';
import { DictionaryResult, Flashcard, Topic, TopicId } from '../types';
import {
  Search,
  Volume2,
  BookOpen,
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface DictionaryLookupProps {
  topics: Topic[];
  onAddCustomFlashcard: (flashcard: Flashcard) => void;
  searchHistory: string[];
  onUpdateSearchHistory: (history: string[]) => void;
}

export const DictionaryLookup: React.FC<DictionaryLookupProps> = ({
  topics,
  onAddCustomFlashcard,
  searchHistory,
  onUpdateSearchHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [selectedTopicForAdd, setSelectedTopicForAdd] = useState<TopicId | string>('daily');
  const [customMeaningVi, setCustomMeaningVi] = useState('');

  const handleSearch = async (wordToSearch?: string) => {
    const word = (wordToSearch || searchTerm).trim().toLowerCase();
    if (!word) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setAddedSuccess(false);

    try {
      const response = await axios.get(API_ENDPOINTS.fullDictionary(word), { timeout: 10000 });
      setResult(response.data);
      setCustomMeaningVi(response.data.vietnameseMeaning || '');

      // Add to search history
      const updated = [word, ...searchHistory.filter((w) => w.toLowerCase() !== word)].slice(0, 15);
      onUpdateSearchHistory(updated);
    } catch (err: any) {
      console.error('Dictionary search failed:', err);
      setError(
        err.response?.data?.error ||
          `Không tìm thấy từ vựng "${word}". Vui lòng kiểm tra lại chính tả hoặc thử lại.`
      );
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioUrl?: string, fallbackText?: string, accent: 'UK' | 'US' = 'US') => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => playSpeech(fallbackText || searchTerm, accent));
    } else {
      playSpeech(fallbackText || searchTerm, accent);
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

  // Convert DictionaryResult into a new Flashcard
  const handleSaveToFlashcard = () => {
    if (!result) return;

    const ukPhonetic = result.phonetics.find((p) => p.region === 'UK');
    const usPhonetic = result.phonetics.find((p) => p.region === 'US') || result.phonetics[0];

    const firstMeaning = result.meanings[0];
    const firstDef = firstMeaning?.definitions[0];

    const newCard: Flashcard = {
      id: `fc_custom_${Date.now()}`,
      topic: selectedTopicForAdd,
      vocabType: 'word',
      wordForm: (firstMeaning?.partOfSpeech as any) || 'noun',
      front: result.word.charAt(0).toUpperCase() + result.word.slice(1),
      definitionEn: firstDef?.definition || undefined,
      back: customMeaningVi.trim() || firstDef?.definition || 'Chưa cập nhật nghĩa',
      pronunciation: usPhonetic?.text || ukPhonetic?.text || '',
      pronunciationUk: ukPhonetic?.text,
      pronunciationUs: usPhonetic?.text,
      audioUk: ukPhonetic?.audio,
      audioUs: usPhonetic?.audio,
      example: firstDef?.example || result.examples[0] || '',
      synonyms: result.synonyms.slice(0, 5),
      antonyms: result.antonyms.slice(0, 5),
      collocations: result.collocations?.slice(0, 4),
      wordForms: result.wordForms || result.wordFamily,
      wordFamily: result.wordForms || result.wordFamily,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onAddCustomFlashcard(newCard);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Quick search keywords
  const popularKeywords = ['resilient', 'accomplish', 'meticulous', 'break the ice', 'ubiquitous', 'serendipity'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* 📘 Title Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <BookOpen className="w-48 h-48" />
        </div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Cambridge & Free Dictionary
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tra Từ Điển & Phát Âm IPA Chuẩn
          </h2>
          <p className="text-xs sm:text-sm text-teal-50 leading-relaxed font-medium">
            Tra cứu phát âm UK/US với file âm thanh mp3, nghĩa ngữ cảnh từ Cambridge Dictionary và lưu trực tiếp vào Flashcard cá nhân.
          </p>
        </div>
      </div>

      {/* 🔍 Search Bar Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex items-center"
      >
        <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập từ tiếng Anh cần tra (ví dụ: accomplish, resilient, meticulous...)"
          className="w-full pl-14 pr-32 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm transition"
        />
        <button
          type="submit"
          disabled={loading || !searchTerm.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Tra Từ</span>
        </button>
      </form>

      {/* Recent Search History & Popular Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold px-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Gợi ý & Lịch sử tra cứu gần đây:
          </span>
          {searchHistory.length > 0 && (
            <button
              onClick={() => onUpdateSearchHistory([])}
              className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Xóa lịch sử
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(searchHistory.length > 0 ? searchHistory : popularKeywords).map((word, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchTerm(word);
                handleSearch(word);
              }}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition cursor-pointer shadow-2xs"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Đang tra cứu từ điển Cambridge & Free Dictionary...
          </p>
          <p className="text-xs text-slate-400">
            Đang đồng bộ dữ liệu phiên âm IPA, audio MP3 và câu ví dụ...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">{error}</p>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Bạn có thể thử tra cứu từ khác hoặc sử dụng tab <strong>&quot;Trợ Lý AI&quot;</strong> để được giải thích chi tiết.
          </p>
        </div>
      )}

      {/* 📖 Result Card */}
      {result && !loading && (
        <div className="bg-white dark:bg-slate-900 border-2 border-teal-200/80 dark:border-teal-900/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in zoom-in-98 duration-200">
          
          {/* Header of Word Result */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {result.word}
                </h3>

                {/* Source Badges */}
                <div className="flex items-center gap-1.5">
                  {result.sources.includes('cambridge') && (
                    <span className="text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                      📘 Cambridge
                    </span>
                  )}
                  {result.sources.includes('free-dictionary') && (
                    <span className="text-[10px] font-black bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                      📗 Wiktionary
                    </span>
                  )}
                  {result.sources.includes('ai-generated') && (
                    <span className="text-[10px] font-black bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">
                      🤖 AI Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Pronunciation Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {result.phonetics.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                      {p.region ? `${p.region}: ` : ''}{p.text}
                    </span>
                    <button
                      onClick={() => playAudio(p.audio, result.word, p.region === 'UK' ? 'UK' : 'US')}
                      className="p-1 rounded-lg hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-600 transition cursor-pointer"
                      title={`Nghe phát âm ${p.region || ''}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Direct Cambridge external link */}
                <a
                  href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(result.word)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-600 dark:text-slate-400 transition ml-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở Cambridge.org
                </a>
              </div>
            </div>

            {/* Quick Add To Flashcards Box */}
            <div className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-4 space-y-2.5 sm:max-w-xs w-full">
              <div className="text-[11px] font-black text-teal-900 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Lưu Vào Flashcard
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Nghĩa tiếng Việt (tùy chỉnh):
                </label>
                <input
                  type="text"
                  value={customMeaningVi}
                  onChange={(e) => setCustomMeaningVi(e.target.value)}
                  placeholder="Nhập nghĩa tiếng Việt..."
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  📁 Thư mục lưu trữ:
                </label>
                <select
                  value={selectedTopicForAdd}
                  onChange={(e) => setSelectedTopicForAdd(e.target.value)}
                  aria-label="Chọn thư mục lưu trữ flashcard"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  {topics.filter((t) => t.id !== 'all').map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji || '📁'} {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveToFlashcard}
                disabled={addedSuccess}
                className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Đã Thêm Thành Công!
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Thêm Vào Flashcard
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meanings by Part of Speech */}
          <div className="space-y-6">
            {result.meanings.map((meaning, mIdx) => (
              <div key={mIdx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 font-extrabold uppercase text-xs rounded-xl border border-teal-200 dark:border-teal-800">
                    {meaning.partOfSpeech}
                  </span>
                </div>

                <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-teal-200 dark:border-teal-900">
                  {meaning.definitions.map((def, dIdx) => (
                    <div key={dIdx} className="space-y-1 text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                        <span className="font-bold text-teal-600 dark:text-teal-400 mr-1.5">{dIdx + 1}.</span>
                        {def.definition}
                      </p>
                      {def.example && (
                        <p className="text-slate-500 dark:text-slate-400 italic pl-4 border-l border-slate-200 dark:border-slate-800">
                          &quot;{def.example}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Synonyms & Antonyms Section */}
          {(result.synonyms.length > 0 || result.antonyms.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              {result.synonyms.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider block">
                    🔗 Từ đồng nghĩa (Synonyms):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.synonyms.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(s);
                          handleSearch(s);
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-300 font-semibold hover:border-teal-500 transition cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {result.antonyms.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider block">
                    🚫 Từ trái nghĩa (Antonyms):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.antonyms.map((a, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(a);
                          handleSearch(a);
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-700 dark:text-rose-300 font-semibold hover:border-rose-500 transition cursor-pointer"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
