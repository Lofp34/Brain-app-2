import React from 'react';
import { cn } from '../../utils/cn';

interface WheelPickerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ value, min, max, step = 1, onChange }) => {
  const options = Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step);

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-full border border-slate-700 px-3 py-1 text-lg"
        onClick={() => onChange(Math.max(min, value - step))}
      >
        –
      </button>
      <div className="min-w-[72px] rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-center text-xl font-semibold">
        {value}
      </div>
      <button
        className="rounded-full border border-slate-700 px-3 py-1 text-lg"
        onClick={() => onChange(Math.min(max, value + step))}
      >
        +
      </button>
    </div>
  );
};
