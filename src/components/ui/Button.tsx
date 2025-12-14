import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', ...props }) => (
  <button
    className={cn(
      'rounded-lg px-4 py-2 font-semibold transition-colors duration-150',
      variant === 'primary'
        ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
        : 'bg-transparent border border-slate-700 text-slate-100 hover:border-indigo-500',
      className,
    )}
    {...props}
  />
);
