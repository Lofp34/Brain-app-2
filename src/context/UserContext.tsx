import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthService, ProfileService, AIService } from '../services/api';
import { StorageService } from '../services/storage';
import { GameSession, UserProfile } from '../types';

interface AuthState {
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addSession: (session: GameSession) => Promise<void>;
  resetProfile: () => void;
  updateSettings: (settings: Partial<UserProfile['settings']>) => void;
  generateFeedback: (summary: string) => Promise<string>;
  sessions: GameSession[];
}

const defaultState: AuthState = {
  profile: null,
  token: null,
  loading: false,
  error: null,
  register: async () => {},
  login: async () => {},
  logout: () => {},
  addSession: async () => {},
  resetProfile: () => {},
  updateSettings: () => {},
  generateFeedback: async () => '',
  sessions: [],
};

const UserContext = createContext<AuthState>(defaultState);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(StorageService.getProfile());
  const [token, setToken] = useState<string | null>(StorageService.getToken());
  const [sessions, setSessions] = useState<GameSession[]>(StorageService.getSessions());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) StorageService.setProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (token) StorageService.setToken(token);
  }, [token]);

  useEffect(() => {
    StorageService.setSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return;
      try {
        const { profile: remoteProfile, sessions: remoteSessions } = await ProfileService.fetchProfile(token);
        setProfile(remoteProfile);
        setSessions(remoteSessions);
      } catch (err) {
        console.warn('Failed to bootstrap profile', err);
      }
    };
    bootstrap();
  }, [token]);

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token: t, profile: p, sessions: s } = await AuthService.register(email, password, name);
      setToken(t);
      setProfile(p);
      setSessions(s);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token: t, profile: p, sessions: s } = await AuthService.login(email, password);
      setToken(t);
      setProfile(p);
      setSessions(s);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (session: GameSession) => {
    const newSession = { ...session, id: session.id || uuidv4() };
    setSessions((prev) => [newSession, ...prev].slice(0, 50));
    if (!token) return;
    try {
      await ProfileService.updateSessions(token, newSession);
    } catch (err) {
      console.warn('Failed to sync session', err);
    }
  };

  const resetProfile = () => {
    setProfile(null);
    setToken(null);
    setSessions([]);
    StorageService.clearAll();
  };

  const logout = () => resetProfile();

  const updateSettings = (settings: Partial<UserProfile['settings']>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: { ...prev.settings, ...settings },
      };
    });
  };

  const generateFeedback = async (summary: string) => {
    const key = profile?.settings.openAIKey;
    if (!key) return '';
    try {
      return await AIService.getCoachFeedback(key, summary);
    } catch (err) {
      console.warn('Feedback failed', err);
      return '';
    }
  };

  const value = useMemo(
    () => ({
      profile,
      token,
      loading,
      error,
      register,
      login,
      logout,
      addSession,
      resetProfile,
      updateSettings,
      sessions,
      generateFeedback,
    }),
    [profile, token, loading, error, sessions],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
