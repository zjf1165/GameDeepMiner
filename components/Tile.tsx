
import React, { useEffect, useState } from 'react';
import { BlockType, BlockData } from '../types';
import { MINERALS } from '../constants';
import { MineralIcon } from './MineralIcon';
import { Pickaxe, ChevronsUp, Lock } from 'lucide-react';

interface TileProps {
  block: BlockData;
  x: number;
  y: number;
  isPlayer: boolean;
  isMining?: boolean; // Player is performing mining action
  isBeingMined?: boolean; // Block is target of mining
  isExposed: boolean; // True if adjacent to AIR or Player
}

export const Tile: React.FC<TileProps> = ({ block, x, y, isPlayer, isMining, isBeingMined, isExposed }) => {
  const [moveAnim, setMoveAnim] = useState(false);

  // Trigger squash animation when player arrives at new coordinates
  useEffect(() => {
    if (isPlayer) {
      setMoveAnim(true);
      const timer = setTimeout(() => setMoveAnim(false), 200);
      return () => clearTimeout(timer);
    }
  }, [x, y, isPlayer]);

  const getBackground = (type: BlockType) => {
    switch(type) {
      case BlockType.DIRT: return 'bg-[#5d4037] border border-[#4e342e]';
      case BlockType.STONE: return 'bg-[#757575] border border-[#616161]';
      case BlockType.HARD_STONE: return 'bg-[#424242] border border-[#212121]';
      case BlockType.BEDROCK: return 'bg-[#000000]';
      case BlockType.ELEVATOR: return 'bg-[#0f172a] border border-[#0ea5e9]';
      default: return 'bg-[#2d2d2d] border border-[#1f1f1f]'; // Generic ore background
    }
  };

  if (isPlayer) {
    return (
      <div className="w-full aspect-square bg-transparent flex items-center justify-center relative z-20">
        <div className={`relative w-full h-full flex items-center justify-center ${moveAnim ? 'animate-squash' : ''}`}>
          
          {/* Miner Character SVG Composition */}
          <div className="relative w-3/4 h-3/4">
             {/* Body */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-orange-600 rounded-t-lg shadow-md z-10"></div>
             
             {/* Head */}
             <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-yellow-500 rounded-md shadow-sm z-20 border border-yellow-600">
                {/* Light */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-2 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]"></div>
             </div>

             {/* Arm & Pickaxe Container */}
             <div className={`absolute top-1 right-0 w-full h-full origin-bottom-left ${isMining ? 'animate-mine-swing' : ''} z-30 pointer-events-none`}>
                {/* Icon positioned to look held */}
                <div className="absolute bottom-2 right-[-2px] transform rotate-12 origin-bottom-left">
                   <Pickaxe 
                      size={22} 
                      className="text-gray-200 fill-gray-800 drop-shadow-md" 
                      strokeWidth={2}
                   />
                </div>
             </div>
          </div>

        </div>
      </div>
    );
  }

  // Deep Elevator Block (Visuals)
  if (block.type === BlockType.ELEVATOR) {
     if (!block.revealed) return <div className="w-full aspect-square bg-[#0c0805] border border-[#1a120b]" />;
     
     return (
       <div className={`w-full aspect-square flex items-center justify-center relative overflow-hidden ${getBackground(block.type)} shadow-[inset_0_0_10px_#0ea5e9]`}>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(14,165,233,0.1)_25%,rgba(14,165,233,0.1)_50%,transparent_50%,transparent_75%,rgba(14,165,233,0.1)_75%,rgba(14,165,233,0.1)_100%)] bg-[length:10px_10px]"></div>
          <div className="flex flex-col items-center justify-center z-10 text-sky-400 animate-pulse">
             <ChevronsUp size={20} />
             <div className="text-[8px] font-bold font-mono mt-[-2px]">ELEV</div>
          </div>
          {/* Door effect */}
          <div className="absolute left-0 top-0 h-full w-[10%] bg-sky-900/50 border-r border-sky-500/30"></div>
          <div className="absolute right-0 top-0 h-full w-[10%] bg-sky-900/50 border-l border-sky-500/30"></div>
       </div>
     );
  }

  if (block.type === BlockType.EMPTY) {
    // Render sky if near surface (y < 1), otherwise dark cave bg
    return (
      <div className={`w-full aspect-square relative ${y < 1 ? 'bg-sky-900/20' : 'bg-[#1a120b]/50'}`}>
        {/* Dropped Item Visualization */}
        {block.droppedItem && (
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce z-10" title={`掉落物: ${block.droppedItem.name}`}>
              <div className="scale-75 bg-black/50 p-1 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
                <MineralIcon type={block.droppedItem.type} size={16} />
              </div>
           </div>
        )}
      </div>
    );
  }

  if (!block.revealed) {
    return <div className="w-full aspect-square bg-[#0c0805] border border-[#1a120b]" />;
  }

  const mineralName = MINERALS[block.type]?.name;

  // Atmospheric Lighting Logic
  const lightingClass = isExposed 
    ? 'brightness-100' 
    : 'brightness-[0.4] opacity-90 saturate-50';

  return (
    <div 
      title={mineralName}
      className={`w-full aspect-square flex items-center justify-center relative overflow-hidden transition-all duration-500 
        ${getBackground(block.type)} 
        ${lightingClass}
        ${isBeingMined ? 'animate-shake brightness-125' : ''}
      `}
    >
       {/* Ores or specific icons */}
       <MineralIcon type={block.type} size={isExposed ? 16 : 12} className={`z-10 transition-all ${isBeingMined ? 'scale-110' : ''}`} />
       
       {/* Mining Overlay Effect */}
       {isBeingMined && (
         <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/20">
           {/* Sparks */}
           <div className="absolute w-full h-full animate-pulse bg-yellow-200/10"></div>
         </div>
       )}
    </div>
  );
};
