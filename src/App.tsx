import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProgress,
  TopicId,
  Flashcard,
  QuizResult,
  Topic,
} from './types';
import { DEFAULT_TOPICS } from './data/topics';
import { FLASHCARDS } from './data/flashcards';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { calculateNextSRS } from './utils/srs';

// Components
import { Header } from './components/Header';
import { FlashcardView } from './components/FlashcardView';
import { VocabularyDetailView } from './components/VocabularyDetailView';
import { DictionaryLookup } from './components/DictionaryLookup';
import { FlashcardCreator } from './components/FlashcardCreator';
import { QuizView } from './components/QuizView';
import { AiAssistant } from './components/AiAssistant';
import { StatsView } from './components/StatsView';
import { FolderManagerModal } from './components/FolderManagerModal';
import { PracticeView } from './components/PracticeView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { QuickAddWordModal } from './components/QuickAddWordModal';

const STORAGE_KEY = 'lulu_mimi_user_progress_v1';
const THEME_KEY = 'lulu_mimi_theme_mode_v1';
const TOPIC_KEY = 'lulu_mimi_selected_topic_v1';
const FOLDERS_KEY = 'lulu_mimi_folders_list_v2';
const GEMINI_KEY_STORAGE = 'lulu_mimi_gemini_key_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'flashcards' | 'vocabulary' | 'dictionary' | 'create' | 'quiz' | 'practice' | 'ai' | 'stats'
  >('flashcards');

  // ═══════════════════════════════════════════════════════════════
  // 0. GEMINI API KEY (Per-user, stored in localStorage)
  // ═══════════════════════════════════════════════════════════════
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickAddTopic, setQuickAddTopic] = useState<string>('toeic');

  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    try {
      if (key) {
        localStorage.setItem(GEMINI_KEY_STORAGE, key);
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE);
      }
    } catch {
      // ignore storage errors
    }
  };

  // Dynamic Folders state (User can add, edit, or delete ANY folder!)
  const [folders, setFolders] = useState<Topic[]>(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load folders', e);
    }
    return DEFAULT_TOPICS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    } catch (e) {
      console.error('Failed to save folders', e);
    }
  }, [folders]);

  const [selectedTopic, setSelectedTopic] = useState<TopicId | string>(() => {
    try {
      const saved = localStorage.getItem(TOPIC_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load saved topic', e);
    }
    return 'toeic'; // Default focus on TOEIC!
  });

  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);

  const handleSelectTopic = (topicId: TopicId | string) => {
    setSelectedTopic(topicId);
    try {
      localStorage.setItem(TOPIC_KEY, topicId);
    } catch (e) {
      console.error('Failed to save topic', e);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 1. THEME MODE MANAGEMENT (Light / Dark / System)
  // ═══════════════════════════════════════════════════════════════
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
    return 'system';
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, themeMode);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }

    const root = document.documentElement;

    const applyTheme = (mode: 'light' | 'dark' | 'system') => {
      let isDark = false;
      if (mode === 'dark') isDark = true;
      else if (mode === 'light') isDark = false;
      else isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // ═══════════════════════════════════════════════════════════════
  // 2. USER PROGRESS STATE & LOCALSTORAGE PERSISTENCE
  // ═══════════════════════════════════════════════════════════════
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          masteredFlashcardIds: parsed.masteredFlashcardIds || [],
          needReviewFlashcardIds: parsed.needReviewFlashcardIds || [],
          deletedCardIds: parsed.deletedCardIds || [],
          quizHistory: parsed.quizHistory || [],
          bookmarkedQuestions: parsed.bookmarkedQuestions || [],
          customFlashcards: parsed.customFlashcards || [],
          customTopics: parsed.customTopics || [],
          searchHistory: parsed.searchHistory || [],
          srsRecords: parsed.srsRecords || {},
        };
      }
    } catch (e) {
      console.error('Failed to load user progress', e);
    }
    return {
      masteredFlashcardIds: [],
      needReviewFlashcardIds: [],
      deletedCardIds: [],
      quizHistory: [],
      bookmarkedQuestions: [],
      customFlashcards: [],
      customTopics: [],
      searchHistory: [],
      srsRecords: {},
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }, [userProgress]);

  // All Folders (Persistent dynamic list)
  const allFolders: Topic[] = folders;

  // Combined flashcards pool (filtered with deleted IDs)
  const allFlashcards = useMemo(() => {
    const deletedIds = new Set(userProgress.deletedCardIds || []);
    const customCardIds = new Set((userProgress.customFlashcards || []).map((c) => c.id));
    const filteredStatic = FLASHCARDS.filter((c) => !customCardIds.has(c.id) && !deletedIds.has(c.id));
    const filteredCustom = (userProgress.customFlashcards || []).filter((c) => !deletedIds.has(c.id));
    return [...filteredStatic, ...filteredCustom];
  }, [userProgress.customFlashcards, userProgress.deletedCardIds]);

  // ═══════════════════════════════════════════════════════════════
  // 3. FOLDER (TOPIC) CRUD HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const handleCreateFolder = (folderData: { title: string; emoji: string; description?: string }) => {
    const newFolder: Topic = {
      id: `folder_${Date.now()}`,
      title: folderData.title,
      emoji: folderData.emoji,
      description: folderData.description,
      isCustom: true,
      createdAt: new Date().toISOString(),
      color: 'from-indigo-600 to-violet-600',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    };
    setFolders((prev) => [...prev, newFolder]);
    handleSelectTopic(newFolder.id);
  };

  const handleUpdateFolder = (id: string, updates: { title: string; emoji: string; description?: string }) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDeleteFolder = (id: string) => {
    const remainingFolders = folders.filter((f) => f.id !== id);
    setFolders(remainingFolders);

    const fallbackFolderId = remainingFolders.find((f) => f.id !== 'all')?.id || 'toeic';

    // Move any cards inside that folder to the fallback folder
    setUserProgress((prev) => {
      const updatedCustom = (prev.customFlashcards || []).map((c) =>
        c.topic === id ? { ...c, topic: fallbackFolderId } : c
      );
      return {
        ...prev,
        customFlashcards: updatedCustom,
      };
    });

    if (selectedTopic === id) {
      handleSelectTopic(fallbackFolderId);
    }
  };

  const handleRestoreDefaultFolders = () => {
    setFolders(DEFAULT_TOPICS);
    handleSelectTopic('toeic');
  };

  // Move Card to Another Folder (File to Directory)
  const handleMoveCardToFolder = (cardId: string, newTopicId: string) => {
    setUserProgress((prev) => {
      const isCustom = prev.customFlashcards.some((c) => c.id === cardId);
      if (isCustom) {
        return {
          ...prev,
          customFlashcards: prev.customFlashcards.map((c) =>
            c.id === cardId ? { ...c, topic: newTopicId } : c
          ),
        };
      } else {
        // It's a static card being moved -> clone into customFlashcards with new folder
        const originalCard = FLASHCARDS.find((c) => c.id === cardId);
        if (originalCard) {
          const clonedCard: Flashcard = {
            ...originalCard,
            topic: newTopicId,
            isCustom: true,
          };
          return {
            ...prev,
            customFlashcards: [clonedCard, ...prev.customFlashcards.filter((c) => c.id !== cardId)],
          };
        }
        return prev;
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // 4. PROGRESS & FLASHCARD HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const handleToggleMastered = (cardId: string) => {
    setUserProgress((prev) => {
      const isMastered = prev.masteredFlashcardIds.includes(cardId);
      const newMastered = isMastered
        ? prev.masteredFlashcardIds.filter((id) => id !== cardId)
        : [...prev.masteredFlashcardIds, cardId];

      const newNeedReview = isMastered
        ? prev.needReviewFlashcardIds
        : prev.needReviewFlashcardIds.filter((id) => id !== cardId);

      return {
        ...prev,
        masteredFlashcardIds: newMastered,
        needReviewFlashcardIds: newNeedReview,
      };
    });
  };

  const handleToggleNeedReview = (cardId: string) => {
    setUserProgress((prev) => {
      const isNeedReview = prev.needReviewFlashcardIds.includes(cardId);
      const newNeedReview = isNeedReview
        ? prev.needReviewFlashcardIds.filter((id) => id !== cardId)
        : [...prev.needReviewFlashcardIds, cardId];

      const newMastered = isNeedReview
        ? prev.masteredFlashcardIds
        : prev.masteredFlashcardIds.filter((id) => id !== cardId);

      return {
        ...prev,
        masteredFlashcardIds: newMastered,
        needReviewFlashcardIds: newNeedReview,
      };
    });
  };

  const handleRateCardSRS = (cardId: string, rating: 1 | 2 | 3 | 4 | 5) => {
    setUserProgress((prev) => {
      const existingSRS = prev.srsRecords?.[cardId];
      const updatedSRS = calculateNextSRS(cardId, existingSRS, rating);

      // Again(1) hoặc Hard(2) → chưa thuộc; Good(3)+ → đánh dấu đã thuộc
      const isMastered = rating >= 3;
      const newMastered = isMastered
        ? Array.from(new Set([...prev.masteredFlashcardIds, cardId]))
        : prev.masteredFlashcardIds.filter((id) => id !== cardId);

      // Again(1) → đánh dấu cần ôn; các rating khác → bỏ cờ cần ôn
      const newNeedReview = rating === 1
        ? Array.from(new Set([...prev.needReviewFlashcardIds, cardId]))
        : prev.needReviewFlashcardIds.filter((id) => id !== cardId);

      return {
        ...prev,
        masteredFlashcardIds: newMastered,
        needReviewFlashcardIds: newNeedReview,
        srsRecords: {
          ...(prev.srsRecords || {}),
          [cardId]: updatedSRS,
        },
      };
    });
  };

  const handleToggleBookmark = (questionId: number) => {
    setUserProgress((prev) => {
      const bookmarked = prev.bookmarkedQuestions || [];
      const isBookmarked = bookmarked.includes(questionId);
      const newBookmarks = isBookmarked
        ? bookmarked.filter((id) => id !== questionId)
        : [...bookmarked, questionId];

      return {
        ...prev,
        bookmarkedQuestions: newBookmarks,
      };
    });
  };

  const handleSaveQuizResult = (result: QuizResult) => {
    setUserProgress((prev) => ({
      ...prev,
      quizHistory: [...(prev.quizHistory || []), result],
    }));
  };

  const handleSaveCustomFlashcard = (flashcard: Flashcard) => {
    setUserProgress((prev) => {
      const existingIdx = prev.customFlashcards.findIndex((c) => c.id === flashcard.id);
      let updatedCustom: Flashcard[];
      if (existingIdx >= 0) {
        updatedCustom = [...prev.customFlashcards];
        updatedCustom[existingIdx] = flashcard;
      } else {
        updatedCustom = [flashcard, ...prev.customFlashcards];
      }

      return {
        ...prev,
        customFlashcards: updatedCustom,
      };
    });
  };

  const handleDeleteCustomFlashcard = (id: string) => {
    handleDeleteFlashcard(id);
  };

  // Universal card deletion (Both built-in and user-created)
  const handleDeleteFlashcard = (id: string) => {
    setUserProgress((prev) => {
      const updatedDeleted = Array.from(new Set([...(prev.deletedCardIds || []), id]));
      return {
        ...prev,
        deletedCardIds: updatedDeleted,
        customFlashcards: (prev.customFlashcards || []).filter((c) => c.id !== id),
        masteredFlashcardIds: (prev.masteredFlashcardIds || []).filter((cid) => cid !== id),
        needReviewFlashcardIds: (prev.needReviewFlashcardIds || []).filter((cid) => cid !== id),
      };
    });
  };

  const handleQuickAddSingleCard = (card: Flashcard) => {
    setUserProgress((prev) => {
      const deletedSet = new Set(prev.deletedCardIds || []);
      deletedSet.delete(card.id);
      return {
        ...prev,
        deletedCardIds: Array.from(deletedSet),
        customFlashcards: [card, ...(prev.customFlashcards || []).filter((c) => c.id !== card.id)],
      };
    });
  };

  const handleQuickAddMultipleCards = (cards: Flashcard[]) => {
    setUserProgress((prev) => {
      const newIds = new Set(cards.map((c) => c.id));
      const deletedSet = new Set(prev.deletedCardIds || []);
      cards.forEach((c) => deletedSet.delete(c.id));
      return {
        ...prev,
        deletedCardIds: Array.from(deletedSet),
        customFlashcards: [...cards, ...(prev.customFlashcards || []).filter((c) => !newIds.has(c.id))],
      };
    });
  };

  const handleOpenQuickAddModal = (targetFolderId?: string) => {
    const topicToUse = targetFolderId || (selectedTopic === 'all' ? (folders.find((f) => f.id !== 'all')?.id || 'toeic') : selectedTopic);
    setQuickAddTopic(topicToUse);
    setIsQuickAddModalOpen(true);
  };

  const handleImportFlashcards = (cards: Flashcard[]) => {
    setUserProgress((prev) => {
      const existingIds = new Set(prev.customFlashcards.map((c) => c.id));
      const newCards = cards.filter((c) => !existingIds.has(c.id));
      return {
        ...prev,
        customFlashcards: [...newCards, ...prev.customFlashcards],
      };
    });
  };

  const handleUpdateSearchHistory = (history: string[]) => {
    setUserProgress((prev) => ({
      ...prev,
      searchHistory: history,
    }));
  };

  const handleResetProgress = () => {
    const freshState: UserProgress = {
      masteredFlashcardIds: [],
      needReviewFlashcardIds: [],
      quizHistory: [],
      bookmarkedQuestions: [],
      customFlashcards: userProgress.customFlashcards,
      customTopics: userProgress.customTopics,
      searchHistory: [],
      srsRecords: {},
    };
    setUserProgress(freshState);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Top Sleek Navigation Header with Integrated Folder Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        masteredCount={userProgress.masteredFlashcardIds.length}
        totalCards={allFlashcards.length}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        folders={allFolders}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        onOpenFolderManager={() => setIsFolderManagerOpen(true)}
        geminiKey={geminiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* Tab 1: 3D Flashcards */}
        {activeTab === 'flashcards' && (
          <FlashcardView
            flashcards={allFlashcards}
            topics={allFolders}
            selectedTopic={selectedTopic}
            masteredIds={userProgress.masteredFlashcardIds}
            needReviewIds={userProgress.needReviewFlashcardIds}
            srsRecords={userProgress.srsRecords || {}}
            onToggleMastered={handleToggleMastered}
            onToggleNeedReview={handleToggleNeedReview}
            onRateCardSRS={handleRateCardSRS}
            onMoveCardToFolder={handleMoveCardToFolder}
            onDeleteCard={handleDeleteFlashcard}
            onOpenQuickAdd={() => handleOpenQuickAddModal(selectedTopic)}
          />
        )}

        {/* Tab 2: Vocabulary Detail View (Khung từ vựng chi tiết) */}
        {activeTab === 'vocabulary' && (
          <VocabularyDetailView
            flashcards={allFlashcards}
            topics={allFolders}
            selectedTopic={selectedTopic}
            masteredIds={userProgress.masteredFlashcardIds}
            needReviewIds={userProgress.needReviewFlashcardIds}
            srsRecords={userProgress.srsRecords || {}}
            onToggleMastered={handleToggleMastered}
            onToggleNeedReview={handleToggleNeedReview}
            onMoveCardToFolder={handleMoveCardToFolder}
            onDeleteCard={handleDeleteFlashcard}
            onOpenQuickAdd={() => handleOpenQuickAddModal(selectedTopic)}
          />
        )}

        {/* Tab 3: Dictionary Lookup (Cambridge & Free Dict) */}
        {activeTab === 'dictionary' && (
          <DictionaryLookup
            topics={allFolders}
            onAddCustomFlashcard={handleSaveCustomFlashcard}
            searchHistory={userProgress.searchHistory || []}
            onUpdateSearchHistory={handleUpdateSearchHistory}
          />
        )}

        {/* Tab 4: Flashcard Creator (CRUD) */}
        {activeTab === 'create' && (
          <FlashcardCreator
            topics={allFolders}
            customFlashcards={userProgress.customFlashcards || []}
            onSaveFlashcard={handleSaveCustomFlashcard}
            onDeleteFlashcard={handleDeleteCustomFlashcard}
            onImportFlashcards={handleImportFlashcards}
            onOpenFolderManager={() => setIsFolderManagerOpen(true)}
          />
        )}

        {/* Tab 5: Quiz View */}
        {activeTab === 'quiz' && (
          <QuizView
            questions={QUIZ_QUESTIONS}
            flashcards={allFlashcards}
            topics={allFolders}
            selectedTopic={selectedTopic}
            bookmarkedIds={userProgress.bookmarkedQuestions || []}
            onToggleBookmark={handleToggleBookmark}
            onSaveQuizResult={handleSaveQuizResult}
          />
        )}

        {/* Tab 6: Practice View (Collocations & Idioms) */}
        {activeTab === 'practice' && (
          <PracticeView
            flashcards={allFlashcards}
            topics={allFolders}
            selectedTopic={selectedTopic}
          />
        )}

        {/* Tab 7: AI Assistant */}
        {activeTab === 'ai' && (
          <AiAssistant
            topics={allFolders}
            selectedTopic={selectedTopic}
            onAddCustomFlashcard={handleSaveCustomFlashcard}
            geminiKey={geminiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}

        {/* Tab 8: Stats View */}
        {activeTab === 'stats' && (
          <StatsView
            progress={userProgress}
            totalFlashcards={allFlashcards.length}
            allFlashcards={allFlashcards}
            topics={allFolders}
            onResetProgress={handleResetProgress}
          />
        )}

      </main>

      {/* 🔑 API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        geminiKey={geminiKey}
        onSaveKey={handleSaveGeminiKey}
      />

      {/* 📁 Folder Manager Modal (Quản lý Thư Mục & Tệp Từ Vựng) */}
      <FolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        folders={allFolders}
        allCards={allFlashcards}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        onRestoreDefaultFolders={handleRestoreDefaultFolders}
        onOpenQuickAdd={(folderId) => handleOpenQuickAddModal(folderId)}
      />

      {/* 🪄 Quick Add Word Modal (Tự động tra từ & tạo Flashcard) */}
      <QuickAddWordModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        folders={allFolders}
        selectedTopic={quickAddTopic}
        onAddFlashcard={handleQuickAddSingleCard}
        onAddMultipleFlashcards={handleQuickAddMultipleCards}
        geminiKey={geminiKey}
      />

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold">
            © 2026 Lulu & Mimi — Hệ Thống Quản Lý Thư Mục & Flashcard Từ Vựng Tiếng Anh
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[11px]">
            Tích hợp phát âm chuẩn IPA từ Cambridge Dictionary & Free Dictionary API
          </p>
        </div>
      </footer>

    </div>
  );
}
