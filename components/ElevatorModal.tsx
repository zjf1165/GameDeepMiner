
import React from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Lock } from 'lucide-react';
import { ELEVATOR_DEPTHS } from '../constants';

interface ElevatorModalProps {
  unlockedDepths: number[];
  currentDepth: number; // New prop to know where we are
  onClose: () => void;
  onTravel: (depth: number) => void;
}

export const ElevatorModal: React.FC<ElevatorModalProps> = ({ unlockedDepths, currentDepth, onClose, onTravel }) => {
  const isSurface = currentDepth === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl border-2 border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.3)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
            {isSurface ? <ArrowDownCircle /> : <ArrowUpCircle />} 
            {isSurface ? '深层速降电梯' : '返回地表'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
          
          {/* Option to go to Surface (if underground) */}
          {!isSurface && (
            <button
              onClick={() => onTravel(0)}
              className="flex items-center justify-between p-4 rounded-xl border border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-900/40 text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
               <span className="font-mono text-lg font-bold text-yellow-400">返回地表 (0m)</span>
               <ArrowUpCircle className="text-yellow-400" />
            </button>
          )}

          {/* Depth Options */}
          {ELEVATOR_DEPTHS.map((depth) => {
            // Don't show option to go to current depth
            if (depth === currentDepth) return null;

            const isUnlocked = unlockedDepths.includes(depth);
            return (
              <button
                key={depth}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onTravel(depth)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isUnlocked 
                  ? 'bg-sky-900/30 border-sky-500/50 hover:bg-sky-900/50 text-white hover:scale-[1.02] shadow-lg' 
                  : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="font-mono text-lg font-bold">-{depth}m 层</span>
                {isUnlocked ? (
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                    准备就绪
                  </span>
                ) : (
                  <Lock size={18} className="text-gray-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-gray-800 p-4 text-center text-xs text-gray-400">
          {isSurface ? "继续向下探索以解锁更多楼层。" : "只有已激活的电梯节点可以互相传送。"}
        </div>
      </div>
    </div>
  );
};
