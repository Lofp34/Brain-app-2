import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { WheelPicker } from '../../components/ui/WheelPicker';
import { useUser } from '../../context/UserContext';
import { GameSession, MemoryCard, MemorySessionDetails } from '../../types';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const EMOJIS = ['🍎', '🚀', '🎧', '🎲', '🌟', '📚', '🎯', '🧠', '🍀', '🎵', '🧩', '📈'];

const buildDeck = (count: number): MemoryCard[] => {
  const symbols = EMOJIS.slice(0, count / 2);
  const cards: MemoryCard[] = symbols
    .flatMap((emoji) => [
      { id: uuidv4(), emoji, matched: false },
      { id: uuidv4(), emoji, matched: false },
    ])
    .sort(() => Math.random() - 0.5);
  return cards;
};

const MemoryGameScreen: React.FC = () => {
  const { addSession, profile } = useUser();
  const [cardCount, setCardCount] = useState(profile?.settings.memoryCardCount ?? 8);
  const [deck, setDeck] = useState<MemoryCard[]>(() => buildDeck(cardCount));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => setDeck(buildDeck(cardCount)), [cardCount]);

  useEffect(() => {
    if (!active || finished) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active, finished]);

  useEffect(() => {
    if (matchedCount === cardCount && active) {
      handleFinish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCount]);

  const startGame = () => {
    setDeck(buildDeck(cardCount));
    setFlipped([]);
    setMatchedCount(0);
    setMoves(0);
    setSeconds(0);
    setFinished(false);
    setActive(true);
  };

  const handleFlip = (card: MemoryCard) => {
    if (!active || flipped.includes(card.id) || card.matched || flipped.length === 2) return;
    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = deck.find((c) => c.id === firstId);
      const second = deck.find((c) => c.id === secondId);
      if (first && second && first.emoji === second.emoji) {
        setDeck((prev) => prev.map((c) => (newFlipped.includes(c.id) ? { ...c, matched: true } : c)));
        setMatchedCount((c) => c + 2);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const handleFinish = async () => {
    setActive(false);
    setFinished(true);
    const details: MemorySessionDetails = {
      cardCount,
      moves,
      durationSeconds: seconds,
    };
    const session: GameSession<MemorySessionDetails> = {
      id: uuidv4(),
      gameType: 'memory',
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      score: Math.max(0, cardCount * 2 - moves),
      mistakes: moves - cardCount,
      details,
    };
    await addSession(session);
  };

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [seconds]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-indigo-400">Memory</p>
          <h1 className="text-3xl font-bold">Flip, remember, and match pairs</h1>
          <p className="text-slate-400">Choose deck size and try to clear the board efficiently.</p>
        </div>
        <Button onClick={active ? handleFinish : startGame}>{active ? 'Finish early' : 'Start memory game'}</Button>
      </div>

      <div className="card p-5 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Deck size</p>
          <WheelPicker value={cardCount} min={8} max={20} step={2} onChange={setCardCount} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Moves</p>
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-2xl font-bold">{moves}</div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Timer</p>
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-2xl font-bold">{formattedTime}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card)}
              className={`aspect-square rounded-xl border border-slate-800 bg-slate-900 text-2xl font-bold ${
                isFlipped ? 'text-white' : 'text-slate-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isFlipped ? card.emoji : '？'}
            </motion.button>
          );
        })}
      </div>

      {finished && (
        <div className="card p-6 space-y-2">
          <h2 className="text-xl font-semibold">Memory summary</h2>
          <p className="text-slate-300">Moves: {moves}</p>
          <p className="text-slate-300">Time: {formattedTime}</p>
        </div>
      )}
    </div>
  );
};

export default MemoryGameScreen;
