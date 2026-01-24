
import React from 'react';

// Using straight SVG icons for independence and "custom" feel as requested.
const PlayIcon = () => (
    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const SkipIcon = () => (
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const PrevIcon = () => (
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
);

export const UnifiedPlayer: React.FC = () => {
  const isLossless = true;
  const isPlaying = true; // Mock state

  return (
    <div className="bg-tps-charcoal w-full max-w-sm mx-auto p-6 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Device Status Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2" data-testid="player-connection-status">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs text-neutral-400 font-medium">Connected</span>
        </div>

      {/* Album Art */}
      <div className="relative mb-8 mt-4 mx-auto w-64 h-64">
           {/* Glow Effect */}
           <div className="absolute inset-0 bg-tps-blue/20 blur-2xl rounded-full" />
           <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-neutral-900 group">
                {/* Placeholder Gradient */}
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                    <div className="w-16 h-16 text-neutral-700">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                </div>
           </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-8 space-y-1">
          <h3 className="text-2xl font-bold text-white tracking-tight truncate">Midnight Waves</h3>
          <p className="text-neutral-400 font-medium">Lunar Orchestra</p>
      </div>

      {/* Waveform Visualizer (Mock) */}
      <div className="h-12 flex items-center justify-center gap-1 mb-8 opacity-50">
          {[...Array(20)].map((_, i) => (
             <div 
                key={i} 
                className="w-1 bg-tps-blue rounded-full animate-music-bar"
                style={{ 
                    height: `${Math.max(20, Math.random() * 100)}%`,
                    animationDelay: `${i * 0.05}s`
                }}
             />
          ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
              <button className="text-neutral-400 hover:text-white transition-colors" data-testid="player-skip-prev">
                  <PrevIcon />
              </button>
              
              <button 
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                data-testid="player-play-pause"
              >
                 {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>

              <button className="text-neutral-400 hover:text-white transition-colors" data-testid="player-skip-next">
                  <SkipIcon />
              </button>
          </div>

          <div className="flex items-center justify-center">
              <button 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase transition-all ${
                    isLossless 
                    ? 'border-tps-blue/50 text-tps-blue bg-tps-blue/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' 
                    : 'border-white/10 text-neutral-500 hover:border-white/30'
                }`}
                data-testid="player-lossless-toggle"
              >
                  <span>Lossless</span>
                  {isLossless && (
                      <span className="w-1.5 h-1.5 rounded-full bg-tps-blue shadow-[0_0_5px_currentColor]" />
                  )}
              </button>
          </div>
      </div>
    </div>
  );
};
