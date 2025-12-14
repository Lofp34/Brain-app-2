import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useUser } from './context/UserContext';
import { Brain, Gamepad2, Home, LineChart, Settings } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <Home size={18} /> },
  { to: '/math', label: 'Mental Math', icon: <Brain size={18} /> },
  { to: '/memory', label: 'Memory', icon: <Gamepad2 size={18} /> },
  { to: '/results', label: 'Results', icon: <LineChart size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const App: React.FC = () => {
  const { profile, logout } = useUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-indigo-400">
            <Brain /> Brain App
          </Link>
          {profile && (
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <span className="hidden sm:inline">Hi, {profile.name}</span>
              <button onClick={logout} className="text-slate-400 hover:text-indigo-400">
                Log out
              </button>
            </div>
          )}
        </div>
        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-4 text-sm sm:pb-2">
          {profile &&
            navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
