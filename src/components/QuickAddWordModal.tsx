import React, { useState } from 'react';
import { Topic, Flashcard, TopicId, WordForm, VocabType, DictionaryResult } from '../types';
import {
  X,
  Sparkles,
  Plus,
  Loader2,
  Check,
  Volume2,
  Folder,
  Layers,
  BookOpen,
  ArrowRight,
  ListPlus,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface QuickAddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Topic[];
  selectedTopic: string;
  onAddFlashcard: (card: Flashcard) => void;
  onAddMultipleFlashcards?: (cards: Flashcard[]) => void;
  geminiKey?: string;
}

export const QuickAddWordModal: React.FC<QuickAddWordModalProps> = ({
  isOpen,
  onClose,
  folders,
  selectedTopic,
  onAddFlashcard,
  onAddMultipleFlashcards,
  geminiKey = '',
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [targetFolder, setTargetFolder] = useState<string>(() => {
    return selectedTopic === 'all' ? (folders.find((f) => f.id !== 'all')?.id || 'toeic') : selectedTopic;
  });

  // Single word state
  const [wordInput, setWordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewCard, setPreviewCard] = useState<Partial<Flashcard> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSaved, setSuccessSaved] = useState(false);

  // Bulk words state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; successCount: number } | null>(null);
  const [bulkFinished, setBulkFinished] = useState(false);

  if (!isOpen) return null;

  // Single word fetch & auto-fill
  const handleFetchWord = async (wordToSearch?: string) => {
    const term = (wordToSearch || wordInput).trim().toLowerCase();
    if (!term) return;

    setLoading(true);
    setErrorMsg(null);
    setPreviewCard(null);
    setSuccessSaved(false);

    try {
      const headers: Record<string, string> = {};
      if (geminiKey) {
        headers['X-Gemini-API-Key'] = geminiKey;
      }

      const res = await axios.get(API_ENDPOINTS.fullDictionary(term), {
        timeout: 15000,
        headers,
      });

      const data: DictionaryResult = res.data;

      const ukPhonetic = data.phonetics.find((p) => p.region === 'UK');
      const usPhonetic = data.phonetics.find((p) => p.region === 'US') || data.phonetics[0];

      const firstMeaning = data.meanings[0];
      const firstDef = firstMeaning?.definitions[0];

      // Detect vocab type
      let vocabType: VocabType = 'word';
      if (term.includes(' ') && !term.includes('take') && term.split(' ').length > 2) {
        vocabType = 'idiom';
      } else if (term.includes(' ') && (term.startsWith('make ') || term.startsWith('take ') || term.startsWith('do '))) {
        vocabType = 'collocation';
      } else if (term.split(' ').length === 2 && ['up', 'off', 'in', 'out', 'down', 'away', 'on', 'after', 'with'].includes(term.split(' ')[1])) {
        vocabType = 'phrasal-verb';
      }

      // Word form
      let wordForm: WordForm = 'noun';
      const posStr = (firstMeaning?.partOfSpeech || '').toLowerCase();
      if (posStr.includes('verb')) wordForm = 'verb';
      else if (posStr.includes('adj')) wordForm = 'adjective';
      else if (posStr.includes('adv')) wordForm = 'adverb';
      else if (posStr.includes('noun')) wordForm = 'noun';

      const generated: Partial<Flashcard> = {
        id: `fc_auto_${Date.now()}`,
        topic: targetFolder,
        vocabType,
        wordForm,
        front: data.word,
        back: data.vietnameseMeaning || firstDef?.definition || 'Đang cập nhật nghĩa...',
        definitionEn: firstDef?.definition || data.englishDefinition,
        pronunciation: usPhonetic?.text || ukPhonetic?.text || `/${data.word}/`,
        pronunciationUk: ukPhonetic?.text,
        pronunciationUs: usPhonetic?.text,
        audioUk: ukPhonetic?.audio,
        audioUs: usPhonetic?.audio,
        example: firstDef?.example || data.examples[0] || `We frequently use "${data.word}" in daily communication.`,
        exampleVi: firstDef?.exampleVi,
        synonyms: data.synonyms.slice(0, 5),
        collocations: data.collocations?.slice(0, 4),
        wordForms: data.wordForms || data.wordFamily,
        wordFamily: data.wordForms || data.wordFamily,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setPreviewCard(generated);
    } catch (err: any) {
      console.error('Auto lookup error:', err);
      setErrorMsg(
        err.response?.data?.error || `Không tìm thấy thông tin tự động cho "${term}". Bạn vẫn có thể nhập thủ công bên dưới.`
      );
      // Fallback simple card
      setPreviewCard({
        id: `fc_auto_${Date.now()}`,
        topic: targetFolder,
        vocabType: 'word',
        wordForm: 'noun',
        front: term,
        back: '',
        example: `Example sentence for ${term}.`,
        isCustom: true,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Save single card
  const handleSaveCard = () => {
    if (!previewCard || !previewCard.front) return;

    const currentWordForms = previewCard.wordForms || previewCard.wordFamily;

    const finalCard: Flashcard = {
      id: previewCard.id || `fc_auto_${Date.now()}`,
      topic: targetFolder,
      vocabType: previewCard.vocabType || 'word',
      wordForm: previewCard.wordForm || 'noun',
      front: previewCard.front.trim(),
      back: previewCard.back?.trim() || previewCard.front,
      definitionEn: previewCard.definitionEn?.trim(),
      pronunciation: previewCard.pronunciation?.trim(),
      pronunciationUk: previewCard.pronunciationUk?.trim(),
      pronunciationUs: previewCard.pronunciationUs?.trim(),
      audioUk: previewCard.audioUk,
      audioUs: previewCard.audioUs,
      example: previewCard.example?.trim(),
      exampleVi: previewCard.exampleVi?.trim(),
      synonyms: previewCard.synonyms,
      collocations: previewCard.collocations,
      wordForms: currentWordForms,
      wordFamily: currentWordForms,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onAddFlashcard(finalCard);
    setSuccessSaved(true);
    setTimeout(() => {
      setSuccessSaved(false);
      setPreviewCard(null);
      setWordInput('');
    }, 1200);
  };

  // Bulk process
  const handleBulkProcess = async () => {
    const rawWords = bulkInput
      .split(/[\n,;]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);

    const uniqueWords = Array.from(new Set(rawWords));
    if (uniqueWords.length === 0) return;

    setBulkLoading(true);
    setBulkFinished(false);
    setBulkProgress({ current: 0, total: uniqueWords.length, successCount: 0 });

    const createdCards: Flashcard[] = [];

    for (let i = 0; i < uniqueWords.length; i++) {
      const term = uniqueWords[i];
      setBulkProgress({ current: i + 1, total: uniqueWords.length, successCount: createdCards.length });

      try {
        const headers: Record<string, string> = {};
        if (geminiKey) headers['X-Gemini-API-Key'] = geminiKey;

        const res = await axios.get(API_ENDPOINTS.fullDictionary(term), {
          timeout: 10000,
          headers,
        });

        const data: DictionaryResult = res.data;
        const ukPhonetic = data.phonetics.find((p) => p.region === 'UK');
        const usPhonetic = data.phonetics.find((p) => p.region === 'US') || data.phonetics[0];
        const firstMeaning = data.meanings[0];
        const firstDef = firstMeaning?.definitions[0];

        createdCards.push({
          id: `fc_bulk_${Date.now()}_${i}`,
          topic: targetFolder,
          vocabType: 'word',
          wordForm: (firstMeaning?.partOfSpeech as WordForm) || 'noun',
          front: data.word,
          back: data.vietnameseMeaning || firstDef?.definition || term,
          definitionEn: firstDef?.definition,
          pronunciation: usPhonetic?.text || ukPhonetic?.text,
          pronunciationUk: ukPhonetic?.text,
          pronunciationUs: usPhonetic?.text,
          audioUk: ukPhonetic?.audio,
          audioUs: usPhonetic?.audio,
          example: firstDef?.example || data.examples[0],
          synonyms: data.synonyms.slice(0, 4),
          wordForms: data.wordForms || data.wordFamily,
          wordFamily: data.wordForms || data.wordFamily,
          isCustom: true,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        // Fallback simple card on failure
        createdCards.push({
          id: `fc_bulk_${Date.now()}_${i}`,
          topic: targetFolder,
          vocabType: 'word',
          wordForm: 'noun',
          front: term,
          back: term,
          isCustom: true,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (onAddMultipleFlashcards && createdCards.length > 0) {
      onAddMultipleFlashcards(createdCards);
    }
    setBulkLoading(false);
    setBulkFinished(true);
  };

  const playAudioPreview = (audioUrl?: string, fallbackText?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        if ('speechSynthesis' in window && fallbackText) {
          const utterance = new SpeechSynthesisUtterance(fallbackText);
          utterance.lang = 'en-US';
          window.speechSynthesis.speak(utterance);
        }
      });
    } else if ('speechSynthesis' in window && fallbackText) {
      const utterance = new SpeechSynthesisUtterance(fallbackText);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Tạo Thẻ Nhanh Tự Động</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Auto Dict
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập từ vựng, hệ thống sẽ tự động tìm nghĩa, IPA & ví dụ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Folder Picker & Mode Switcher) */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Target Folder Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-indigo-500" /> Thư mục:
            </span>
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs max-w-[200px]"
            >
              {folders
                .filter((f) => f.id !== 'all')
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.emoji || '📁'} {f.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Mode Switcher (Single vs Bulk) */}
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'single'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm 1 Từ Nhanh</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Hàng Loạt (Bulk)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          
          {/* TAB 1: SINGLE WORD AUTO-GENERATION */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              {/* Input & Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFetchWord();
                }}
                className="space-y-2"
              >
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Nhập Từ / Thành Ngữ / Cụm Từ Tiếng Anh:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder="Ví dụ: entrepreneur, take after, make a decision, ubiquitous..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || !wordInput.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang Tra...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Tự Động Tạo Thẻ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Error Notice if any */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Preview Card Box */}
              {previewCard && (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-4 sm:p-5 space-y-3.5 animate-in zoom-in-98 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                    <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Xem Trước Flashcard Tự Động:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {previewCard.wordForm || 'noun'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {previewCard.vocabType || 'word'}
                      </span>
                    </div>
                  </div>

                  {/* Word & Pronunciation */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {previewCard.front}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                        <span>{previewCard.pronunciation}</span>
                        {(previewCard.audioUk || previewCard.audioUs) && (
                          <button
                            type="button"
                            onClick={() => playAudioPreview(previewCard.audioUs || previewCard.audioUk, previewCard.front)}
                            className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition cursor-pointer"
                            title="Nghe phát âm chuẩn"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 🇬🇧 English Definition (Primary) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 🇬🇧 Định Nghĩa Tiếng Anh (English Definition):
                    </label>
                    <textarea
                      rows={2}
                      value={previewCard.definitionEn || ''}
                      onChange={(e) => setPreviewCard({ ...previewCard, definitionEn: e.target.value })}
                      placeholder="English definition..."
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>

                  {/* 🇻🇳 Vietnamese Meaning (Supporting) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      🇻🇳 Bản Dịch Tiếng Việt:
                    </label>
                    <input
                      type="text"
                      value={previewCard.back || ''}
                      onChange={(e) => setPreviewCard({ ...previewCard, back: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Example sentence */}
                  {previewCard.example && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                        Câu Ví Dụ:
                      </label>
                      <p className="text-xs italic text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                        &quot;{previewCard.example}&quot;
                      </p>
                    </div>
                  )}

                  {/* Word Forms */}
                  {((previewCard.wordForms && previewCard.wordForms.length > 0) || (previewCard.wordFamily && previewCard.wordFamily.length > 0)) && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        🌳 Word Forms (Dạng từ):
                      </label>
                      <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        {(previewCard.wordForms || previewCard.wordFamily || []).map((wf, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <strong className="text-amber-600 dark:text-amber-400 uppercase mr-1">{wf.form}:</strong>
                            {wf.word} {wf.meaningVi ? `(${wf.meaningVi})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={handleSaveCard}
                    disabled={successSaved}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {successSaved ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Đã Thêm Vào Thư Mục Thành Công!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Lưu Flashcard Vào Thư Mục</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BULK ADD WORDS */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Dán Danh Sách Từ (Mỗi từ 1 dòng hoặc cách nhau bởi dấu phẩy):
                </label>
                <textarea
                  rows={6}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={`accomplish, negotiate, decision, collaborate\nresilient\ntake into account\nprioritize`}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-400">
                  Hệ thống sẽ tự động tra cứu từ điển Cambridge cho từng từ và tạo flashcards hoàn chỉnh vào thư mục được chọn.
                </p>
              </div>

              {/* Progress Bar */}
              {bulkProgress && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                    <span className="flex items-center gap-1.5">
                      {bulkLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {bulkFinished ? '🎉 Hoàn tất tạo hàng loạt!' : 'Đang xử lý & tạo flashcards...'}
                    </span>
                    <span>
                      {bulkProgress.current} / {bulkProgress.total} từ
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bulk Submit Button */}
              <button
                type="button"
                onClick={handleBulkProcess}
                disabled={bulkLoading || !bulkInput.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {bulkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Tự Động Tra Cứu & Tạo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Bắt Đầu Tự Động Tạo Hàng Loạt</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
