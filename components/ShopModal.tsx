
import React, { useEffect } from 'react';
import { PlayerStats, UpgradeType, QualityTier } from '../types';
import { UPGRADES } from '../constants';
import { Pickaxe, Battery, Briefcase, X, ArrowUpCircle, Sparkles, Eye, Bot, Zap, Grip } from 'lucide-react';
import { MineralIcon } from './MineralIcon';
import { audioService } from '../services/audioService';

interface ShopModalProps {
  stats: PlayerStats;
  onClose: () => void;
  onSell: () => void;
  onUpgrade: (type: UpgradeType, level: number) => void;
  appraisalText: string;
}

export const ShopModal: React.FC<ShopModalProps> = ({ stats, onClose, onSell, onUpgrade, appraisalText }) => {
  
  const handleSell = () => {
    if (stats.inventory.length > 0) {
      audioService.playSell();
      onSell();
    }
  };

  const handleUpgrade = (type: UpgradeType, level: number) => {
    audioService.playSell(); // Use same sound for transaction
    onUpgrade(type, level);
  };

  const renderUpgradeRow = (type: UpgradeType, currentLevel: number) => {
    const upgrades = UPGRADES[type];
    const nextLevelIndex = currentLevel; // currentLevel is 1-based
    const nextUpgrade = upgrades[nextLevelIndex];
    const isMaxed = nextLevelIndex >= upgrades.length;

    let icon;
    switch(type) {
      case UpgradeType.PICKAXE: icon = <Pickaxe size={20} />; break;
      case UpgradeType.OXYGEN_TANK: icon = <Battery size={20} />; break;
      case UpgradeType.CARGO_HOLD: icon = <Briefcase size={20} />; break;
      case UpgradeType.SCANNER: icon = <Eye size={20} />; break;
      case UpgradeType.EXOSKELETON: icon = <Zap size={20} />; break;
      case UpgradeType.DRILL: icon = <Grip size={20} />; break;
    }

    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-4 flex items-center justify-between border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-700 rounded-full text-sky-400">{icon}</div>
          <div>
            <h3 className="font-bold text-white text-lg">{isMaxed ? "已满级" : nextUpgrade.name}</h3>
            <p className="text-gray-400 text-sm">{isMaxed ? "已达最高科技" : nextUpgrade.description}</p>
          </div>
        </div>
        {!isMaxed && (
          <button 
            disabled={stats.money < nextUpgrade.cost}
            onClick={() => handleUpgrade(type, nextLevelIndex + 1)}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${
              stats.money >= nextUpgrade.cost 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>${nextUpgrade.cost}</span>
            <ArrowUpCircle size={18} />
          </button>
        )}
        {isMaxed && <div className="text-green-500 font-bold px-4">MAX</div>}
      </div>
    );
  };

  const sellValue = stats.inventory.reduce((acc, curr) => acc + curr.value, 0);

  const getQualityColor = (quality: QualityTier) => {
    switch (quality) {
      case QualityTier.POOR: return 'text-gray-500';
      case QualityTier.NORMAL: return 'text-gray-300';
      case QualityTier.HIGH: return 'text-blue-400';
      case QualityTier.PRISTINE: return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-yellow-500">深层地底交易所</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">当前余额: <span className="text-green-400 font-mono text-lg">${stats.money}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          
          {/* Sell Section */}
          <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
            
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">出售货物</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    载重: {stats.inventory.length}/{stats.maxInventory} 
                  </p>
                </div>
                
                <button 
                  onClick={handleSell}
                  disabled={stats.inventory.length === 0}
                  className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all ${
                    stats.inventory.length > 0
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105 active:scale-95'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  全部出售 (+${sellValue})
                </button>
              </div>

              {/* Visual Inventory Grid */}
              {stats.inventory.length > 0 ? (
                <div className="bg-black/40 rounded-lg p-3 flex flex-wrap gap-2 min-h-[60px] items-start">
                  {stats.inventory.map((item) => {
                    return (
                      <div key={item.id} className="group relative w-10 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center hover:border-white transition-colors cursor-help">
                        <MineralIcon type={item.type} size={20} />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-500 z-20">
                          <div className="font-bold text-yellow-400 mb-1">{item.name}</div>
                          <div className={`text-xs ${getQualityColor(item.quality)}`}>品质: {item.quality}</div>
                          <div className="text-gray-400">重量: {item.weight}kg</div>
                          <div className="text-green-400 font-mono mt-1 text-right">估价: ${item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                 <div className="bg-black/40 rounded-lg p-4 text-center text-gray-500 text-sm">
                   货舱是空的。
                 </div>
              )}
              
              {/* Appraisal Text */}
              {stats.inventory.length > 0 && (
                <div className="bg-black/20 p-3 rounded border border-white/10 mt-2 flex items-start gap-3">
                   <div className="p-2 bg-gray-800 rounded-full">
                     <Bot size={20} className="text-sky-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-yellow-400 text-sm italic mb-2">"{appraisalText}"</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Upgrades Section */}
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            装备升级
          </h3>
          
          {renderUpgradeRow(UpgradeType.PICKAXE, stats.pickaxeLevel)}
          {renderUpgradeRow(UpgradeType.DRILL, stats.drillLevel)}
          {renderUpgradeRow(UpgradeType.OXYGEN_TANK, UPGRADES[UpgradeType.OXYGEN_TANK].findIndex(u => u.value === stats.maxOxygen) + 1)}
          {renderUpgradeRow(UpgradeType.EXOSKELETON, stats.moveSpeedLevel)}
          {renderUpgradeRow(UpgradeType.CARGO_HOLD, UPGRADES[UpgradeType.CARGO_HOLD].findIndex(u => u.value === stats.maxInventory) + 1)}
          {renderUpgradeRow(UpgradeType.SCANNER, stats.scannerLevel)}

        </div>

        {/* Footer */}
        <div className="bg-gray-900 p-4 border-t border-gray-700 text-center text-gray-500 text-sm">
          使用方向键移动。返回地表 (顶部) 补充氧气。
        </div>
      </div>
    </div>
  );
};
