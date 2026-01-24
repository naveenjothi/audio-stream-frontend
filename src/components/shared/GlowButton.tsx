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
        'relative overflow-hidden transition-all duration-300 rounded-tps group font-medium tracking-wide',
        // Custom variant styles
        variant === 'primary' && 'bg-tps-cyan text-tps-charcoal hover:bg-tps-cyan/90 shadow-[0_0_20px_rgba(64,224,255,0.3)] hover:shadow-[0_0_35px_rgba(64,224,255,0.6)] border-transparent',
        variant === 'secondary' && 'bg-tps-surface border border-white/10 text-white hover:bg-white/5 hover:border-tps-cyan/30 hover:shadow-[0_0_20px_rgba(64,224,255,0.15)]',
        variant === 'ghost' && 'bg-transparent text-tps-muted hover:text-white hover:bg-white/5',
        variant === 'danger' && 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
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
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0" />
      )}
    </Button>
  );
};
