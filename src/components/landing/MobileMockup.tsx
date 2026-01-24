
import React from 'react';
import { UnifiedPlayer } from '@/components/player/UnifiedPlayer';

export const MobileMockup: React.FC = () => {
  return (
    <section className="py-24 overflow-hidden relative">
       {/* Background Elements */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] -z-10" />

       <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Your Music. <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tps-lilac to-tps-cyan">Anywhere.</span>
              </h2>
              <p className="text-tps-muted max-w-xl mx-auto">
                The same premium experience on your desktop and your mobile device. 
                Seamlessly synced, beautifully designed.
              </p>
          </div>

          {/* Phone Mockup Container */}
          <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl shadow-purple-500/10">
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-black relative">
                    {/* Status Bar Mock */}
                    <div className="absolute top-0 w-full h-8 bg-black/50 backdrop-blur-md z-20 flex justify-between items-center px-6 text-[10px] text-white font-medium">
                        <span>9:41</span>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-white/20 rounded-sm" />
                            <div className="w-3 h-3 bg-white/20 rounded-sm" />
                        </div>
                    </div>
                    
                    {/* Player UI */}
                    <div className="h-full overflow-y-auto pt-8 scrollbar-hide">
                        <UnifiedPlayer />
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full" />
                </div>
          </div>
       </div>
    </section>
  );
};
