
import React from 'react';

export interface FlyingItem {
  id: number;
  startX: number; // Percentage or pixel relative to viewport? We'll use CSS vars
  startY: number;
  color: string;
  icon: React.ReactNode;
}

interface FlyingItemOverlayProps {
  items: FlyingItem[];
}

export const FlyingItemOverlay: React.FC<FlyingItemOverlayProps> = ({ items }) => {
  // Target position (approximate position of Inventory Icon in HUD)
  // Since HUD is fixed top-left:
  // The inventory icon is roughly at 20% width (mobile) or fixed pixels.
  // Let's assume target is 50px from left, 80px from top.
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-fly-to-bag text-white"
          style={{
            '--start-x': `${item.startX}px`,
            '--start-y': `${item.startY}px`,
            '--target-x': '60px', // Target Inventory X
            '--target-y': '80px', // Target Inventory Y
            left: 0,
            top: 0,
          } as React.CSSProperties}
        >
          <div className={`p-2 rounded-full bg-gray-900 border-2 border-white shadow-lg ${item.color}`}>
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
