
import React from 'react';
import { BlockType } from '../types';
import { Diamond, Gem, Box, Hexagon, Triangle, Circle, Sparkles, Layers } from 'lucide-react';

interface MineralIconProps {
  type: BlockType;
  size?: number;
  className?: string;
}

export const MineralIcon: React.FC<MineralIconProps> = ({ type, size = 16, className = "" }) => {
  switch(type) {
    case BlockType.STONE: 
      return <Circle size={size} className={`text-stone-500 fill-stone-700/50 ${className}`} />;
      
    case BlockType.HARD_STONE: 
      return <Box size={size} className={`text-stone-600 fill-stone-800 ${className}`} />;
    
    case BlockType.COAL: 
      return <div className={`bg-black rounded-full opacity-90 shadow-sm ${className}`} style={{ width: size, height: size }} />;
      
    case BlockType.COPPER: 
      return <Circle size={size} className={`text-orange-700 fill-orange-900 drop-shadow-[0_0_2px_rgba(184,115,51,0.5)] ${className}`} />;
      
    case BlockType.IRON: 
      return <Box size={size} className={`text-slate-400 fill-slate-600 drop-shadow-[0_0_2px_rgba(176,196,222,0.5)] ${className}`} />;
    
    case BlockType.AMETHYST: 
      return <Gem size={size} className={`text-purple-400 fill-purple-900 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)] ${className}`} />;
      
    case BlockType.GOLD: 
      return <Circle size={size} className={`text-yellow-300 fill-yellow-600 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] ${className}`} />;
      
    case BlockType.TITANIUM: 
      return <Layers size={size} className={`text-gray-200 fill-gray-500 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] ${className}`} />;
    
    // Fancy Tiers
    case BlockType.DIAMOND: 
      return (
        <div className={`relative ${className}`}>
          <Diamond size={size} className="text-cyan-300 fill-cyan-900 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <Sparkles size={size * 0.6} className="absolute -top-1 -right-1 text-white animate-shimmer" />
        </div>
      );
      
    case BlockType.EMERALD: 
      return <Hexagon size={size} className={`text-green-400 fill-green-900 drop-shadow-[0_0_8px_rgba(74,222,128,0.7)] ${className}`} />;
      
    case BlockType.RUBY: 
      return <Triangle size={size} className={`text-red-500 fill-red-900 rotate-180 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] ${className}`} />;
      
    case BlockType.PAINITE: 
      return (
        <div className={`relative ${className}`}>
          <Sparkles size={size} className="text-rose-600 fill-rose-950 drop-shadow-[0_0_12px_rgba(225,29,72,1)] animate-pulse" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
        </div>
      );

    case BlockType.BEDROCK:
      return <div className={`bg-black border border-gray-800 ${className}`} style={{ width: size, height: size, backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }} />;
    
    default: return <div className={`bg-gray-800 rounded-sm ${className}`} style={{ width: size, height: size }} />;
  }
};
