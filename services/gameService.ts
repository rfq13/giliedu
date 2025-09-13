import { Question, GameSession, Player } from '@/types/game';
import { QuestionService } from './questionService';

export class GameService {
  private static currentSession: GameSession | null = null;

  // Create a new game session
  static createSession(
    playerId: string,
    mode: 'single' | 'party',
    options: {
      questionCount?: number;
      category?: string;
      difficulty?: string;
      timeLimit?: number;
    } = {}
  ): GameSession {
    const {
      questionCount = 10,
      category,
      difficulty,
    } = options;

    const questions = QuestionService.getRandomQuestions(questionCount, category, difficulty);
    
    const session: GameSession = {
      id: Date.now().toString(),
      playerId,
      mode,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      correctAnswers: 0,
      startTime: Date.now(),
    };

    this.currentSession = session;
    return session;
  }

  // Get current session
  static getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  // Submit answer for current question
  static submitAnswer(sessionId: string, answerIndex: number): {
    isCorrect: boolean;
    points: number;
    correctAnswer: string;
    isGameComplete: boolean;
  } {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      throw new Error('Invalid session');
    }

    const session = this.currentSession;
    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    if (!currentQuestion) {
      throw new Error('No current question');
    }

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const points = isCorrect ? currentQuestion.points : 0;

    // Update session
    session.score += points;
    if (isCorrect) {
      session.correctAnswers += 1;
    }

    const isGameComplete = session.currentQuestionIndex >= session.questions.length - 1;
    
    if (isGameComplete) {
      session.endTime = Date.now();
    } else {
      session.currentQuestionIndex += 1;
    }

    return {
      isCorrect,
      points,
      correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
      isGameComplete,
    };
  }

  // Get current question
  static getCurrentQuestion(): Question | null {
    if (!this.currentSession) return null;
    
    return this.currentSession.questions[this.currentSession.currentQuestionIndex] || null;
  }

  // Get game progress
  static getGameProgress(): {
    currentQuestion: number;
    totalQuestions: number;
    score: number;
    correctAnswers: number;
    accuracy: number;
  } | null {
    if (!this.currentSession) return null;

    const session = this.currentSession;
    const accuracy = session.currentQuestionIndex > 0 
      ? (session.correctAnswers / session.currentQuestionIndex) * 100 
      : 0;

    return {
      currentQuestion: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      score: session.score,
      correctAnswers: session.correctAnswers,
      accuracy: Math.round(accuracy),
    };
  }

  // Calculate final game stats
  static getGameStats(sessionId: string): {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    duration: number;
    level: number;
    pointsEarned: number;
  } | null {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return null;
    }

    const session = this.currentSession;
    const duration = session.endTime ? session.endTime - session.startTime : 0;
    const accuracy = (session.correctAnswers / session.questions.length) * 100;
    
    // Calculate level based on total score (mock calculation)
    const level = Math.floor(session.score / 100) + 1;

    return {
      score: session.score,
      correctAnswers: session.correctAnswers,
      totalQuestions: session.questions.length,
      accuracy: Math.round(accuracy),
      duration: Math.round(duration / 1000), // Convert to seconds
      level,
      pointsEarned: session.score,
    };
  }

  // End current session
  static endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
    }
    this.currentSession = null;
  }

  // Get achievements earned in session
  static getSessionAchievements(sessionId: string): string[] {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return [];
    }

    const session = this.currentSession;
    const achievements: string[] = [];
    const accuracy = (session.correctAnswers / session.questions.length) * 100;

    // Perfect score achievement
    if (accuracy === 100) {
      achievements.push('Perfect Score');
    }

    // High accuracy achievement
    if (accuracy >= 80) {
      achievements.push('High Achiever');
    }

    // Speed achievement (if game was completed quickly)
    if (session.endTime && session.startTime) {
      const duration = (session.endTime - session.startTime) / 1000; // seconds
      const averageTimePerQuestion = duration / session.questions.length;
      
      if (averageTimePerQuestion < 10) {
        achievements.push('Speed Demon');
      }
    }

    // Score milestones
    if (session.score >= 500) {
      achievements.push('High Scorer');
    }

    return achievements;
  }
}