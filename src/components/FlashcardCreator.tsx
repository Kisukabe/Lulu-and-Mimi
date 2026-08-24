import React, { useState } from 'react';
import { Flashcard, Topic, VocabType, WordForm, TopicId, WordFormItem } from '../types';
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
  Layers,
  AlertTriangle,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface FlashcardCreatorProps {
  topics: Topic[];
  selectedTopic?: string;
  customFlashcards: Flashcard[];
  allFlashcards?: Flashcard[];
  onSaveFlashcard: (flashcard: Flashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onImportFlashcards: (cards: Flashcard[]) => void;
  onOpenFolderManager?: () => void;
}

export const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({
  topics,
  selectedTopic,
  customFlashcards,
  allFlashcards,
  onSaveFlashcard,
  onDeleteFlashcard,
  onImportFlashcards,
  onOpenFolderManager,
}) => {
  const getDefaultFolderId = () => {
    if (selectedTopic && selectedTopic !== 'all' && topics.some((t) => t.id === selectedTopic)) {
      return selectedTopic;
    }
    const nonAll = topics.filter((t) => t.id !== 'all');
    const custom = nonAll.find((t) => t.isCustom);
    if (custom) return custom.id;
    return nonAll[0]?.id || 'toeic';
  };

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
  const [topic, setTopic] = useState<TopicId | string>(() => getDefaultFolderId());
  const [example, setExample] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [synonymsInput, setSynonymsInput] = useState('');
  const [collocationsInput, setCollocationsInput] = useState('');
  const [wordForms, setWordForms] = useState<WordFormItem[]>([]);
  const [notes, setNotes] = useState('');

  // 🔎 Search & Filter for Custom Cards List
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [listFolderFilter, setListFolderFilter] = useState<string>('all');
  const [listOnlyDuplicates, setListOnlyDuplicates] = useState(false);

  // ⚠️ Duplicate Detection in the form
  const duplicateMatches = React.useMemo(() => {
    const term = front.trim().toLowerCase();
    if (!term || term.length < 2) return [];
    const pool = allFlashcards && allFlashcards.length > 0 ? allFlashcards : customFlashcards;
    return pool.filter(
      (c) => c.front.trim().toLowerCase() === term && c.id !== editingId
    );
  }, [front, allFlashcards, customFlashcards, editingId]);

  // Keep topic synced with selectedTopic if not editing an existing card
  React.useEffect(() => {
    if (!editingId) {
      setTopic(getDefaultFolderId());
    }
  }, [selectedTopic, topics, editingId]);

  // Live preview & UI states
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Word Forms Helpers
  const handleAddWordFormItem = (form: WordForm = 'noun') => {
    setWordForms((prev) => [...prev, { form, word: '', meaningVi: '' }]);
  };

  const handleUpdateWordFormItem = (index: number, field: keyof WordFormItem, value: string) => {
    setWordForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveWordFormItem = (index: number) => {
    setWordForms((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuickFill4Forms = () => {
    setWordForms([
      { form: 'noun', word: '', meaningVi: '' },
      { form: 'verb', word: '', meaningVi: '' },
      { form: 'adjective', word: '', meaningVi: '' },
      { form: 'adverb', word: '', meaningVi: '' },
    ]);
  };

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

      if (data.collocations && data.collocations.length > 0) {
        setCollocationsInput(data.collocations.slice(0, 4).join(', '));
      }

      const fetchedForms = data.wordForms || data.wordFamily;
      if (fetchedForms && Array.isArray(fetchedForms) && fetchedForms.length > 0) {
        setWordForms(fetchedForms);
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
    setTopic(getDefaultFolderId());
    setExample('');
    setExampleVi('');
    setSynonymsInput('');
    setCollocationsInput('');
    setWordForms([]);
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
    setTopic(card.topic || getDefaultFolderId());
    setExample(card.example || '');
    setExampleVi(card.exampleVi || '');
    setSynonymsInput(card.synonyms ? card.synonyms.join(', ') : '');
    setCollocationsInput(card.collocations ? card.collocations.join(', ') : '');
    const currentForms = card.wordForms || card.wordFamily;
    setWordForms(currentForms ? [...currentForms] : []);
    setNotes(card.notes || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Flashcard Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    // Check duplicate warning on new card creation
    if (!editingId && duplicateMatches.length > 0) {
      const topicNames = Array.from(
        new Set(
          duplicateMatches.map(
            (m) => topics.find((t) => t.id === m.topic)?.title || m.topic
          )
        )
      ).join(', ');
      const proceed = window.confirm(
        `⚠️ Cảnh báo: Từ "${front.trim()}" đã tồn tại trong bộ thẻ (${topicNames}).\n\nBạn có chắc chắn muốn tạo thêm thẻ trùng lặp này không?`
      );
      if (!proceed) return;
    }

    const synonyms = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const collocations = collocationsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const cleanWordForms = wordForms
      .filter((wf) => wf.word && wf.word.trim().length > 0)
      .map((wf) => ({
        form: wf.form,
        word: wf.word.trim(),
        meaningVi: wf.meaningVi?.trim() || undefined,
      }));

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
      wordForms: cleanWordForms.length > 0 ? cleanWordForms : undefined,
      wordFamily: cleanWordForms.length > 0 ? cleanWordForms : undefined,
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

            {/* ⚠️ Cảnh báo từ trùng lặp trực tiếp khi đang nhập */}
            {duplicateMatches.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/35 text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Từ này đã có trong bộ thẻ ({duplicateMatches.length} thẻ trùng)</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {duplicateMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-500/20 text-xs shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-slate-900 dark:text-white">
                            {match.front}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                            {topics.find((t) => t.id === match.topic)?.title || match.topic}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {match.wordForm}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate pt-0.5">
                          👉 {match.back}
                        </p>
                      </div>

                      {match.isCustom ? (
                        <button
                          type="button"
                          onClick={() => handleEdit(match)}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[10px] transition cursor-pointer shrink-0 shadow-xs"
                          title="Tải thẻ này vào biểu mẫu để chỉnh sửa"
                        >
                          Sửa Thẻ Này
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 shrink-0">
                          Thẻ mẫu
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

          {/* 🌳 Họ từ / Các dạng từ (Word Forms) */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <span>🌳 Họ từ / Các dạng từ (Word Forms)</span>
                <span className="text-[10px] font-normal text-amber-700/80 dark:text-amber-400">
                  (Noun, Verb, Adj, Adv...)
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                {wordForms.length === 0 && (
                  <button
                    type="button"
                    onClick={handleQuickFill4Forms}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Mẫu 4 dạng
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddWordFormItem('noun')}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Thêm dạng từ
                </button>
              </div>
            </div>

            {wordForms.length === 0 ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Chưa có dạng từ nào. Nhấn <strong>&quot;Mẫu 4 dạng&quot;</strong> hoặc <strong>&quot;+ Thêm dạng từ&quot;</strong> để nhập danh từ, động từ, tính từ, trạng từ liên quan.
              </p>
            ) : (
              <div className="space-y-2.5">
                {wordForms.map((wf, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={wf.form}
                        onChange={(e) => handleUpdateWordFormItem(idx, 'form', e.target.value as WordForm)}
                        aria-label="Loại dạng từ"
                        className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400 uppercase outline-none cursor-pointer w-28 shrink-0"
                      >
                        <option value="noun">Noun (N)</option>
                        <option value="verb">Verb (V)</option>
                        <option value="adjective">Adj (A)</option>
                        <option value="adverb">Adv (Adv)</option>
                        <option value="phrase">Phrase</option>
                        <option value="idiom">Idiom</option>
                      </select>
                      <input
                        type="text"
                        value={wf.word}
                        onChange={(e) => handleUpdateWordFormItem(idx, 'word', e.target.value)}
                        placeholder="Từ tiếng Anh (vd: resilience)"
                        className="flex-1 min-w-[100px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
                      />
                      <input
                        type="text"
                        value={wf.meaningVi || ''}
                        onChange={(e) => handleUpdateWordFormItem(idx, 'meaningVi', e.target.value)}
                        placeholder="Nghĩa TV (vd: sự kiên cường)"
                        className="flex-1 min-w-[100px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveWordFormItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Xóa dạng từ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* English Definition for this Word Form */}
                    <input
                      type="text"
                      value={wf.definitionEn || ''}
                      onChange={(e) => handleUpdateWordFormItem(idx, 'definitionEn', e.target.value)}
                      placeholder="🇬🇧 Định nghĩa tiếng Anh cho dạng từ này (tùy chọn)..."
                      className="w-full px-2.5 py-1.5 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-[11px] text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-amber-500/50"
                    />
                  </div>
                ))}
              </div>
            )}
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
              className="perspective-1000 w-full min-h-[350px] cursor-pointer select-none relative"
              onClick={() => setPreviewFlipped(!previewFlipped)}
            >
              <div
                className={`relative w-full h-full min-h-[350px] duration-500 transform-style-3d transition-transform ${
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
                <div className="absolute inset-0 w-full h-full bg-slate-900 text-white border-2 border-amber-500/60 rounded-3xl p-4 flex flex-col gap-2.5 shadow-md backface-hidden rotate-y-180 overflow-y-auto custom-scrollbar">
                  
                  {/* Top bar: word + part of speech */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/15 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 text-white font-black text-[9px] tracking-wider border border-white/20 uppercase">
                        {wordForm}
                      </span>
                      <span className="text-sm font-black text-yellow-300 leading-none">
                        {front || 'word'}
                      </span>
                      {pronunciation && (
                        <span className="text-[10px] font-mono font-bold text-slate-300">
                          {pronunciation}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-black uppercase text-amber-400/60">MẶT SAU</span>
                  </div>

                  {/* Body: unified rounded boxes */}
                  <div className="flex flex-col gap-1.5 flex-1">

                    {/* 🇻🇳 Nghĩa tiếng Việt */}
                    <div className="rounded-xl bg-white/8 border-2 border-lime-400/35 p-2.5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-lime-300">🇻🇳 Nghĩa</span>
                      <p className={`font-black text-lime-100 leading-tight break-words ${back ? 'text-sm' : 'text-xs opacity-40'}`}>
                        {back || 'Nhập nghĩa tiếng Việt...'}
                      </p>
                    </div>

                    {/* 📖 English Definition */}
                    {definitionEn ? (
                      <div className="rounded-xl bg-white/8 border-2 border-yellow-400/30 p-2.5 flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-yellow-300">
                          <BookOpen className="w-2.5 h-2.5 shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Definition</span>
                        </div>
                        <p className="text-[11px] font-semibold text-white leading-relaxed break-words line-clamp-3">
                          {definitionEn}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
                        <p className="text-[10px] text-slate-500 italic">Chưa có định nghĩa tiếng Anh</p>
                      </div>
                    )}

                    {/* 💬 Example */}
                    {example && (
                      <div className="rounded-xl bg-white/8 border border-white/15 p-2.5 flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-yellow-300">Example</span>
                        <p className="text-[11px] italic font-semibold text-white/85 leading-relaxed break-words line-clamp-2">
                          "{example}"
                        </p>
                      </div>
                    )}

                    {/* 🌳 Word Forms */}
                    {wordForms.some((wf) => wf.word && wf.word.trim().length > 0) && (
                      <div className="rounded-xl bg-white/8 border border-white/15 p-2.5 flex flex-col gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-yellow-300">Word Forms</span>
                        <div className="flex flex-wrap gap-1">
                          {wordForms
                            .filter((wf) => wf.word && wf.word.trim().length > 0)
                            .map((wf, idx) => (
                              <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 border border-white/15">
                                <span className="text-[8px] font-black uppercase text-yellow-400/80 tracking-wider">{wf.form}</span>
                                <span className="text-[10px] font-bold text-white">{wf.word}</span>
                              </div>
                            ))}
                        </div>
                      </div>
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
      {(() => {
        // Map of custom cards duplicate occurrences
        const duplicateCountsMap: Record<string, number> = {};
        customFlashcards.forEach((c) => {
          const key = c.front.trim().toLowerCase();
          duplicateCountsMap[key] = (duplicateCountsMap[key] || 0) + 1;
        });

        // Set of fronts in system default cards
        const systemFrontsSet = new Set(
          (allFlashcards || [])
            .filter((c) => !c.isCustom)
            .map((c) => c.front.trim().toLowerCase())
        );

        const checkIsCardDuplicated = (card: Flashcard) => {
          const key = card.front.trim().toLowerCase();
          return (duplicateCountsMap[key] || 0) > 1 || systemFrontsSet.has(key);
        };

        const totalDuplicateCardsCount = customFlashcards.filter((c) => checkIsCardDuplicated(c)).length;

        // Filtered custom cards based on search query, folder filter & duplicate toggle
        const filteredCustomCards = customFlashcards.filter((card) => {
          if (listFolderFilter !== 'all' && card.topic !== listFolderFilter) {
            return false;
          }
          if (listOnlyDuplicates && !checkIsCardDuplicated(card)) {
            return false;
          }
          if (listSearchQuery.trim()) {
            const q = listSearchQuery.trim().toLowerCase();
            const forms = card.wordForms || card.wordFamily || [];
            const matchFront = card.front.toLowerCase().includes(q);
            const matchBack = card.back.toLowerCase().includes(q);
            const matchDef = card.definitionEn?.toLowerCase().includes(q);
            const matchEx = card.example?.toLowerCase().includes(q);
            const matchExVi = card.exampleVi?.toLowerCase().includes(q);
            const matchTopic = (topics.find((t) => t.id === card.topic)?.title || card.topic).toLowerCase().includes(q);
            const matchPron = (card.pronunciation || card.pronunciationUs || card.pronunciationUk || '').toLowerCase().includes(q);
            const matchForms = forms.some(
              (wf) => wf.word.toLowerCase().includes(q) || (wf.meaningVi && wf.meaningVi.toLowerCase().includes(q))
            );
            const matchSyn = card.synonyms?.some((s) => s.toLowerCase().includes(q));
            const matchCol = card.collocations?.some((c) => c.toLowerCase().includes(q));

            if (!matchFront && !matchBack && !matchDef && !matchEx && !matchExVi && !matchTopic && !matchPron && !matchForms && !matchSyn && !matchCol) {
              return false;
            }
          }
          return true;
        });

        return (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            
            {/* Header & Small Search Box Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span>Danh Sách Thẻ Bạn Đã Tạo</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-black">
                    {filteredCustomCards.length}/{customFlashcards.length} thẻ
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  Tìm kiếm, lọc thư mục và kiểm tra phát hiện từ trùng lặp
                </p>
              </div>

              {/* Small Search Box & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 🔍 Khung nhỏ tìm kiếm từ */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={listSearchQuery}
                    onChange={(e) => setListSearchQuery(e.target.value)}
                    placeholder="Tìm từ, nghĩa, ví dụ..."
                    className="w-full pl-8 pr-7 py-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {listSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setListSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Folder filter */}
                <select
                  value={listFolderFilter}
                  onChange={(e) => setListFolderFilter(e.target.value)}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">📁 Tất cả thư mục</option>
                  {topics.filter((t) => t.id !== 'all').map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji || '📁'} {t.title}
                    </option>
                  ))}
                </select>

                {/* ⚠️ Nút lọc từ trùng lặp nếu có */}
                {totalDuplicateCardsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setListOnlyDuplicates((prev) => !prev)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 border ${
                      listOnlyDuplicates
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                    }`}
                    title={listOnlyDuplicates ? 'Hiển thị tất cả thẻ' : 'Chỉ hiển thị các từ bị trùng lặp'}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Trùng lặp ({totalDuplicateCardsCount})</span>
                  </button>
                )}

              </div>
            </div>

            {/* Content List */}
            {customFlashcards.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Bạn chưa tự tạo thẻ flashcard nào
                </p>
                <p className="text-xs text-slate-400">
                  Hãy dùng biểu mẫu phía trên hoặc tra cứu trong tab <strong>&quot;Tra Từ Điển&quot;</strong> để thêm từ vựng mới vào kho!
                </p>
              </div>
            ) : filteredCustomCards.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Không tìm thấy thẻ nào khớp với bộ lọc
                </p>
                <p className="text-xs text-slate-400">
                  {listSearchQuery ? `Không có từ nào chứa từ khóa "${listSearchQuery}".` : 'Hãy thử thay đổi điều kiện lọc thư mục hoặc từ trùng lặp.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setListSearchQuery('');
                    setListFolderFilter('all');
                    setListOnlyDuplicates(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-xs hover:bg-amber-300 transition cursor-pointer"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomCards.map((card) => {
                  const forms = card.wordForms || card.wordFamily;
                  const isDup = checkIsCardDuplicated(card);

                  return (
                    <div
                      key={card.id}
                      className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-xs transition ${
                        isDup
                          ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {card.vocabType} • {card.wordForm}
                            </span>
                            {isDup && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Trùng lặp
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {topics.find((t) => t.id === card.topic)?.title || card.topic}
                          </span>
                        </div>

                        <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{card.front}</span>
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

                        {/* Word Forms pills in card list */}
                        {forms && forms.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                              🌳 Word Forms:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {forms.map((wf, idx) => (
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
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
};
