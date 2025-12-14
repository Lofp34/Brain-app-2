export type GameType = 'math' | 'memory';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  sound: boolean;
  mathDuration: number;
  mathDifficulty: 'easy' | 'medium' | 'hard';
  memoryCardCount: number;
  openAIKey?: string;
}

export interface UserStats {
  totalSessions: number;
  totalTimeMinutes: number;
  streak: number;
  lastPlayedAt?: string;
}

export interface GameSession<T = SessionDetails> {
  id: string;
  gameType: GameType;
  startedAt: string;
  finishedAt: string;
  score: number;
  mistakes: number;
  details: T;
}

export interface MathQuestion {
  prompt: string;
  answer: number;
}

export interface MathSessionDetails {
  duration: number;
  difficulty: UserSettings['mathDifficulty'];
  questions: MathQuestion[];
  correct: number;
  incorrect: number;
}

export interface MemoryCard {
  id: string;
  emoji: string;
  matched: boolean;
}

export interface MemorySessionDetails {
  cardCount: number;
  moves: number;
  durationSeconds: number;
}

export type SessionDetails = MathSessionDetails | MemorySessionDetails;
