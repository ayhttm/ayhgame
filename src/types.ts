export interface Question {
  id: number;
  groupId: number;
  groupName: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  activeIngredient?: string;
  contraindications?: string;
}

export interface HerbalDrug {
  id: string;
  name: string;
  thaiName: string;
  groupId: number;
  groupName: string;
  botanicalOrComposition: string;
  indications: string;
  dosage: string;
  contraindications: string;
  cautions: string;
  category: 'ยาเดี่ยว' | 'ยาตำรับ';
}

export interface SymptomGroup {
  id: number;
  title: string;
  shortDesc: string;
  primaryHerbs: string[];
  clinicalHighlight: string;
  iconName: string;
}

export interface PlayerScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctCount: number;
  isHost?: boolean;
  isUser?: boolean;
  status?: 'ready' | 'answering' | 'done';
}

export interface QuizAnswerRecord {
  questionId: number;
  questionText: string;
  groupName: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTakenSec: number;
  explanation: string;
}

export type ViewState = 'home' | 'solo-quiz' | 'multiplayer-lobby' | 'multiplayer-quiz' | 'result' | 'flashcards' | 'compendium';
