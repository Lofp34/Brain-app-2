import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useUser } from '../../context/UserContext';
import { GameSession, MathQuestion, MathSessionDetails } from '../../types';
import { WheelPicker } from '../../components/ui/WheelPicker';
import { v4 as uuidv4 } from 'uuid';

const difficultyMap: Record<MathSessionDetails['difficulty'], number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

const buildQuestion = (difficulty: MathSessionDetails['difficulty']): MathQuestion => {
  const limit = difficultyMap[difficulty];
  const a = Math.floor(Math.random() * limit) + 1;
  const b = Math.floor(Math.random() * limit) + 1;
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const prompt = `${a} ${op} ${b}`;
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { prompt, answer };
};

const MathGameScreen: React.FC = () => {
  const { profile, addSession, generateFeedback } = useUser();
  const [difficulty, setDifficulty] = useState(profile?.settings.mathDifficulty ?? 'easy');
  const [duration, setDuration] = useState(profile?.settings.mathDuration ?? 1);
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(duration * 60);
  const [question, setQuestion] = useState<MathQuestion>(() => buildQuestion(difficulty));
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setTimer(duration * 60), [duration]);

  useEffect(() => {
    if (!active || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [active, timer]);

  useEffect(() => {
    if (timer <= 0 && active) {
      endSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const startGame = () => {
    setActive(true);
    setFinished(false);
    setCorrect(0);
    setIncorrect(0);
    setQuestion(buildQuestion(difficulty));
    setTimer(duration * 60);
  };

  const checkAnswer = () => {
    const parsed = parseInt(input, 10);
    if (!Number.isFinite(parsed)) return;
    if (parsed === question.answer) {
      setCorrect((c) => c + 1);
    } else {
      setIncorrect((c) => c + 1);
    }
    setQuestion(buildQuestion(difficulty));
    setInput('');
    inputRef.current?.focus();
  };

  const endSession = async () => {
    setActive(false);
    setFinished(true);
    const details: MathSessionDetails = {
      duration,
      difficulty,
      questions: [],
      correct,
      incorrect,
    };

    const session: GameSession<MathSessionDetails> = {
      id: uuidv4(),
      gameType: 'math',
      startedAt: new Date(Date.now() - duration * 60 * 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      score: correct,
      mistakes: incorrect,
      details,
    };
    await addSession(session);

    const summary = `Math session: diff ${difficulty}, duration ${duration}m, score ${correct} with ${incorrect} mistakes.`;
    const text = await generateFeedback(summary);
    setFeedback(text);
  };

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timer / 60)
      .toString()
      .padStart(2, '0');
    const secs = (timer % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [timer]);

  useEffect(() => {
    if (active) {
      inputRef.current?.focus();
    }
  }, [active, question]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-indigo-400">Mental Math</p>
          <h1 className="text-3xl font-bold">Sharpen your arithmetic</h1>
          <p className="text-slate-400">Configure difficulty and race against the clock.</p>
        </div>
        <Button onClick={active ? endSession : startGame}>{active ? 'Finish early' : 'Start session'}</Button>
      </div>

      <div className="card p-5 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Difficulty</p>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  difficulty === level ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Duration (minutes)</p>
          <WheelPicker value={duration} min={1} max={10} onChange={setDuration} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Status</p>
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-3xl font-bold">{formattedTime}</p>
            <p className="text-sm text-slate-400">Score {correct} · Mistakes {incorrect}</p>
          </div>
        </div>
      </div>

      {active && (
        <div className="card p-6 space-y-4">
          <p className="text-lg font-semibold text-center">{question.prompt}</p>
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            className="mx-auto max-w-xs text-center text-xl"
            placeholder="Your answer"
          />
          <div className="flex justify-center">
            <Button onClick={checkAnswer}>Submit</Button>
          </div>
        </div>
      )}

      {finished && !active && (
        <div className="card p-6 space-y-3">
          <h2 className="text-xl font-semibold">Session summary</h2>
          <p className="text-slate-300">Correct: {correct}</p>
          <p className="text-slate-300">Mistakes: {incorrect}</p>
          {feedback && (
            <div className="rounded-lg border border-indigo-900 bg-indigo-950/50 p-3 text-sm text-indigo-100">
              <p className="font-semibold">Coach feedback</p>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MathGameScreen;
