
import React from 'react';
import { PlayerStats, UpgradeType } from '../types';
import { UPGRADES } from '../constants';
import { Battery, DollarSign, Pickaxe, Briefcase, HelpCircle, Compass } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  message: string | null;
  onToggleTutorial: () => void;
  objectiveText: string;
}

export const HUD: React.FC<HUDProps> = ({ stats, message, onToggleTutorial, objectiveText }) => {
  const oxygenPercentage = (stats.currentOxygen / stats.maxOxygen) * 100;
  const inventoryPercentage = (stats.inventory.length / stats.maxInventory) * 100;

  const pickaxeName = UPGRADES[UpgradeType.PICKAXE][stats.pickaxeLevel - 1]?.name || "手";
  
  // Bubble generation for Oxygen UI
  const bubbles = Array.from({ length: 5 }).map((_, i) => (
    <div 
      key={i} 
      className="absolute bg-white/30 rounded-full w-1.5 h-1.5 animate-bubble"
      style={{ 
        left: `${Math.random() * 100}%`, 
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${1.5 + Math.random()}s`
      }} 
    />
  ));

  return (
    <div className="absolute top-0 left-0 w-full p-4 z-30 pointer-events-none">
      <div className="flex justify-between items-start max-w-3xl mx-auto">
        
        {/* Left Side: Vitals */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          
          {/* Oxygen Tank UI */}
          <div className="bg-gray-900/90 backdrop-blur-md p-1.5 rounded-2xl border-2 border-gray-700 shadow-2xl min-w-[160px] relative overflow-hidden">
             <div className="flex items-center justify-between px-2 mb-1 z-10 relative">
                <div className="flex items-center gap-1 text-sky-300 font-bold text-sm uppercase tracking-wider">
                  <Battery size={14} /> 
                  <span>氧气</span>
                </div>
                <span className={`text-xs font-mono ${oxygenPercentage < 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                   {Math.floor(stats.currentOxygen)}/{stats.maxOxygen}
                </span>
             </div>
             
             {/* Glass Tube */}
             <div className="relative w-full h-6 bg-gray-800 rounded-full border border-gray-600 overflow-hidden shadow-inner">
                {/* Liquid */}
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out liquid-bg relative
                    ${oxygenPercentage < 20 ? 'bg-red-600' : ''}
                  `}
                  style={{ width: `${oxygenPercentage}%` }}
                >
                  {/* Surface Line */}
                  <div className="absolute top-0 right-0 h-full w-1 bg-white/40 blur-[1px]"></div>
                  {/* Bubbles */}
                  {oxygenPercentage > 0 && bubbles}
                </div>
             </div>
          </div>

          {/* Inventory UI */}
          <div className="bg-gray-900/90 backdrop-blur-md p-2 rounded-xl border border-gray-700 shadow-lg text-white min-w-[140px]">
             <div className="flex items-center justify-between mb-1 px-1">
               <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase">
                <Briefcase size={14} />
                <span>背包</span>
              </div>
              <span className="text-xs text-gray-400">{stats.inventory.length}/{stats.maxInventory}</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${inventoryPercentage >= 100 ? 'bg-red-500' : 'bg-orange-500'}`} 
                style={{ width: `${inventoryPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Objective & Message */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-md pointer-events-none">
          
          {/* Objective Banner */}
          <div className="bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2 animate-in slide-in-from-top-4">
            <Compass size={14} className="text-yellow-500" />
            <span className="text-xs font-bold text-yellow-100 tracking-wide uppercase whitespace-nowrap">{objectiveText}</span>
          </div>

          {/* Temporary Message Log */}
          {message && (
            <div className="mt-16 w-max max-w-[90vw]">
              <div className="bg-black/80 text-white px-6 py-3 rounded-full animate-bounce border border-white/20 backdrop-blur-sm text-center shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Stats */}
        <div className="flex flex-col gap-3 items-end pointer-events-auto">
           <div className="bg-gray-900/90 backdrop-blur-md p-3 rounded-xl border border-gray-700 shadow-lg text-white min-w-[120px] relative group">
             <button 
               onClick={onToggleTutorial}
               className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110 border border-white/20"
               title="帮助"
             >
               <HelpCircle size={16} />
             </button>
             <div className="text-gray-400 text-xs font-bold uppercase mb-1">资产</div>
             <div className="flex items-center gap-1 text-green-400 font-bold text-xl font-mono">
              <DollarSign size={18} />
              <span>{stats.money}</span>
            </div>
          </div>

          <div className="bg-gray-900/90 backdrop-blur-md p-2 rounded-xl border border-gray-700 shadow-lg text-gray-300 text-xs">
             <div className="flex items-center gap-2">
              <Pickaxe size={14} className="text-gray-400" />
              <span className="font-bold">{pickaxeName}</span>
            </div>
            <div className="mt-1 text-gray-500 font-mono">深度: {stats.depth}m</div>
          </div>
        </div>

      </div>
    </div>
  );
};
