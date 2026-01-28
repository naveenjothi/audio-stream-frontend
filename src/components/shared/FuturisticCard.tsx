import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FuturisticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "neon" | "glass";
  hoverEffect?: boolean;
}

export const FuturisticCard = ({
  children,
  className,
  variant = "default",
  hoverEffect = true,
  ...props
}: FuturisticCardProps) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 border-0", // border-0 to override default card border if needed, or let variants handle it
        // Variants
        variant === "default" &&
          "bg-zinc-900/40 backdrop-blur-xl border border-white/5",
        variant === "glass" &&
          "bg-[#0a0a0c]/60 backdrop-blur-2xl border-t border-white/10 shadow-2xl",
        variant === "neon" &&
          "bg-zinc-900/80 backdrop-blur-xl border border-primary-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
        // Hover effects
        hoverEffect &&
          "hover:border-white/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>

      {/* Glow effect on hover */}
      {hoverEffect && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-primary-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
      )}
    </Card>
  );
};
