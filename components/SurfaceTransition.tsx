
import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, CheckCircle } from 'lucide-react';

interface SurfaceTransitionProps {
  depthReached: number;
  itemsCollected: number;
  onComplete: () => void;
}

export const SurfaceTransition: React.FC<SurfaceTransitionProps> = ({ depthReached, itemsCollected, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence of animations
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setStep(1), 500)); // Show Title
    timers.push(setTimeout(() => setStep(2), 1200)); // Show Depth
    timers.push(setTimeout(() => setStep(3), 1800)); // Show Loot
    timers.push(setTimeout(() => setStep(4), 2800)); // Fade out
    timers.push(setTimeout(() => onComplete(), 3000)); // Finish

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${step === 4 ? 'opacity-0' : 'opacity-95'}`}>
      
      <div className={`transform transition-all duration-700 ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} flex flex-col items-center`}>
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.6)] mb-6 animate-bounce">
          <ArrowUpCircle size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">抵达地表</h1>
        <div className="h-1 w-32 bg-green-500 rounded-full"></div>
      </div>

      <div className="mt-12 space-y-4 w-full max-w-xs px-6">
        {/* Stat 1: Depth */}
        <div className={`flex justify-between items-center p-4 bg-gray-900 border border-gray-700 rounded-xl transform transition-all duration-500 ${step >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <span className="text-gray-400 text-sm font-bold">本次潜入深度</span>
          <span className="text-sky-400 font-mono text-xl font-bold">{depthReached}m</span>
        </div>

        {/* Stat 2: Items */}
        <div className={`flex justify-between items-center p-4 bg-gray-900 border border-gray-700 rounded-xl transform transition-all duration-500 ${step >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          <span className="text-gray-400 text-sm font-bold">带回样本</span>
          <span className="text-yellow-400 font-mono text-xl font-bold">{itemsCollected}个</span>
        </div>
      </div>

      {step >= 3 && (
         <div className="mt-8 text-green-500 flex items-center gap-2 animate-pulse">
           <CheckCircle size={20} />
           <span className="font-bold">系统加压完成</span>
         </div>
      )}

    </div>
  );
};
