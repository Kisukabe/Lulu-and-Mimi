import React, { useState } from 'react';
import { Topic, Flashcard } from '../types';
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  X,
  Check,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Topic[];
  allCards: Flashcard[];
  selectedTopic: string;
  onSelectTopic: (topicId: string) => void;
  onCreateFolder: (folder: { title: string; emoji: string; description?: string }) => void;
  onUpdateFolder: (id: string, updates: { title: string; emoji: string; description?: string }) => void;
  onDeleteFolder: (id: string) => void;
  onRestoreDefaultFolders?: () => void;
}

const POPULAR_EMOJIS = ['📁', '🎯', '💼', '🎓', '💬', '📚', '✈️', '💻', '💡', '🚀', '🌟', '🔥', '🏆', '📈', '🎨', '🏷️', '📖', '🔑'];

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
  folders,
  allCards,
  selectedTopic,
  onSelectTopic,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onRestoreDefaultFolders,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingFolderId(null);
    setTitle('');
    setEmoji('📁');
    setDescription('');
    setIsCreating(true);
  };

  const handleStartEdit = (f: Topic) => {
    setIsCreating(false);
    setEditingFolderId(f.id);
    setTitle(f.title);
    setEmoji(f.emoji || '📁');
    setDescription(f.description || '');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingFolderId) {
      onUpdateFolder(editingFolderId, {
        title: title.trim(),
        emoji,
        description: description.trim() || undefined,
      });
      setEditingFolderId(null);
    } else {
      onCreateFolder({
        title: title.trim(),
        emoji,
        description: description.trim() || undefined,
      });
      setIsCreating(false);
    }

    setTitle('');
    setEmoji('📁');
    setDescription('');
  };

  const getFolderCardCount = (folderId: string) => {
    if (folderId === 'all') return allCards.length;
    return allCards.filter((c) => c.topic === folderId).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Quản Lý & Xóa / Thêm Thư Mục
              </h3>
              <p className="text-[11px] text-slate-400">
                Thêm thư mục mới, đổi tên hoặc xóa vĩnh viễn bất kỳ thư mục nào
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          
          {/* Create or Edit Form */}
          {(isCreating || editingFolderId) ? (
            <form onSubmit={handleSaveSubmit} className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-98 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {editingFolderId ? 'Chỉnh Sửa Thư Mục' : 'Tạo Thư Mục Mới'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingFolderId(null);
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Biểu Tượng Thư Mục:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition cursor-pointer ${
                        emoji === em
                          ? 'bg-indigo-600 text-white shadow-xs scale-110'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Tên Thư Mục *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: TOEIC Part 5, Cụm từ đàm phán, Chuyên ngành IT..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Mô tả ngắn (tùy chọn)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú mục đích của thư mục..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingFolderId ? 'Lưu Thay Đổi' : 'Tạo Thư Mục'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingFolderId(null);
                  }}
                  className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartCreate}
              className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl text-xs font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Thêm Thư Mục Mới</span>
            </button>
          )}

          {/* List of Folders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              <span>Danh Sách Thư Mục ({folders.length}):</span>
              <span className="text-slate-400 text-[10px] lowercase font-normal">(bấm thùng rác để xóa luôn thư mục)</span>
            </div>

            <div className="space-y-1.5">
              {folders.map((f) => {
                const count = getFolderCardCount(f.id);
                const isSelected = selectedTopic === f.id;
                const isDefaultAll = f.id === 'all';

                return (
                  <div
                    key={f.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
                      onClick={() => {
                        onSelectTopic(f.id);
                        onClose();
                      }}
                      title="Chọn học thư mục này"
                    >
                      <span className="text-xl shrink-0">{f.emoji || '📁'}</span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                            {f.title}
                          </span>
                          {f.isCustom && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Tự Tạo
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                              Đang Chọn
                            </span>
                          )}
                        </div>

                        {f.description && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {f.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Controls: Edit, Delete, Select */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {count} từ
                      </span>

                      {!isDefaultAll && (
                        <>
                          <button
                            onClick={() => handleStartEdit(f)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Đổi tên / Chỉnh sửa thư mục"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* 🗑️ XÓA LUÔN BẤT KỲ THƯ MỤC NÀO (KỂ CẢ THƯ MỤC MẪU) */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Bạn có chắc chắn muốn XÓA LUÔN thư mục "${f.title}" không?`
                                )
                              ) {
                                onDeleteFolder(f.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition cursor-pointer"
                            title="Xóa luôn thư mục này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          onSelectTopic(f.id);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition cursor-pointer"
                        title="Vào học thư mục này"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer with Restore Defaults & Close */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          {onRestoreDefaultFolders && (
            <button
              onClick={() => {
                if (confirm('Khôi phục lại danh sách các thư mục mẫu ban đầu?')) {
                  onRestoreDefaultFolders();
                }
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
              title="Khôi phục lại các thư mục mặc định"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi Phục Mặc Định</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
