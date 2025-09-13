import { Question } from '@/types/game';

// Mock question database - in a real app, this would come from Supabase
const questionDatabase: Question[] = [
  // Science Questions
  {
    id: '1',
    category: 'Science',
    text: 'What is the largest planet in our solar system?',
    options: ['Jupiter', 'Saturn'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '2',
    category: 'Science',
    text: 'What gas do plants absorb from the atmosphere during photosynthesis?',
    options: ['Oxygen', 'Carbon Dioxide'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '3',
    category: 'Science',
    text: 'What is the chemical symbol for gold?',
    options: ['Go', 'Au'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '4',
    category: 'Science',
    text: 'How many bones are in an adult human body?',
    options: ['206', '208'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 30,
  },

  // History Questions
  {
    id: '5',
    category: 'History',
    text: 'In which year did World War II end?',
    options: ['1944', '1945'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '6',
    category: 'History',
    text: 'Who was the first person to walk on the moon?',
    options: ['Neil Armstrong', 'Buzz Aldrin'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '7',
    category: 'History',
    text: 'Which ancient wonder of the world was located in Alexandria?',
    options: ['The Lighthouse', 'The Library'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 30,
  },

  // Math Questions
  {
    id: '8',
    category: 'Math',
    text: 'What is 7 × 8?',
    options: ['54', '56'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '9',
    category: 'Math',
    text: 'What is the square root of 144?',
    options: ['12', '14'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '10',
    category: 'Math',
    text: 'What is the derivative of x²?',
    options: ['2x', 'x'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 30,
  },

  // Language Questions
  {
    id: '11',
    category: 'Language',
    text: 'What does "Bonjour" mean in English?',
    options: ['Goodbye', 'Hello'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '12',
    category: 'Language',
    text: 'Which language has the most native speakers worldwide?',
    options: ['English', 'Mandarin Chinese'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 20,
  },

  // Geography Questions
  {
    id: '13',
    category: 'Geography',
    text: 'What is the capital of Australia?',
    options: ['Sydney', 'Canberra'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '14',
    category: 'Geography',
    text: 'Which is the longest river in the world?',
    options: ['Amazon River', 'Nile River'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 20,
  },

  // Art Questions
  {
    id: '15',
    category: 'Art',
    text: 'Who painted the Mona Lisa?',
    options: ['Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '16',
    category: 'Art',
    text: 'Which art movement did Pablo Picasso co-found?',
    options: ['Cubism', 'Impressionism'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 30,
  },
];

export class QuestionService {
  static getRandomQuestions(count: number = 10, category?: string, difficulty?: string): Question[] {
    let filteredQuestions = [...questionDatabase];

    // Filter by category
    if (category && category !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => 
        q.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty === difficulty
      );
    }

    // Shuffle and return requested count
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  static getQuestionsByCategory(category: string): Question[] {
    return questionDatabase.filter(q => 
      q.category.toLowerCase() === category.toLowerCase()
    );
  }

  static getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Question[] {
    return questionDatabase.filter(q => q.difficulty === difficulty);
  }

  static getDailyChallenge(): Question[] {
    // In a real app, this would generate different questions each day
    const challengeQuestions = questionDatabase
      .filter(q => q.difficulty === 'hard')
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    
    return challengeQuestions;
  }

  static getAllCategories(): string[] {
    return [...new Set(questionDatabase.map(q => q.category))];
  }

  static getQuestionStats() {
    const total = questionDatabase.length;
    const byDifficulty = {
      easy: questionDatabase.filter(q => q.difficulty === 'easy').length,
      medium: questionDatabase.filter(q => q.difficulty === 'medium').length,
      hard: questionDatabase.filter(q => q.difficulty === 'hard').length,
    };
    const byCategory = this.getAllCategories().reduce((acc, category) => {
      acc[category] = this.getQuestionsByCategory(category).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byDifficulty,
      byCategory,
    };
  }
}