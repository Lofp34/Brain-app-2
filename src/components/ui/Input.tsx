import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={cn(
      'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none',
      className,
    )}
    {...props}
  />
);
