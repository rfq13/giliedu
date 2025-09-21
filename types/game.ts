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
  direction: 'left' | 'right' | 'center' | 'up' | 'down';
  confidence: number;
  timestamp: number;
  intensity: number; // 0-1, how strong the gesture is
  duration: number; // how long the gesture has been held in ms
  rotation: {
    yaw: number; // left/right rotation in degrees
    pitch: number; // up/down rotation in degrees
    roll: number; // tilt rotation in degrees
  };
  velocity: number; // speed of head movement
  isStable: boolean; // whether the gesture is stable/consistent
  previousDirection?: 'left' | 'right' | 'center' | 'up' | 'down';
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