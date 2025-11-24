
import React from 'react';
import { Store, ArrowDownCircle, ChevronsDown, ArrowDown } from 'lucide-react';
import { GRID_WIDTH, SURFACE_SHOP_X, SURFACE_ELEVATOR_X } from '../constants';

interface SurfaceBaseProps {
  onOpenShop: () => void;
  onUseElevator: () => void;
  unlockedElevators: number[];
}

export const SurfaceBase: React.FC<SurfaceBaseProps> = ({ onOpenShop, onUseElevator, unlockedElevators }) => {
  // Calculate position based on grid columns.
  const getLeftPct = (x: number) => `calc((${x} + 0.5) * (100% / ${GRID_WIDTH}))`;

  // The SurfaceBase renders strictly over the 0th row (top row) of the grid.
  // Tiles are square. The width of the grid is 100%.
  // So height of one row is (100% / GRID_WIDTH).
  // We use padding-bottom hack to enforce this aspect ratio relative to width.
  
  return (
    <div 
      className="absolute top-0 left-0 w-full z-20 pointer-events-none"
      style={{ 
        height: 0,
        paddingBottom: `calc(100% / ${GRID_WIDTH})` 
      }}
    >
      
      {/* Base Visuals Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Shop Building */}
        <div 
          className="absolute bottom-0 flex flex-col items-center transform origin-bottom"
          style={{ left: getLeftPct(SURFACE_SHOP_X), transform: 'translateX(-50%)' }}
        >
           <div className="animate-bounce mb-1 text-yellow-400 drop-shadow-md">
             <ArrowDown size={20} />
           </div>
           <div className="w-24 h-20 bg-gray-800 border-2 border-yellow-500 rounded-t-lg relative shadow-lg flex items-center justify-center">
              <Store size={32} className="text-yellow-400" />
              <div className="absolute -top-4 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                交易所
              </div>
           </div>
           {/* Foundation/Ramp */}
           <div className="w-28 h-2 bg-gray-700 rounded-full mt-[-2px]"></div>
        </div>

        {/* Launchpad (Center) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center mb-2">
           <div className="w-32 h-4 bg-gray-600 border-t-2 border-white/20 rounded-t-xl flex justify-center gap-4">
             <div className="w-2 h-full bg-yellow-500/50"></div>
             <div className="w-2 h-full bg-yellow-500/50"></div>
           </div>
           <div className="text-[10px] text-gray-400 font-mono tracking-widest">LAUNCHPAD</div>
        </div>

        {/* Elevator Station */}
        <div 
          className={`absolute bottom-0 flex flex-col items-center transform origin-bottom transition-opacity ${unlockedElevators.length > 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}
          style={{ left: getLeftPct(SURFACE_ELEVATOR_X), transform: 'translateX(-50%)' }}
        >
           {unlockedElevators.length > 0 && (
             <div className="animate-bounce mb-1 text-sky-400 drop-shadow-md">
               <ArrowDown size={20} />
             </div>
           )}
           <div className="w-20 h-24 bg-gray-800 border-2 border-sky-500 rounded-t-lg relative shadow-lg flex flex-col items-center justify-center gap-1">
              <ChevronsDown size={28} className="text-sky-400" />
              <div className="text-[10px] text-sky-300 font-bold">电梯</div>
           </div>
           {unlockedElevators.length === 0 && (
              <div className="absolute -top-8 bg-red-900/80 text-red-300 text-xs px-2 py-1 rounded border border-red-500 whitespace-nowrap">
                 需在地下解锁
              </div>
           )}
           <div className="w-24 h-2 bg-gray-700 rounded-full mt-[-2px]"></div>
        </div>

      </div>
    </div>
  );
};
