import { GameSession, UserProfile } from '../types';

const PROFILE_KEY = 'brain-app-profile';
const TOKEN_KEY = 'brain-app-token';
const SESSIONS_KEY = 'brain-app-sessions';

type Nullable<T> = T | null;

const safeJSONParse = <T>(value: string | null): Nullable<T> => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    console.warn('Failed to parse cached value', err);
    return null;
  }
};

export const StorageService = {
  getProfile(): Nullable<UserProfile> {
    return safeJSONParse<UserProfile>(localStorage.getItem(PROFILE_KEY));
  },
  setProfile(profile: UserProfile | null) {
    if (!profile) {
      localStorage.removeItem(PROFILE_KEY);
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },
  getToken(): Nullable<string> {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string | null) {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  },
  getSessions(): GameSession[] {
    return safeJSONParse<GameSession[]>(localStorage.getItem(SESSIONS_KEY)) ?? [];
  },
  setSessions(sessions: GameSession[]) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },
  clearAll() {
    [PROFILE_KEY, TOKEN_KEY, SESSIONS_KEY].forEach((key) => localStorage.removeItem(key));
  },
};
