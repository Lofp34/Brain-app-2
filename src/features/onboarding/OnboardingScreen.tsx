import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useUser } from '../../context/UserContext';

const OnboardingScreen: React.FC = () => {
  const { register, login, loading, error } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) return;
    if (mode === 'register') {
      await register(email, password, name || 'Explorer');
    } else {
      await login(email, password);
    }
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-indigo-400">Welcome</p>
        <h1 className="text-3xl font-bold">Brain App</h1>
        <p className="text-slate-400">Create an account or continue where you left off.</p>
      </div>
      <div className="card p-6">
        <div className="mb-4 flex justify-center gap-2 text-sm">
          <button
            onClick={() => setMode('register')}
            className={`rounded-lg px-3 py-1 ${mode === 'register' ? 'bg-indigo-500 text-white' : 'bg-slate-800'}`}
          >
            Register
          </button>
          <button
            onClick={() => setMode('login')}
            className={`rounded-lg px-3 py-1 ${mode === 'login' ? 'bg-indigo-500 text-white' : 'bg-slate-800'}`}
          >
            Log in
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="text-sm text-slate-300">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingScreen;
