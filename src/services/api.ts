import { GameSession, UserProfile } from '../types';

const API_BASE = '/api';

const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return res.json();
};

export const AuthService = {
  async register(email: string, password: string, name: string) {
    return apiRequest<{ token: string; profile: UserProfile; sessions: GameSession[] }>(
      '/auth-register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
    );
  },
  async login(email: string, password: string) {
    return apiRequest<{ token: string; profile: UserProfile; sessions: GameSession[] }>(
      '/auth-login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );
  },
};

export const ProfileService = {
  async fetchProfile(token: string) {
    return apiRequest<{ profile: UserProfile; sessions: GameSession[] }>('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  async updateSessions(token: string, session: GameSession) {
    return apiRequest<{ session: GameSession }>('/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(session),
    });
  },
};

export const AIService = {
  async getCoachFeedback(openAIKey: string, summary: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly cognitive training coach.',
          },
          {
            role: 'user',
            content: summary,
          },
        ],
        temperature: 0.7,
        max_tokens: 80,
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to fetch feedback');
    }
    const data = await response.json();
    return data?.choices?.[0]?.message?.content ?? '';
  },
};
