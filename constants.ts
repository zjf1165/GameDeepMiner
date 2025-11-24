
import { BlockType, MineralInfo, UpgradeInfo, UpgradeType, QualityTier } from './types';

export const GRID_WIDTH = 22; // Wider map
export const GRID_HEIGHT = 300;
export const VIEWPORT_HEIGHT = 13; 

// Surface Locations
export const SURFACE_SHOP_X = 4; // Shop location (Column 4)
export const SURFACE_ELEVATOR_X = 17; // Elevator location (Column 17)

// Oxygen Balance 
export const OXYGEN_PASSIVE_DRAIN = 0.35; // Slightly increased to maintain tension
export const OXYGEN_DEPTH_PENALTY = 0.006; 
export const OXYGEN_REGEN_RATE = 60; 

// Movement Delays
export const MOVE_DELAY_MS = 200; 

// Animation Constants
export const SWING_TIME_MS = 600; 

// Dropped Item Lifecycle
export const DROP_TIMEOUT_MS = 60000; // 60 Seconds before disappearing

export const ELEVATOR_DEPTHS = [50, 100, 150, 200, 250];

// Mineral Definitions 
// REBALANCE: 
// 1. Reduced mining time for Dirt/Stone/HardStone significantly to reduce grind.
// 2. Increased baseValue for valuable ores to compensate for lower rarity.
export const MINERALS: Record<BlockType, MineralInfo> = {
  [BlockType.EMPTY]:      { name: '空', baseValue: 0, color: 'transparent', minPickaxe: 0, rarity: 0, miningTime: 0 },
  
  // Tier 1: Surface
  [BlockType.DIRT]:       { name: '泥土', baseValue: 0, color: '#8B4513', minPickaxe: 1, rarity: 1, miningTime: 600 }, // Was 1200
  [BlockType.STONE]:      { name: '石头', baseValue: 2, color: '#808080', minPickaxe: 1, rarity: 2, miningTime: 1200 }, // Was 2400
  [BlockType.COAL]:       { name: '煤炭', baseValue: 35, color: '#1a1a1a', minPickaxe: 1, rarity: 5, miningTime: 2000 }, // Value 25->35, Time 3000->2000
  [BlockType.COPPER]:     { name: '铜矿', baseValue: 60, color: '#b87333', minPickaxe: 1, rarity: 6, miningTime: 2500 }, // Value 45->60, Time 3600->2500
  
  // Tier 2: Hard Rock
  [BlockType.HARD_STONE]: { name: '硬岩', baseValue: 5, color: '#4A4A4A', minPickaxe: 2, rarity: 4, miningTime: 2400 }, // Was 4200
  [BlockType.IRON]:       { name: '铁矿', baseValue: 110, color: '#B0C4DE', minPickaxe: 2, rarity: 8, miningTime: 3000 }, // Value 80->110, Time 4800->3000
  
  // Tier 3: Precious
  [BlockType.AMETHYST]:   { name: '紫水晶', baseValue: 250, color: '#9966cc', minPickaxe: 3, rarity: 12, miningTime: 4000 }, // Value 180->250
  [BlockType.GOLD]:       { name: '金矿', baseValue: 450, color: '#FFD700', minPickaxe: 3, rarity: 15, miningTime: 4500 }, // Value 350->450
  
  // Tier 4: Deep
  [BlockType.TITANIUM]:   { name: '钛金', baseValue: 750, color: '#C0C0C0', minPickaxe: 4, rarity: 20, miningTime: 6000 }, // Value 600->750
  [BlockType.DIAMOND]:    { name: '钻石', baseValue: 1600, color: '#00FFFF', minPickaxe: 4, rarity: 30, miningTime: 8000 }, // Value 1200->1600
  
  // Tier 5: Abyss
  [BlockType.EMERALD]:    { name: '绿宝石', baseValue: 2500, color: '#50C878', minPickaxe: 5, rarity: 60, miningTime: 10000 }, // Value 2000->2500
  [BlockType.RUBY]:       { name: '红宝石', baseValue: 4000, color: '#E0115F', minPickaxe: 5, rarity: 100, miningTime: 12000 }, // Value 3500->4000
  
  // Tier 6: Legendary
  [BlockType.PAINITE]:    { name: '红钻', baseValue: 9000, color: '#8B0000', minPickaxe: 6, rarity: 200, miningTime: 16000 }, // Value 8000->9000
  [BlockType.BEDROCK]:    { name: '基岩', baseValue: 0, color: '#000000', minPickaxe: 99, rarity: 0, miningTime: 0 },
  [BlockType.ELEVATOR]:   { name: '深层电梯', baseValue: 0, color: '#0ea5e9', minPickaxe: 99, rarity: 0, miningTime: 0 },
};

export const QUALITY_MULTIPLIERS: Record<QualityTier, number> = {
  [QualityTier.POOR]: 0.8,
  [QualityTier.NORMAL]: 1.0,
  [QualityTier.HIGH]: 1.5,
  [QualityTier.PRISTINE]: 2.5
};

export const DEPTH_TIERS = [
  { start: 0, end: 20, composition: { [BlockType.DIRT]: 0.70, [BlockType.STONE]: 0.20, [BlockType.COAL]: 0.08, [BlockType.COPPER]: 0.02 } },
  { start: 20, end: 50, composition: { [BlockType.DIRT]: 0.25, [BlockType.STONE]: 0.55, [BlockType.COAL]: 0.1, [BlockType.COPPER]: 0.05, [BlockType.IRON]: 0.05 } },
  { start: 50, end: 100, composition: { [BlockType.STONE]: 0.35, [BlockType.HARD_STONE]: 0.45, [BlockType.IRON]: 0.12, [BlockType.AMETHYST]: 0.04, [BlockType.GOLD]: 0.04 } },
  { start: 100, end: 180, composition: { [BlockType.HARD_STONE]: 0.6, [BlockType.GOLD]: 0.15, [BlockType.AMETHYST]: 0.1, [BlockType.TITANIUM]: 0.1, [BlockType.DIAMOND]: 0.05 } },
  { start: 180, end: 250, composition: { [BlockType.HARD_STONE]: 0.5, [BlockType.TITANIUM]: 0.15, [BlockType.DIAMOND]: 0.15, [BlockType.EMERALD]: 0.15, [BlockType.RUBY]: 0.05 } },
  { start: 250, end: 300, composition: { [BlockType.HARD_STONE]: 0.4, [BlockType.EMERALD]: 0.2, [BlockType.RUBY]: 0.2, [BlockType.PAINITE]: 0.2 } },
];

export const UPGRADES: Record<UpgradeType, UpgradeInfo[]> = {
  [UpgradeType.PICKAXE]: [
    { name: '生锈的镐', description: '只能挖掘煤炭和铜矿', cost: 0, value: 1 },
    { name: '强化铁镐', description: '粉碎硬岩，效率+20%', cost: 600, value: 2 },
    { name: '合金钻头', description: '开采金矿，效率+40%', cost: 2500, value: 3 },
    { name: '激光切割器', description: '切割钻石，效率+60%', cost: 9000, value: 4 },
    { name: '等离子粉碎机', description: '开采红宝石，效率+80%', cost: 28000, value: 5 },
    { name: '暗物质镐', description: '无坚不摧，效率+100%', cost: 70000, value: 6 },
  ],
  [UpgradeType.OXYGEN_TANK]: [
    { name: '塑料袋', description: '30容量 (适合浅层)', cost: 0, value: 30 },
    { name: '基础氧气瓶', description: '60容量', cost: 800, value: 60 },
    { name: '双联气瓶', description: '120容量', cost: 3000, value: 120 },
    { name: '高压气罐', description: '250容量', cost: 10000, value: 250 },
    { name: '循环呼吸器', description: '450容量', cost: 25000, value: 450 },
    { name: '便携生态系统', description: '800容量 (深渊必备)', cost: 60000, value: 800 },
  ],
  [UpgradeType.CARGO_HOLD]: [
    { name: '裤兜', description: '5个物品', cost: 0, value: 5 },
    { name: '帆布背包', description: '10个物品', cost: 500, value: 10 },
    { name: '登山包', description: '20个物品', cost: 2000, value: 20 },
    { name: '手推矿车', description: '40个物品', cost: 6000, value: 40 },
    { name: '反重力货箱', description: '70个物品', cost: 18000, value: 70 },
    { name: '量子压缩包', description: '120个物品', cost: 50000, value: 120 },
  ],
  [UpgradeType.SCANNER]: [
    { name: '矿工头灯', description: '标准照明 (半径1)', cost: 0, value: 1 },
    { name: '红外护目镜', description: '穿透墙壁 (半径2)', cost: 1200, value: 2 },
    { name: '地质雷达', description: '深层探测 (半径3)', cost: 5000, value: 3 },
    { name: '量子透视仪', description: '全知全能 (半径4)', cost: 15000, value: 4 },
  ],
  [UpgradeType.EXOSKELETON]: [
    { name: '无辅助', description: '标准移动速度 (200ms)', cost: 0, value: 200 },
    { name: '液压腿部支架', description: '移动速度提升 (170ms)', cost: 2500, value: 170 },
    { name: '伺服电机核心', description: '移动速度提升 (140ms)', cost: 10000, value: 140 },
    { name: '反重力推进器', description: '移动速度提升 (110ms)', cost: 25000, value: 110 },
    { name: '光速折跃引擎', description: '极速移动 (80ms)', cost: 60000, value: 80 },
  ],
  [UpgradeType.DRILL]: [
    { name: '标准钻头', description: '单格挖掘 (1x1)', cost: 0, value: 1 },
    { name: '双头冲击钻', description: '垂直挖掘 (1x2)', cost: 4000, value: 2 },
    { name: '深层钻探机', description: '垂直挖掘 (1x3)', cost: 12000, value: 3 },
    { name: '爆破阵列', description: '区域爆破 (2x2)', cost: 35000, value: 4 },
    { name: '量子挖掘机', description: '甚至能挖穿时空 (3x3)', cost: 100000, value: 5 },
  ]
};
