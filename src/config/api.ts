// API Configuration
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  aiChat: `${API_BASE_URL}/api/ai/chat`,
  dictionaryLookup: (word: string) => `${API_BASE_URL}/api/dictionary/lookup/${encodeURIComponent(word)}`,
  cambridgeLookup: (word: string) => `${API_BASE_URL}/api/dictionary/cambridge/${encodeURIComponent(word)}`,
  fullDictionary: (word: string) => `${API_BASE_URL}/api/dictionary/full/${encodeURIComponent(word)}`,
};
