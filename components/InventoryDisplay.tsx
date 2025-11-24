
import React, { useState } from 'react';
import { MineralItem, BlockType, QualityTier } from '../types';
import { MINERALS } from '../constants';
import { MineralIcon } from './MineralIcon';
import { Trash2 } from 'lucide-react';

interface InventoryDisplayProps {
  inventory: MineralItem[];
  onDropItem: (itemId: string) => void;
}

export const InventoryDisplay: React.FC<InventoryDisplayProps> = ({ inventory, onDropItem }) => {
  // Group items by type
  const groupedItems = inventory.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<BlockType, MineralItem[]>);

  // Sort keys to keep order consistent
  const sortedKeys = Object.keys(groupedItems).map(Number).sort((a, b) => a - b) as BlockType[];
  
  // State for handling the fixed tooltip
  const [activeTooltip, setActiveTooltip] = useState<{ type: BlockType, x: number, y: number } | null>(null);

  if (inventory.length === 0) return null;

  const getQualityColor = (quality: QualityTier) => {
    switch (quality) {
      case QualityTier.POOR: return 'text-gray-400';
      case QualityTier.NORMAL: return 'text-white';
      case QualityTier.HIGH: return 'text-blue-400 font-bold';
      case QualityTier.PRISTINE: return 'text-purple-400 font-bold shadow-white drop-shadow-sm';
      default: return 'text-gray-300';
    }
  };

  const handleInteraction = (e: React.MouseEvent, type: BlockType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Position to the right of the item, aligned with top
    // Adjust for mobile screen width if needed
    let x = rect.right + 10;
    const y = rect.top;
    
    // If tooltip would go off screen right, put it on the left
    if (x + 220 > window.innerWidth) {
        x = rect.left - 220; 
    }

    setActiveTooltip({
      type,
      x,
      y
    });
  };

  return (
    <>
      {/* Inventory Container */}
      <div 
        className="absolute top-36 left-2 md:top-44 md:left-4 z-20 flex flex-col gap-2 pointer-events-auto max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar scale-90 md:scale-100 origin-top-left transition-all"
        onScroll={() => setActiveTooltip(null)} // Hide tooltip on scroll to avoid floating ghost
      >
        {sortedKeys.map(type => {
          const items = groupedItems[type];
          const mineralInfo = MINERALS[type];
          
          return (
            <div 
              key={type} 
              className="relative flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-gray-700 transition-all hover:bg-black/80 hover:scale-105 cursor-help shadow-lg shrink-0 select-none active:scale-95"
              onMouseEnter={(e) => handleInteraction(e, type)}
              onMouseLeave={() => {}}
              onClick={(e) => handleInteraction(e, type)} // Toggle or Open
            >
              
              <div className="relative">
                <MineralIcon type={type} size={24} />
                <span className="absolute -bottom-1 -right-1 bg-gray-800 text-xs font-bold text-white px-1 rounded border border-gray-600 min-w-[16px] text-center">
                  {items.length}
                </span>
              </div>
              
              <span className="text-sm font-medium text-gray-200 hidden md:block">{mineralInfo.name}</span>

            </div>
          );
        })}
      </div>

      {/* Fixed Tooltip Overlay */}
      {/* Note: pointer-events-auto allows clicking delete button */}
      {activeTooltip && groupedItems[activeTooltip.type] && (
        <div 
          className="fixed z-50 w-56 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl pointer-events-auto animate-in fade-in duration-150"
          style={{ 
            left: activeTooltip.x, 
            top: activeTooltip.y,
            maxHeight: 'calc(100vh - ' + activeTooltip.y + 'px - 20px)',
          }}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="text-xs font-bold text-gray-400 mb-2 border-b border-gray-700 pb-1 flex justify-between items-center">
            <span>{MINERALS[activeTooltip.type].name} 详情</span>
            <span className="text-[10px] font-normal text-gray-500">点击垃圾桶丢弃</span>
          </div>
          
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] no-scrollbar">
            {groupedItems[activeTooltip.type].map((item, idx) => (
              <div key={item.id} className="flex justify-between items-center text-[10px] p-1 hover:bg-gray-800 rounded group">
                <div className="flex flex-col">
                  <span className={`${getQualityColor(item.quality)}`}>
                    {item.quality} {item.weight}kg
                  </span>
                  <span className="text-green-400">${item.value}</span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDropItem(item.id);
                  }}
                  className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="丢弃物品"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
