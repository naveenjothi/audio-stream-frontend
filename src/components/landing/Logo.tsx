
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="tps-logo">
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-tps-cyan to-tps-lilac flex items-center justify-center shadow-lg shadow-tps-cyan/20">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          {/* Geometric waveform stylized Key */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h3l2-6 4 12 3-8h4" />
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight text-white/90">TPS</span>
    </div>
  );
};
