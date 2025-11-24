
import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ElevatorTransitionProps {
  fromDepth: number;
  toDepth: number;
}

export const ElevatorTransition: React.FC<ElevatorTransitionProps> = ({ fromDepth, toDepth }) => {
  const goingDown = toDepth > fromDepth;
  const floorsPassed = Math.abs(toDepth - fromDepth);
  
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
       {/* Doors Closing Animation */}
       <div className="absolute left-0 top-0 w-1/2 h-full bg-[#1a1a1a] border-r-4 border-gray-700 animate-[door-close-left_1s_ease-in-out_forwards] z-20"></div>
       <div className="absolute right-0 top-0 w-1/2 h-full bg-[#1a1a1a] border-l-4 border-gray-700 animate-[door-close-right_1s_ease-in-out_forwards] z-20"></div>
       
       {/* Inside Content (Visible when doors close) */}
       <div className="relative z-30 flex flex-col items-center gap-4 opacity-0 animate-[fade-in-delay_0.5s_ease-out_forwards_0.5s]">
          <div className="text-sky-500 font-mono text-6xl font-black tracking-widest bg-black/50 px-6 py-2 rounded border border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.5)]">
             {goingDown ? <ArrowDown size={48} className="inline animate-bounce" /> : <ArrowUp size={48} className="inline animate-bounce" />}
             <span className="ml-4">{toDepth}m</span>
          </div>
          <div className="text-gray-400 text-sm font-bold uppercase tracking-[0.5em] animate-pulse">
             Elevator Running
          </div>
       </div>
       
       {/* Speed lines effect */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-10 animate-pulse"></div>

       <style>{`
          @keyframes door-close-left {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
          }
          @keyframes door-close-right {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }
          @keyframes fade-in-delay {
             0% { opacity: 0; }
             100% { opacity: 1; }
          }
       `}</style>
    </div>
  );
};
