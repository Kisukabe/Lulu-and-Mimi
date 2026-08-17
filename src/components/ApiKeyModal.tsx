import React, { useState } from 'react';
import { X, Key, ExternalLink, Eye, EyeOff, CheckCircle2, AlertCircle, Trash2, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  onSaveKey,
}) => {
  const [inputValue, setInputValue] = useState(geminiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const isValidFormat = inputValue.startsWith('AIza') && inputValue.length > 20;
  const hasKey = geminiKey.length > 0;

  const handleSave = () => {
    if (!inputValue.trim()) return;
    onSaveKey(inputValue.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    onSaveKey('');
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-black text-white">Cài Đặt Gemini API Key</h2>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed pl-10">
                  Nhập key riêng của bạn để sử dụng tính năng Trợ Lý AI. Key được lưu trên máy bạn, không gửi đến máy chủ của chúng tôi.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* Status Badge */}
            {hasKey ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  ✅ Đã cài đặt API Key — Trợ Lý AI đang hoạt động
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  ⚠️ Chưa có API Key — Trợ Lý AI chưa được kích hoạt
                </span>
              </div>
            )}

            {/* Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {inputValue.length > 0 && !isValidFormat && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                  ⚠️ Key không hợp lệ — Key Gemini thường bắt đầu bằng "AIza..."
                </p>
              )}
              {isValidFormat && (
                <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-medium">
                  ✅ Định dạng key hợp lệ
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 space-y-2 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cách lấy API Key miễn phí:
              </p>
              <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                  <span>Truy cập <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-bold underline underline-offset-2">Google AI Studio</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                  <span>Đăng nhập bằng tài khoản Google</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
                  <span>Nhấn <strong>"Create API key"</strong> → Copy key → Dán vào đây</span>
                </li>
              </ol>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition mt-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Lấy API Key Miễn Phí
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {hasKey && (
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xoá Key
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={!inputValue.trim() || saved}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-violet-600/20 flex items-center justify-center gap-1.5"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã Lưu!
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    Lưu API Key
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
              🔒 Key được lưu trong trình duyệt của bạn — chúng tôi không lưu trữ
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
