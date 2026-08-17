import React, { useState } from 'react';
import { Flashcard, Topic, VocabType, WordForm, TopicId } from '../types';
import {
  PenTool,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Download,
  Upload,
  RotateCw,
  Search,
  Check,
  Loader2,
  BookOpen,
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface FlashcardCreatorProps {
  topics: Topic[];
  customFlashcards: Flashcard[];
  onSaveFlashcard: (flashcard: Flashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onImportFlashcards: (cards: Flashcard[]) => void;
  onOpenFolderManager?: () => void;
}

export const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({
  topics,
  customFlashcards,
  onSaveFlashcard,
  onDeleteFlashcard,
  onImportFlashcards,
  onOpenFolderManager,
}) => {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [front, setFront] = useState('');
  const [definitionEn, setDefinitionEn] = useState('');
  const [back, setBack] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [pronunciationUk, setPronunciationUk] = useState('');
  const [pronunciationUs, setPronunciationUs] = useState('');
  const [audioUk, setAudioUk] = useState('');
  const [audioUs, setAudioUs] = useState('');
  const [vocabType, setVocabType] = useState<VocabType>('word');
  const [wordForm, setWordForm] = useState<WordForm>('noun');
  const [topic, setTopic] = useState<TopicId | string>('custom');
  const [example, setExample] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [synonymsInput, setSynonymsInput] = useState('');
  const [collocationsInput, setCollocationsInput] = useState('');
  const [notes, setNotes] = useState('');

  // Live preview & UI states
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 🔍 Auto-fill from Dictionary API
  const handleAutoFill = async () => {
    if (!front.trim()) return;

    setIsAutoFilling(true);
    setAutoFillSuccess(false);

    try {
      const res = await axios.get(API_ENDPOINTS.fullDictionary(front.trim().toLowerCase()), {
        timeout: 8000,
      });
      const data = res.data;

      const ukP = data.phonetics?.find((p: any) => p.region === 'UK');
      const usP = data.phonetics?.find((p: any) => p.region === 'US') || data.phonetics?.[0];

      if (usP?.text) setPronunciation(usP.text);
      if (ukP?.text) setPronunciationUk(ukP.text);
      if (usP?.text) setPronunciationUs(usP.text);
      if (ukP?.audio) setAudioUk(ukP.audio);
      if (usP?.audio) setAudioUs(usP.audio);

      const firstMeaning = data.meanings?.[0];
      if (firstMeaning) {
        if (firstMeaning.partOfSpeech) {
          const pos = firstMeaning.partOfSpeech.toLowerCase();
          if (['noun', 'verb', 'adjective', 'adverb'].includes(pos)) {
            setWordForm(pos as WordForm);
          }
        }
        if (firstMeaning.definitions?.[0]?.definition) {
          setDefinitionEn(firstMeaning.definitions[0].definition);
        }
        if (firstMeaning.definitions?.[0]?.example) {
          setExample(firstMeaning.definitions[0].example);
        }
      }

      if (data.vietnameseMeaning && !back) {
        setBack(data.vietnameseMeaning);
      }

      if (data.synonyms && data.synonyms.length > 0) {
        setSynonymsInput(data.synonyms.slice(0, 4).join(', '));
      }

      setAutoFillSuccess(true);
      setTimeout(() => setAutoFillSuccess(false), 2500);
    } catch (err) {
      console.warn('Auto-fill from dictionary failed:', err);
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFront('');
    setDefinitionEn('');
    setBack('');
    setPronunciation('');
    setPronunciationUk('');
    setPronunciationUs('');
    setAudioUk('');
    setAudioUs('');
    setVocabType('word');
    setWordForm('noun');
    setTopic('custom');
    setExample('');
    setExampleVi('');
    setSynonymsInput('');
    setCollocationsInput('');
    setNotes('');
    setPreviewFlipped(false);
  };

  // Load for edit
  const handleEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setFront(card.front);
    setDefinitionEn(card.definitionEn || '');
    setBack(card.back);
    setPronunciation(card.pronunciation || '');
    setPronunciationUk(card.pronunciationUk || '');
    setPronunciationUs(card.pronunciationUs || '');
    setAudioUk(card.audioUk || '');
    setAudioUs(card.audioUs || '');
    setVocabType(card.vocabType || 'word');
    setWordForm(card.wordForm || 'noun');
    setTopic(card.topic || 'custom');
    setExample(card.example || '');
    setExampleVi(card.exampleVi || '');
    setSynonymsInput(card.synonyms ? card.synonyms.join(', ') : '');
    setCollocationsInput(card.collocations ? card.collocations.join(', ') : '');
    setNotes(card.notes || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Flashcard Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    const synonyms = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const collocations = collocationsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const flashcard: Flashcard = {
      id: editingId || `fc_custom_${Date.now()}`,
      topic,
      vocabType,
      wordForm,
      front: front.trim(),
      definitionEn: definitionEn.trim() || undefined,
      back: back.trim(),
      pronunciation: pronunciation.trim() || undefined,
      pronunciationUk: pronunciationUk.trim() || undefined,
      pronunciationUs: pronunciationUs.trim() || undefined,
      audioUk: audioUk.trim() || undefined,
      audioUs: audioUs.trim() || undefined,
      example: example.trim() || undefined,
      exampleVi: exampleVi.trim() || undefined,
      synonyms: synonyms.length > 0 ? synonyms : undefined,
      collocations: collocations.length > 0 ? collocations : undefined,
      notes: notes.trim() || undefined,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onSaveFlashcard(flashcard);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    resetForm();
  };

  // Export custom flashcards to JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(customFlashcards, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lulu-Mimi-Custom-Flashcards-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import flashcards from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportFlashcards(parsed);
          alert(`Đã nhập thành công ${parsed.length} thẻ flashcard!`);
        }
      } catch (err) {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wider uppercase">
            <PenTool className="w-3.5 h-3.5" /> Bộ Công Cụ Tự Tạo Flashcard
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {editingId ? 'Chỉnh Sửa Thẻ Flashcard' : 'Tạo Thẻ Từ Vựng Mới Bằng Tay'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-50 leading-relaxed font-medium">
            Tự thêm từ vựng, thành ngữ hoặc cụm từ bạn muốn học kèm <strong>định nghĩa tiếng Anh</strong> và nghĩa tiếng Việt. Sử dụng tính năng <strong>Tự động điền</strong> để lấy nhanh từ từ điển!
          </p>
        </div>
      </div>

      {/* Main Form & 3D Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (7 cols) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {editingId ? 'Cập Nhật Thông Tin Thẻ' : 'Thông Tin Thẻ Ghi Nhớ'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Hủy Chỉnh Sửa
              </button>
            )}
          </div>

          {/* Front Word & Auto-fill */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Mặt trước (Từ / Cụm từ tiếng Anh) *</span>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutoFilling || !front.trim()}
                className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isAutoFilling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>🔍 Tự điền từ Cambridge</span>
              </button>
            </label>
            <input
              type="text"
              required
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Ví dụ: Resilient, Break the ice..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
            />
            {autoFillSuccess && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
                <Check className="w-3.5 h-3.5" /> Đã lấy thông tin IPA, định nghĩa tiếng Anh & ví dụ thành công!
              </p>
            )}
          </div>

          {/* 🇬🇧 English Definition Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>🇬🇧 Định nghĩa bằng tiếng Anh (English Definition)</span>
            </label>
            <textarea
              rows={2}
              value={definitionEn}
              onChange={(e) => setDefinitionEn(e.target.value)}
              placeholder="Ví dụ: Able to quickly return to a previous good condition after difficult situations."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Back (Vietnamese Meaning) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              🇻🇳 Mặt sau (Nghĩa tiếng Việt) *
            </label>
            <input
              type="text"
              required
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Ví dụ: Kiên cường, phục hồi nhanh sau khó khăn..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
            />
          </div>

          {/* Classification & Topic Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Phân Loại Mục
              </label>
              <select
                value={vocabType}
                onChange={(e) => setVocabType(e.target.value as VocabType)}
                aria-label="Phân loại mục từ vựng"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="word">Word (Từ vựng)</option>
                <option value="idiom">Idiom (Thành ngữ)</option>
                <option value="collocation">Collocation (Cụm từ)</option>
                <option value="phrasal-verb">Phrasal Verb (Cụm ĐT)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Dạng Từ (Form)
              </label>
              <select
                value={wordForm}
                onChange={(e) => setWordForm(e.target.value as WordForm)}
                aria-label="Dạng từ tiếng Anh"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="noun">Noun (Danh từ)</option>
                <option value="verb">Verb (Động từ)</option>
                <option value="adjective">Adjective (Tính từ)</option>
                <option value="adverb">Adverb (Trạng từ)</option>
                <option value="phrase">Phrase (Cụm từ)</option>
                <option value="idiom">Idiom (Thành ngữ)</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Thư Mục Lưu</span>
                {onOpenFolderManager && (
                  <button
                    type="button"
                    onClick={onOpenFolderManager}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + Thư mục
                  </button>
                )}
              </div>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Chủ đề từ vựng"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                {topics.filter((t) => t.id !== 'all').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji || '📁'} {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pronunciation IPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Phiên âm IPA (Chung / US)
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="Ví dụ: /rɪˈzɪl.jənt/"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Phiên âm UK (tùy chọn)
              </label>
              <input
                type="text"
                value={pronunciationUk}
                onChange={(e) => setPronunciationUk(e.target.value)}
                placeholder="Ví dụ: /rɪˈzɪl.i.ənt/"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Example Sentence */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Câu ví dụ tiếng Anh
            </label>
            <textarea
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Ví dụ: The company proved resilient in face of challenges."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Synonyms & Collocations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Từ đồng nghĩa (cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                value={synonymsInput}
                onChange={(e) => setSynonymsInput(e.target.value)}
                placeholder="tough, adaptable, robust"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Collocation (cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                value={collocationsInput}
                onChange={(e) => setCollocationsInput(e.target.value)}
                placeholder="highly resilient, resilient spirit"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Đã Lưu Thẻ Thành Công!
                </>
              ) : editingId ? (
                <>
                  <Edit className="w-4 h-4" /> Cập Nhật Thẻ
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Lưu Thẻ Vào Kho
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition cursor-pointer"
            >
              Làm Mới
            </button>
          </div>
        </form>

        {/* Right Column: 3D Live Preview & Action Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live 3D Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>Xem trước thẻ 3D thời gian thực:</span>
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Chạm thẻ để lật
              </span>
            </div>

            <div
              className="perspective-1000 w-full h-[330px] cursor-pointer select-none relative"
              onClick={() => setPreviewFlipped(!previewFlipped)}
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  previewFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side Preview */}
                <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-3xl p-6 flex flex-col justify-between shadow-md backface-hidden">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
                    <span className="uppercase">{vocabType} • {wordForm}</span>
                    <span className="text-amber-500">MẶT TRƯỚC</span>
                  </div>

                  <div className="text-center my-auto space-y-2">
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {front || 'Nhập từ tiếng Anh...'}
                    </h4>
                    {pronunciation && (
                      <p className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 py-1 px-3 rounded-xl inline-block">
                        {pronunciation}
                      </p>
                    )}
                  </div>

                  <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    Chạm để xem mặt sau
                  </div>
                </div>

                {/* Back Side Preview */}
                <div className="absolute inset-0 w-full h-full bg-slate-900 text-white border-2 border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between shadow-md backface-hidden rotate-y-180">
                  <div className="flex items-center justify-between text-[11px] font-black text-amber-400">
                    <span>MẶT SAU (NGHĨA & ĐỊNH NGHĨA)</span>
                    <span className="text-slate-400">{front}</span>
                  </div>

                  <div className="text-center my-auto space-y-2">
                    {definitionEn && (
                      <p className="text-xs text-indigo-300 font-medium italic bg-indigo-950/60 p-2 rounded-xl border border-indigo-900 text-left line-clamp-2">
                        🇬🇧 {definitionEn}
                      </p>
                    )}
                    <h4 className="text-base sm:text-lg font-black text-emerald-400">
                      🇻🇳 {back || 'Nhập nghĩa tiếng Việt...'}
                    </h4>
                    {example && (
                      <p className="text-xs text-slate-300 italic bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-left line-clamp-2">
                        &quot;{example}&quot;
                      </p>
                    )}
                  </div>

                  <div className="text-center text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                    Chạm để quay lại mặt trước
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Import / Export JSON Actions */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Sao Lưu & Chia Sẻ Kho Thẻ
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                disabled={customFlashcards.length === 0}
                className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Xuất File JSON
              </button>

              <label className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Nhập File JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* 📋 List of Custom Created Flashcards */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Danh Sách Thẻ Bạn Đã Tạo ({customFlashcards.length} thẻ)
          </h3>
        </div>

        {customFlashcards.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Bạn chưa tự tạo thẻ flashcard nào
            </p>
            <p className="text-xs text-slate-400">
              Hãy dùng biểu mẫu phía trên hoặc tra cứu trong tab <strong>&quot;Tra Từ Điển&quot;</strong> để thêm từ vựng mới vào kho!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFlashcards.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:border-amber-300 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {card.vocabType} • {card.wordForm}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {topics.find((t) => t.id === card.topic)?.title || card.topic}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {card.front}
                  </h4>
                  {card.pronunciation && (
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      {card.pronunciation}
                    </span>
                  )}
                  {card.definitionEn && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 italic pt-0.5 line-clamp-2">
                      🇬🇧 {card.definitionEn}
                    </p>
                  )}
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 pt-0.5">
                    👉 {card.back}
                  </p>
                  {card.example && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-0.5 line-clamp-2">
                      &quot;{card.example}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleEdit(card)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Chỉnh sửa thẻ"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa thẻ "${card.front}" không?`)) {
                        onDeleteFlashcard(card.id);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                    title="Xóa thẻ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
