import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { useUser } from './context/UserContext';
import OnboardingScreen from './features/onboarding/OnboardingScreen';
import DashboardScreen from './features/dashboard/DashboardScreen';
import MathGameScreen from './features/math/MathGameScreen';
import MemoryGameScreen from './features/memory/MemoryGameScreen';
import ResultsScreen from './features/results/ResultsScreen';
import SettingsScreen from './features/settings/SettingsScreen';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { profile } = useUser();
  if (!profile) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { profile } = useUser();
  if (profile) return <Navigate to="/" replace />;
  return children;
};

export const AppRoutes = () => {
  return useRoutes([
    {
      path: '/onboarding',
      element: (
        <PublicOnlyRoute>
          <OnboardingScreen />
        </PublicOnlyRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>
      ),
    },
    {
      path: '/math',
      element: (
        <ProtectedRoute>
          <MathGameScreen />
        </ProtectedRoute>
      ),
    },
    {
      path: '/memory',
      element: (
        <ProtectedRoute>
          <MemoryGameScreen />
        </ProtectedRoute>
      ),
    },
    {
      path: '/results',
      element: (
        <ProtectedRoute>
          <ResultsScreen />
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute>
          <SettingsScreen />
        </ProtectedRoute>
      ),
    },
  ]);
};
