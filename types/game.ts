export interface Question {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface GameSession {
  id: string;
  playerId: string;
  mode: 'single' | 'party';
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  startTime: number;
  endTime?: number;
}

export interface Player {
  id: string;
  name: string;
  totalPoints: number;
  level: number;
  achievements: string[];
  gamesPlayed: number;
  avatar?: string;
}

export interface HeadGesture {
  direction: 'left' | 'right' | 'center';
  confidence: number;
  timestamp: number;
}

export interface ARData {
  headRotation: {
    x: number;
    y: number;
    z: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  isTracking: boolean;
}