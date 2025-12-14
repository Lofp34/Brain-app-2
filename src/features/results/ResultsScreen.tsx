import React, { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useUser } from '../../context/UserContext';

const ResultsScreen: React.FC = () => {
  const { sessions } = useUser();
  const mathSessions = useMemo(() => sessions.filter((s) => s.gameType === 'math').slice(0, 10).reverse(), [sessions]);

  const badges = useMemo(() => {
    const earned = [] as string[];
    if (sessions.length > 0) earned.push('First session');
    if (sessions.length >= 10) earned.push('10 sessions');
    if (mathSessions.some((s) => s.score >= 20)) earned.push('Math whiz (20+)');
    return earned;
  }, [sessions, mathSessions]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-indigo-400">Results</p>
        <h1 className="text-3xl font-bold">Progress at a glance</h1>
        <p className="text-slate-400">Charts, badges, and recent history.</p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Recent math scores</h2>
        {mathSessions.length === 0 ? (
          <p className="text-slate-400">Play a math session to see your trend.</p>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mathSessions.map((s, idx) => ({ name: `#${idx + 1}`, score: s.score }))}>
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke: '#1e293b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card p-5 space-y-2">
        <h2 className="text-lg font-semibold">Badges</h2>
        {badges.length === 0 ? (
          <p className="text-slate-400">Earn badges by playing sessions.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-200">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5 space-y-2">
        <h2 className="text-lg font-semibold">Recent history</h2>
        <div className="divide-y divide-slate-800">
          {sessions.slice(0, 10).map((session) => (
            <div key={session.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-semibold capitalize">{session.gameType}</p>
                <p className="text-slate-400">{new Date(session.finishedAt).toLocaleString()}</p>
              </div>
              <div className="text-right text-slate-200">
                <p>Score {session.score}</p>
                <p className="text-slate-500">Mistakes {session.mistakes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
