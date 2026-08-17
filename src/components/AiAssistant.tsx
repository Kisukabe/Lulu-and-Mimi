import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Flashcard, Topic, TopicId } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  Check,
  RotateCcw,
  Loader2,
  Volume2,
  Key,
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface AiAssistantProps {
  topics: Topic[];
  selectedTopic: TopicId | string;
  onAddCustomFlashcard: (flashcard: Flashcard) => void;
  geminiKey: string;
  onOpenApiKeyModal: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  topics,
  selectedTopic,
  onAddCustomFlashcard,
  geminiKey,
  onOpenApiKeyModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      content:
        '👋 Xin chào! Tôi là **Lulu & Mimi AI** — Trợ lý học tiếng Anh thông minh của bạn. Bạn có thể hỏi tôi về nghĩa từ vựng, giải thích thành ngữ (idioms), cụm từ đi kèm (collocations), hoặc phân biệt các từ đồng nghĩa dễ gây nhầm lẫn.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedCardId, setAddedCardId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'Phân biệt sự khác nhau giữa "accomplish" và "achieve"?',
    'Gợi ý 3 idioms hay gặp trong chủ đề Daily Communication?',
    'Các collocations thông dụng nhất với từ "decision"?',
    'Giải thích cụm động từ "come up with" kèm ví dụ?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputMessage).trim();
    if (!textToSend || loading) return;

    // Nếu chưa có API key, nhắc user cài đặt
    if (!geminiKey) {
      onOpenApiKeyModal();
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const topicObj = topics.find((t) => t.id === selectedTopic);
      const res = await axios.post(
        API_ENDPOINTS.aiChat,
        {
          message: textToSend,
          history: messages.slice(-6),
          topicContext: topicObj ? topicObj.title : undefined,
        },
        {
          timeout: 25000,
          headers: {
            'X-Gemini-API-Key': geminiKey,
          },
        }
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: res.data.reply || 'Không có phản hồi từ máy chủ AI.',
        suggestedFlashcard: res.data.suggestedFlashcard,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Chat error:', err);
      const errMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ Có lỗi khi kết nối với Trợ lý AI. Vui lòng kiểm tra lại API Key của bạn trong phần Cài Đặt.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestedCard = (suggested: Partial<Flashcard>, msgId: string) => {
    if (!suggested.front || !suggested.back) return;

    const newCard: Flashcard = {
      id: `fc_ai_${Date.now()}`,
      topic: selectedTopic === 'all' ? 'custom' : selectedTopic,
      vocabType: suggested.vocabType || 'word',
      wordForm: suggested.wordForm || 'noun',
      front: suggested.front,
      back: suggested.back,
      pronunciation: suggested.pronunciation,
      example: suggested.example,
      exampleVi: suggested.exampleVi,
      synonyms: suggested.synonyms,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onAddCustomFlashcard(newCard);
    setAddedCardId(msgId);
    setTimeout(() => setAddedCardId(null), 3000);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Trợ Lý AI Học Từ Vựng Tiếng Anh
          </h2>
          <p className="text-xs sm:text-sm text-purple-50 leading-relaxed font-medium">
            Hỏi bất kỳ điều gì về từ vựng, cấu trúc câu, ngữ cảnh sử dụng hoặc nhờ AI tạo mẫu flashcard chất lượng cao.
          </p>
        </div>
      </div>

      {/* API Key Setup Banner (hiện khi chưa có key) */}
      {!geminiKey && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <div className="space-y-0.5">
            <p className="text-sm font-black text-amber-800 dark:text-amber-200">
              ⚠️ Chưa cài đặt Gemini API Key
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Bạn cần API Key riêng để dùng Trợ Lý AI. Lấy miễn phí tại Google AI Studio.
            </p>
          </div>
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer shrink-0 shadow-sm"
          >
            <Key className="w-3.5 h-3.5" />
            Cài Đặt Key
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col h-[560px] overflow-hidden">
        
        {/* Chat Header Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Lulu & Mimi English Assistant
              </h3>
              <p className="text-[10px] text-slate-400">
                Hỗ trợ giải đáp từ vựng • Phân tích ngữ cảnh • Trích xuất Flashcard
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome_msg_reset',
                  role: 'assistant',
                  content:
                    '✨ Cuộc trò chuyện đã được làm mới. Hãy đặt câu hỏi bất kỳ về từ vựng nhé!',
                  timestamp: new Date().toISOString(),
                },
              ])
            }
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-2 max-w-[88%] sm:max-w-[78%]">
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Suggested Flashcard Card if returned by AI */}
                  {msg.suggestedFlashcard && (
                    <div className="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase text-purple-700 dark:text-purple-300">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Gợi Ý Flashcard Từ AI:
                        </span>
                        <span className="text-[10px] bg-purple-200/70 dark:bg-purple-900 px-2 py-0.5 rounded-md">
                          {msg.suggestedFlashcard.vocabType || 'word'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-base font-black text-slate-900 dark:text-white">
                            {msg.suggestedFlashcard.front}
                          </strong>
                          {msg.suggestedFlashcard.pronunciation && (
                            <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                              {msg.suggestedFlashcard.pronunciation}
                            </span>
                          )}
                          <button
                            onClick={() => speakText(msg.suggestedFlashcard?.front || '')}
                            className="p-1 text-slate-400 hover:text-purple-600"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          👉 {msg.suggestedFlashcard.back}
                        </p>

                        {msg.suggestedFlashcard.example && (
                          <p className="text-slate-500 dark:text-slate-400 italic">
                            &quot;{msg.suggestedFlashcard.example}&quot;
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddSuggestedCard(msg.suggestedFlashcard!, msg.id)}
                        disabled={addedCardId === msg.id}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {addedCardId === msg.id ? (
                          <>
                            <Check className="w-4 h-4" /> Đã Thêm Vào Flashcard!
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Thêm Vào Flashcard Cá Nhân
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl rounded-bl-none bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>AI đang suy nghĩ và tra cứu kiến thức...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:border-purple-500 hover:text-purple-600 transition shrink-0 cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Hỏi AI về từ vựng, collocations, ví dụ câu hoặc idioms..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl transition shadow-md disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
