
import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-tps-charcoal/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-tps-muted hover:text-white transition-colors"
            data-testid="nav-login-link"
          >
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-full bg-tps-surface hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/20"
            data-testid="nav-get-started-button"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
