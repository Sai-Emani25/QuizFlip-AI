export interface FlashcardType {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestionType {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  socratic_hint: string;
  explanation: string;
}

export interface QuizResponse {
  target_academic_level: string;
  flashcards: FlashcardType[];
  quiz_questions: QuizQuestionType[];
}
