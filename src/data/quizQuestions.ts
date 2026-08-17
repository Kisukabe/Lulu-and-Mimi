import { Question, Flashcard } from '../types';

export const QUIZ_QUESTIONS: Question[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. TOEIC PART 5 & VOCABULARY IN CONTEXT QUESTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 101,
    topic: 'toeic',
    vocabType: 'word',
    question: 'The finance department will ______ your travel expenses once you submit the original receipts.',
    options: ['reimburse', 'terminate', 'postpone', 'subcontract'],
    correctIndex: 0,
    explanation: '"Reimburse" nghĩa là hoàn trả lại chi phí (tiền vé, công tác phí khi có hóa đơn gốc).',
    difficulty: 'Medium',
  },
  {
    id: 102,
    topic: 'toeic',
    vocabType: 'word',
    question: 'All employees are informed that attendance at the annual compliance workshop is ______.',
    options: ['optional', 'mandatory', 'promising', 'defective'],
    correctIndex: 1,
    explanation: '"Mandatory" mang nghĩa bắt buộc, không được vắng mặt (compulsory, required).',
    difficulty: 'Easy',
  },
  {
    id: 103,
    topic: 'toeic',
    vocabType: 'word',
    question: 'The boutique hotel offers ______ airport shuttle bus services for all registered guests.',
    options: ['defective', 'confidential', 'complimentary', 'negotiable'],
    correctIndex: 2,
    explanation: '"Complimentary" mang nghĩa miễn phí kèm theo (free of charge as a courtesy).',
    difficulty: 'Easy',
  },
  {
    id: 104,
    topic: 'toeic',
    vocabType: 'collocation',
    question: 'All machinery must be maintained ______ the manufacturer\'s safety guidelines.',
    options: ['in accordance with', 'out of reach', 'ahead of time', 'by means of'],
    correctIndex: 0,
    explanation: 'Cụm collocation chuẩn trong đề thi TOEIC: "in accordance with" (phù hợp với / theo đúng quy định).',
    difficulty: 'Medium',
  },
  {
    id: 105,
    topic: 'toeic',
    vocabType: 'word',
    question: 'Please handle the client\'s financial statement with care as it contains ______ data.',
    options: ['confidential', 'defective', 'complimentary', 'flexible'],
    correctIndex: 0,
    explanation: '"Confidential" nghĩa là bảo mật, tuyệt mật (secret, private).',
    difficulty: 'Medium',
  },
  {
    id: 106,
    topic: 'toeic',
    vocabType: 'phrasal-verb',
    question: 'Due to severe weather conditions, management decided to ______ the annual company picnic.',
    options: ['call off', 'look into', 'step down', 'take after'],
    correctIndex: 0,
    explanation: '"Call off" nghĩa là hủy bỏ sự kiện đã lên lịch (cancel).',
    difficulty: 'Easy',
  },
  {
    id: 107,
    topic: 'toeic',
    vocabType: 'collocation',
    question: 'The flight departure timetable is ______ without prior notice due to runway maintenance.',
    options: ['subject to change', 'liable for fines', 'fond of change', 'bound to fail'],
    correctIndex: 0,
    explanation: '"Subject to change" mang nghĩa có thể thay đổi tùy tình hình thực tế.',
    difficulty: 'Medium',
  },
  {
    id: 108,
    topic: 'toeic',
    vocabType: 'word',
    question: 'Customers can return any ______ merchandise to the store for a full replacement within 30 days.',
    options: ['defective', 'prospective', 'abundant', 'lucrative'],
    correctIndex: 0,
    explanation: '"Defective" nghĩa là sản phẩm bị lỗi, hỏng hóc (faulty, flawed).',
    difficulty: 'Easy',
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. OTHER TOPICS QUESTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 1,
    topic: 'daily',
    vocabType: 'word',
    question: 'Từ "Accomplish" có ý nghĩa chính xác nhất là gì?',
    options: [
      'Từ bỏ một kế hoạch giữa chừng',
      'Hoàn thành, đạt được mục tiêu sau nỗ lực',
      'Trì hoãn công việc sang ngày mai',
      'Đàm phán một hợp đồng thương mại',
    ],
    correctIndex: 1,
    explanation: 'Accomplish (verb) mang nghĩa hoàn thành, đạt được (thành tựu/mục tiêu) sau quá trình nỗ lực thực hiện.',
    difficulty: 'Easy',
  },
  {
    id: 2,
    topic: 'ielts',
    vocabType: 'word',
    question: 'Chọn từ đồng nghĩa với "Resilient" trong câu: "The local economy is surprisingly resilient."',
    options: ['Fragile', 'Robust / Adaptable', 'Unstable', 'Vulnerable'],
    correctIndex: 1,
    explanation: 'Resilient mang nghĩa kiên cường, có khả năng phục hồi nhanh trước khó khăn. Đồng nghĩa với robust, tough, adaptable.',
    difficulty: 'Medium',
  },
  {
    id: 3,
    topic: 'daily',
    vocabType: 'idiom',
    question: 'Thành ngữ "Break the ice" được dùng trong tình huống nào?',
    options: [
      'Khi muốn mua một món đồ uống lạnh',
      'Khi phá vỡ sự ngượng ngùng để bắt đầu trò chuyện',
      'Khi xảy ra tranh cãi nảy lửa',
      'Khi hoàn thành một bài kiểm tra khó',
    ],
    correctIndex: 1,
    explanation: '"Break the ice" nghĩa bóng là phá vỡ bầu không khí ngại ngùng, mở đầu cuộc trò chuyện thân mật.',
    difficulty: 'Easy',
  },
  {
    id: 4,
    topic: 'business',
    vocabType: 'idiom',
    question: 'Khi ai đó nhận xét: "You really hit the nail on the head", họ muốn nói gì?',
    options: [
      'Bạn vừa làm hỏng một món đồ gỗ',
      'Bạn đã chỉ ra hoàn toàn chính xác gốc rễ vấn đề',
      'Bạn đang nói chuyện quá dài dòng',
      'Bạn đã bỏ lỡ cơ hội kinh doanh',
    ],
    correctIndex: 1,
    explanation: '"Hit the nail on the head" có nghĩa là nói trúng phóc, chỉ ra đúng bản chất của vấn đề.',
    difficulty: 'Easy',
  },
];

/**
 * Tự động sinh thêm câu hỏi trắc nghiệm từ kho Flashcards (bao gồm cả Flashcard tự tạo)
 */
export function generateQuestionsFromFlashcards(flashcards: Flashcard[]): Question[] {
  const generated: Question[] = [];
  let nextId = 200;

  if (flashcards.length < 4) {
    return generated;
  }

  // Shuffle flashcards copy
  const shuffled = [...flashcards].sort(() => Math.random() - 0.5);

  shuffled.forEach((card) => {
    // Other 3 distractor cards
    const distractors = flashcards
      .filter((c) => c.id !== card.id && c.back !== card.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (distractors.length === 3) {
      // Type 1: English word -> Vietnamese meaning
      const options1 = [card.back, ...distractors.map((d) => d.back)].sort(() => Math.random() - 0.5);
      const correctIdx1 = options1.indexOf(card.back);

      generated.push({
        id: nextId++,
        topic: card.topic,
        vocabType: card.vocabType,
        question: `Nghĩa tiếng Việt của "${card.front}"${card.pronunciation ? ` (${card.pronunciation})` : ''} là gì?`,
        options: options1,
        correctIndex: correctIdx1,
        explanation: `"${card.front}": ${card.back}.${card.example ? ` Ví dụ: "${card.example}"` : ''}`,
        difficulty: card.difficulty || 'Medium',
        isAutoGenerated: true,
      });

      // Type 2: Vietnamese meaning -> English word
      const options2 = [card.front, ...distractors.map((d) => d.front)].sort(() => Math.random() - 0.5);
      const correctIdx2 = options2.indexOf(card.front);

      generated.push({
        id: nextId++,
        topic: card.topic,
        vocabType: card.vocabType,
        question: `Từ hoặc cụm từ tiếng Anh nào mang nghĩa: "${card.back}"?`,
        options: options2,
        correctIndex: correctIdx2,
        explanation: `Đáp án đúng là "${card.front}" (${card.pronunciation || ''}).`,
        difficulty: card.difficulty || 'Medium',
        isAutoGenerated: true,
      });
    }
  });

  return generated;
}
