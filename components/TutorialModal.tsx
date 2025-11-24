
import React from 'react';
import { X, Pickaxe, DollarSign, Wind, Eye } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] w-full max-w-lg rounded-2xl border border-orange-500/30 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center border-b border-gray-700 pb-4">
          矿工操作指南 v2.0
        </h2>

        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400 mt-1">
              <Wind size={24} />
            </div>
            <div>
              <h3 className="font-bold text-blue-400 text-lg">深层高压氧气</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold">深度越深，氧气消耗越快！</span>
                <br />
                在深层区域，你的氧气会像流水一样消失。请务必在下潜前升级你的氧气瓶。
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400 mt-1">
              <Eye size={24} />
            </div>
            <div>
              <h3 className="font-bold text-purple-400 text-lg">地质扫描视野</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                你的头盔装备了穿透扫描仪。
                <br />
                你可以隔着墙壁看到<span className="text-white font-bold">周围 2 格</span>内的矿物。利用这个优势规划路线，不要盲目挖掘石头。
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-yellow-900/30 rounded-lg text-yellow-400 mt-1">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 text-lg">挖掘与交易</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                除了普通的煤铁，深层还有<span className="text-purple-400">紫水晶</span>、<span className="text-gray-300">钛金</span>甚至<span className="text-red-600">红钻</span>。
                返回地表时交易所自动开启，Gemini AI 会鉴定价值。
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-900/20"
        >
          准备下潜！
        </button>
      </div>
    </div>
  );
};
