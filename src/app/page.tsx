"use client";

import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { MobileMockup } from "@/components/landing/MobileMockup";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-tps-charcoal text-white selection:bg-tps-blue/30 selection:text-white">
      <Header />
      
      <div className="pt-16">
        <Hero />
        <Features />
        <MobileMockup />
        
        <footer className="py-12 border-t border-white/5 bg-neutral-900/50 text-center">
            <p className="text-neutral-500 text-sm">
                © {new Date().getFullYear()} TPS (The Private Streamer). Open Source & Privacy Focused.
            </p>
        </footer>
      </div>
    </main>
  );
}
