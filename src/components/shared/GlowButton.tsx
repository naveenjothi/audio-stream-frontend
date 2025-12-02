import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Map size to Shadcn Button size
  const sizeMap = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
  } as const;

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-300 rounded-full group',
        // Custom variant styles that might not be in Shadcn's default theme
        variant === 'primary' && 'bg-primary-500 text-zinc-950 hover:bg-primary-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] border-transparent',
        variant === 'secondary' && 'bg-zinc-800/50 backdrop-blur-md border-white/10 text-white hover:bg-zinc-700/50 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        variant === 'ghost' && 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5',
        variant === 'danger' && 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        className
      )}
      variant={variant === 'ghost' ? 'ghost' : 'default'} // Use 'default' for others and override with classNames
      size={sizeMap[size]}
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
    </Button>
  );
};
