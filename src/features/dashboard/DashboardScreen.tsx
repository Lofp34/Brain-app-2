import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/Button';
import { Activity, Brain, Gamepad2, LineChart } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { profile, sessions } = useUser();
  if (!profile) return null;

  const lastSession = sessions[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-indigo-400">Welcome back</p>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-slate-400">Keep your streak alive with a quick session.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/math"><Button>Mental Math</Button></Link>
          <Link to="/memory"><Button variant="ghost">Memory</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-slate-400">Streak</p>
          <div className="mt-2 text-3xl font-bold">{profile.stats.streak} 🔥</div>
          <p className="text-xs text-slate-500">Don't break the chain!</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Total sessions</p>
          <div className="mt-2 text-3xl font-bold">{profile.stats.totalSessions}</div>
          <p className="text-xs text-slate-500">Across math and memory</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Last played</p>
          <div className="mt-2 text-xl font-semibold">{lastSession ? new Date(lastSession.finishedAt).toLocaleString() : '—'}</div>
          <p className="text-xs text-slate-500">Stay consistent to grow your brain</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold"><Brain size={18} /> Mental Math</div>
          <p className="text-sm text-slate-400">Rapid arithmetic with adjustable difficulty and duration.</p>
          <Link to="/math"><Button>Start math</Button></Link>
        </div>
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold"><Gamepad2 size={18} /> Memory</div>
          <p className="text-sm text-slate-400">Flip cards, find pairs, and beat your best time.</p>
          <Link to="/memory"><Button>Start memory</Button></Link>
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <Activity size={18} /> Recent activity
        </div>
        <div className="text-sm text-slate-300">
          <p>Last score: {lastSession?.score ?? '—'}</p>
          <p className="text-slate-500">Tap results to dive into charts and badges.</p>
        </div>
        <Link to="/results">
          <Button variant="ghost" className="flex items-center gap-2">
            <LineChart size={16} /> Results
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardScreen;
