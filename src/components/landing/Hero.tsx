
import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-tps-charcoal">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tps-cyan/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="inline-block animate-fade-in-up">
            <span className="px-3 py-1 rounded-full bg-tps-surface border border-white/5 text-sm md:text-base text-tps-cyan font-medium backdrop-blur-sm shadow-sm">
              The Private Streamer
            </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
          Your Music. Your Quality. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tps-cyan to-tps-lilac">
             No Cloud Required.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-tps-muted max-w-2xl mx-auto">
          Experience bit-perfect audio streaming directly from your device. 
          Zero compression, zero tracking, purely peer-to-peer.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" 
            className="group px-8 py-3.5 rounded-full bg-tps-cyan/10 hover:bg-tps-cyan/20 text-tps-cyan font-semibold border border-tps-cyan/30 backdrop-blur-md transition-all shadow-[0_0_20px_-5px_rgba(64,224,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(64,224,255,0.4)]"
            data-testid="hero-cta-button"
            aria-label="Get Started with TPS"
          >
            Get Started
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          
          <a href="#features" className="px-6 py-3 rounded-full text-tps-muted hover:text-white transition-colors text-sm font-medium">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};
