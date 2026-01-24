
import React from 'react';

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div 
    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-tps-blue/50 transition-colors group"
    role="article"
    aria-label={`Feature: ${title}`}
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tps-charcoal to-black border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-tps-blue transition-colors">
      {title}
    </h3>
    <p className="text-neutral-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-4 bg-tps-charcoal/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Sonic Clarity. <span className="text-tps-blue">Redefined.</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Experience the future of personal audio streaming with features designed for audiophiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Bit-Perfect P2P"
            description="Direct device-to-device streaming. Audio never touches a cloud server, ensuring 100% original quality."
            icon={
              <svg className="w-6 h-6 text-tps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <FeatureCard
            title="On-Device AI Discovery"
            description="Smart recommendations generated locally. Your listening habits stay on your device, not sold to advertisers."
            icon={
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          <FeatureCard
            title="Zero-Storage Privacy"
            description="Stream your own library securely. We allow you to access your files without uploading them anywhere."
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
};
