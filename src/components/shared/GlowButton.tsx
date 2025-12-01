import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const GlowButton = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  ...props
}: GlowButtonProps) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group',
        // Size variants
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',
        // Color variants
        variant === 'primary' && 'bg-primary-500 text-zinc-950 hover:bg-primary-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] border border-transparent',
        variant === 'secondary' && 'bg-zinc-800/50 backdrop-blur-md border border-white/10 text-white hover:bg-zinc-700/50 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        variant === 'ghost' && 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5',
        variant === 'danger' && 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && icon && <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>}
        {children}
      </span>

      {/* Shine effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
      )}
    </button>
  );
};
