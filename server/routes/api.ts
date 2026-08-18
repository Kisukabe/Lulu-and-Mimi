import { Router, Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { DictionaryResult, PhoneticInfo, DictMeaning } from '../../src/types';

dotenv.config();

export const apiRouter = Router();

// Server-level default GEMINI_API_KEY (optional, can be empty if each user uses their own key)
const defaultServerApiKey = process.env.GEMINI_API_KEY || '';

// ═══════════════════════════════════════════════════════════════
// 1. HEALTH CHECK ENDPOINT
// ═══════════════════════════════════════════════════════════════
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    aiConfiguredOnServer: !!defaultServerApiKey,
    app: 'Lulu & Mimi English Vocabulary Platform',
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. FREE DICTIONARY API PROXY (dictionaryapi.dev)
// ═══════════════════════════════════════════════════════════════
apiRouter.get('/dictionary/lookup/:word', async (req: Request, res: Response) => {
  const { word } = req.params;
  if (!word) {
    return res.status(400).json({ error: 'Word parameter is required' });
  }

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'LuluMimiApp/1.0',
      },
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: `Word '${word}' not found in Free Dictionary` });
    }
    console.error('Free Dictionary API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Free Dictionary API' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 3. CAMBRIDGE DICTIONARY SCRAPER (IPA UK/US, Audio MP3, Examples)
// ═══════════════════════════════════════════════════════════════
apiRouter.get('/dictionary/cambridge/:word', async (req: Request, res: Response) => {
  const { word } = req.params;
  if (!word) {
    return res.status(400).json({ error: 'Word parameter is required' });
  }

  try {
    const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.trim().toLowerCase())}`;
    const response = await axios.get(url, {
      timeout: 9000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const phonetics: PhoneticInfo[] = [];
    const examples: string[] = [];
    const meanings: DictMeaning[] = [];

    // 1. Trích xuất IPA và Audio UK
    const ukIpa = $('.uk .ipa.dipa').first().text().trim() || $('.uk.dpron-i .ipa').first().text().trim();
    let ukAudio = $('.uk .daud audio source[type="audio/mpeg"]').first().attr('src') ||
                  $('.uk.dpron-i audio source[type="audio/mpeg"]').first().attr('src');
    if (ukAudio && !ukAudio.startsWith('http')) {
      ukAudio = `https://dictionary.cambridge.org${ukAudio}`;
    }

    if (ukIpa) {
      phonetics.push({
        text: `/${ukIpa}/`,
        audio: ukAudio,
        region: 'UK',
      });
    }

    // 2. Trích xuất IPA và Audio US
    const usIpa = $('.us .ipa.dipa').first().text().trim() || $('.us.dpron-i .ipa').first().text().trim();
    let usAudio = $('.us .daud audio source[type="audio/mpeg"]').first().attr('src') ||
                  $('.us.dpron-i audio source[type="audio/mpeg"]').first().attr('src');
    if (usAudio && !usAudio.startsWith('http')) {
      usAudio = `https://dictionary.cambridge.org${usAudio}`;
    }

    if (usIpa) {
      phonetics.push({
        text: `/${usIpa}/`,
        audio: usAudio,
        region: 'US',
      });
    }

    // 3. Trích xuất Các Định Nghĩa & Ví Dụ
    $('.entry-body__el, .pr.dictionary').each((_, entry) => {
      const pos = $(entry).find('.pos.dpos').first().text().trim() || 'word';
      const defs: { definition: string; example?: string }[] = [];

      $(entry).find('.def-block.ddef_block').each((_, block) => {
        const defText = $(block).find('.def.ddef_d.db').text().trim();
        const egText = $(block).find('.eg.deg').first().text().trim();

        if (defText) {
          defs.push({
            definition: defText.replace(/:$/, '').trim(),
            example: egText || undefined,
          });
        }
        if (egText) {
          examples.push(egText);
        }
      });

      if (defs.length > 0) {
        meanings.push({
          partOfSpeech: pos,
          definitions: defs,
        });
      }
    });

    res.json({
      word: word.trim(),
      phonetics,
      meanings,
      examples: examples.slice(0, 8),
      source: 'cambridge',
      sourceUrl: url,
    });
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: `Word '${word}' not found in Cambridge Dictionary` });
    }
    console.error('Cambridge Scraper Error:', error.message);
    res.status(500).json({ error: 'Failed to scrape Cambridge Dictionary' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 4. FULL CASCADE DICTIONARY LOOKUP (Merge Free Dict + Cambridge)
// ═══════════════════════════════════════════════════════════════
apiRouter.get('/dictionary/full/:word', async (req: Request, res: Response) => {
  const { word } = req.params;
  const cleanWord = word.trim().toLowerCase();

  const result: DictionaryResult = {
    word: cleanWord,
    phonetics: [],
    meanings: [],
    synonyms: [],
    antonyms: [],
    examples: [],
    sources: [],
    sourceUrls: [],
  };

  const [freeDictPromise, cambridgePromise] = await Promise.allSettled([
    axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`, { timeout: 7000 }),
    axios.get(`http://127.0.0.1:${process.env.PORT || 5050}/api/dictionary/cambridge/${encodeURIComponent(cleanWord)}`, { timeout: 8000 }),
  ]);

  // 1. Process Free Dictionary API Data
  if (freeDictPromise.status === 'fulfilled' && Array.isArray(freeDictPromise.value.data)) {
    const entry = freeDictPromise.value.data[0];
    result.sources.push('free-dictionary');

    // Phonetics
    if (entry.phonetics && Array.isArray(entry.phonetics)) {
      entry.phonetics.forEach((p: any) => {
        if (p.text && !result.phonetics.some((existing) => existing.text === p.text)) {
          let region: 'UK' | 'US' | 'General' = 'General';
          if (p.audio?.includes('-uk.')) region = 'UK';
          if (p.audio?.includes('-us.')) region = 'US';

          result.phonetics.push({
            text: p.text,
            audio: p.audio || undefined,
            region,
          });
        }
      });
    }

    // Meanings & Synonyms
    if (entry.meanings && Array.isArray(entry.meanings)) {
      entry.meanings.forEach((m: any) => {
        const defs = (m.definitions || []).map((d: any) => ({
          definition: d.definition,
          example: d.example,
        }));

        result.meanings.push({
          partOfSpeech: m.partOfSpeech || 'word',
          definitions: defs,
          synonyms: m.synonyms || [],
          antonyms: m.antonyms || [],
        });

        if (m.synonyms) result.synonyms.push(...m.synonyms);
        if (m.antonyms) result.antonyms.push(...m.antonyms);
      });
    }

    if (entry.sourceUrls) {
      result.sourceUrls?.push(...entry.sourceUrls);
    }
  }

  // 2. Process Cambridge Data (Prioritize UK/US IPA and accurate audio)
  if (cambridgePromise.status === 'fulfilled' && cambridgePromise.value.data) {
    const camData = cambridgePromise.value.data;
    result.sources.push('cambridge');

    if (camData.sourceUrl) {
      result.sourceUrls?.push(camData.sourceUrl);
    }

    // Prioritize Cambridge phonetics if available
    if (camData.phonetics && Array.isArray(camData.phonetics) && camData.phonetics.length > 0) {
      camData.phonetics.forEach((cp: PhoneticInfo) => {
        const existingIdx = result.phonetics.findIndex((p) => p.region === cp.region);
        if (existingIdx >= 0) {
          result.phonetics[existingIdx] = cp; // override with Cambridge accurate audio
        } else {
          result.phonetics.unshift(cp);
        }
      });
    }

    // Add examples
    if (camData.examples && Array.isArray(camData.examples)) {
      result.examples.push(...camData.examples);
    }

    // If Free Dictionary had no meanings, use Cambridge meanings
    if (result.meanings.length === 0 && camData.meanings) {
      result.meanings.push(...camData.meanings);
    }
  }

  // Deduplicate synonyms, antonyms, examples
  result.synonyms = Array.from(new Set(result.synonyms)).slice(0, 10);
  result.antonyms = Array.from(new Set(result.antonyms)).slice(0, 8);
  result.examples = Array.from(new Set(result.examples)).slice(0, 10);

  // If both failed, try AI Fallback if Gemini key is available (from client header or server env)
  if (result.sources.length === 0) {
    const userApiKey = (req.headers['x-gemini-api-key'] as string) || '';
    const activeKey = userApiKey.trim() || defaultServerApiKey;

    if (activeKey) {
      try {
        const aiClientInstance = new GoogleGenAI({ apiKey: activeKey });
        const aiPrompt = `Explain the English word/phrase "${cleanWord}" for a Vietnamese learner.
Output ONLY valid JSON with this exact schema:
{
  "word": "${cleanWord}",
  "phonetics": [{"text": "/IPA/", "region": "US"}],
  "vietnameseMeaning": "Nghĩa tiếng Việt ngắn gọn",
  "meanings": [
    {
      "partOfSpeech": "noun/verb/adj",
      "definitions": [
        {"definition": "English definition", "example": "English example sentence"}
      ]
    }
  ],
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1"],
  "examples": ["Example 1", "Example 2"],
  "collocations": ["collocation 1", "collocation 2"],
  "wordForms": [
    {"form": "noun", "word": "exampleNoun", "meaningVi": "nghĩa danh từ"},
    {"form": "verb", "word": "exampleVerb", "meaningVi": "nghĩa động từ"}
  ]
}`;

        const response = await aiClientInstance.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: aiPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const aiText = response.text || '';
        const parsed = JSON.parse(aiText);

        return res.json({
          ...parsed,
          sources: ['ai-generated'],
        });
      } catch (aiErr: any) {
        console.error('AI Fallback Error:', aiErr.message);
      }
    }

    return res.status(404).json({ error: `Cannot find definition for '${word}'` });
  }

  res.json(result);
});

// ═══════════════════════════════════════════════════════════════
// 5. GOOGLE GENAI CHAT ASSISTANT
// ═══════════════════════════════════════════════════════════════
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { message, history = [], topicContext } = req.body;
  const userApiKey = (req.headers['x-gemini-api-key'] as string) || '';
  const activeKey = userApiKey.trim() || defaultServerApiKey;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!activeKey) {
    return res.json({
      reply:
        '⚠️ Bạn chưa cài đặt Gemini API Key. Vui lòng nhấn vào biểu tượng 🔑 Cài Đặt (góc phải trên màn hình) để nhập API key miễn phí từ Google AI Studio.',
      isFallback: true,
    });
  }

  try {
    const aiClient = new GoogleGenAI({ apiKey: activeKey });
    const systemInstruction = `Bạn là Trợ Lý Học Tiếng Anh Thông Minh "Lulu & Mimi AI", đồng hành cùng người học Việt Nam.
Vai trò của bạn:
1. Giải thích nghĩa từ vựng, thành ngữ (idioms), cụm từ (collocations), cụm động từ (phrasal verbs) một cách trực quan, dễ nhớ.
2. Cung cấp phát âm IPA (cả UK và US), phân tích dạng từ (noun, verb, adjective, adverb).
3. Đưa ra 2-3 câu ví dụ thực tế kèm bản dịch tiếng Việt chuẩn xác.
4. Nêu các từ đồng nghĩa (synonyms), trái nghĩa (antonyms), các collocation và họ từ / các dạng từ (wordForms).
5. Luôn giữ phong cách thân thiện, khuyến khích học viên, dùng icon sinh động.
${topicContext ? `Chủ đề người học đang tập trung: ${topicContext}.` : ''}

Nếu người dùng hỏi giải thích 1 từ/thành ngữ cụ thể, hãy cung cấp thêm 1 khối JSON ở cuối theo định dạng:
\`\`\`json
{
  "flashcardSuggestion": {
    "front": "Word/Phrase",
    "back": "Nghĩa tiếng Việt",
    "pronunciation": "/IPA/",
    "wordForm": "noun/verb/adjective/adverb/phrase/idiom",
    "vocabType": "word/idiom/collocation/phrasal-verb",
    "example": "English example",
    "exampleVi": "Bản dịch ví dụ tiếng Việt",
    "synonyms": ["syn1", "syn2"],
    "wordForms": [
      {"form": "noun", "word": "...", "meaningVi": "..."},
      {"form": "verb", "word": "...", "meaningVi": "..."}
    ]
  }
}
\`\`\``;

    const contents: any[] = [];

    // Append prior history if any
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Xin lỗi, tôi không thể xử lý câu trả lời lúc này.';

    // Extract suggested flashcard if JSON block exists
    let suggestedFlashcard = undefined;
    const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.flashcardSuggestion) {
          suggestedFlashcard = parsed.flashcardSuggestion;
        }
      } catch (e) {
        // Ignore json parse error in chat text
      }
    }

    res.json({
      reply,
      suggestedFlashcard,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini AI API Error:', error.message);
    res.status(500).json({
      error: 'Failed to process AI chat request',
      details: error.message,
    });
  }
});
