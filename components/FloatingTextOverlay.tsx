
import React from 'react';
import { FloatingTextItem } from '../types';
import { GRID_WIDTH } from '../constants';

interface FloatingTextOverlayProps {
  items: FloatingTextItem[];
  viewportStart: number;
  visibleRowCount: number;
}

export const FloatingTextOverlay: React.FC<FloatingTextOverlayProps> = ({ items, viewportStart, visibleRowCount }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {items.map((item) => {
        const relY = item.y - viewportStart;
        // Safety check to ensure we don't render if calculation is off (though parent filters usually handle this)
        if (relY < 0) return null;

        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center whitespace-nowrap animate-[float-up_1.5s_ease-out_forwards]"
            style={{
              // Calculate Left based on GRID_WIDTH (22)
              left: `calc(${item.x} * (100% / ${GRID_WIDTH}) + (100% / ${GRID_WIDTH * 2}))`,
              // Calculate Top based on visible rows in the current viewport
              top: `calc(${relY} * (100% / ${visibleRowCount}) + (100% / ${visibleRowCount * 2}))`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <span 
              className={`text-sm font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${item.color}`}
              style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              {item.text}
            </span>
            {item.subText && (
              <span className="text-xs text-white font-bold drop-shadow-md mt-0.5">
                {item.subText}
              </span>
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          20% { transform: translate(-50%, -150%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -300%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
