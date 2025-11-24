
export enum BlockType {
  EMPTY = 0,
  DIRT = 1,
  STONE = 2,
  HARD_STONE = 3,
  COAL = 4,
  COPPER = 10, 
  IRON = 5,
  AMETHYST = 11, 
  GOLD = 6,
  TITANIUM = 12, 
  DIAMOND = 7,
  EMERALD = 8,
  RUBY = 9,
  PAINITE = 13, 
  BEDROCK = 99,
  ELEVATOR = 90
}

export enum UpgradeType {
  PICKAXE = 'PICKAXE',
  OXYGEN_TANK = 'OXYGEN_TANK',
  CARGO_HOLD = 'CARGO_HOLD',
  SCANNER = 'SCANNER',
  EXOSKELETON = 'EXOSKELETON',
  DRILL = 'DRILL' 
}

export enum QualityTier {
  POOR = '粗糙',
  NORMAL = '普通',
  HIGH = '优质',
  PRISTINE = '完美'
}

export interface MineralItem {
  id: string;
  type: BlockType;
  name: string;
  quality: QualityTier;
  weight: number; // in kg
  value: number; // Final value
  droppedAt?: number; // Timestamp when dropped
}

export interface PlayerStats {
  money: number;
  currentOxygen: number;
  maxOxygen: number;
  inventory: MineralItem[];
  maxInventory: number;
  pickaxeLevel: number; // Determines what can be mined
  scannerLevel: number; // Radius of vision
  moveSpeedLevel: number; // Movement delay reduction
  drillLevel: number; // Mining area size
  unlockedElevators: number[]; // List of unlocked depths
  depth: number;
}

export interface BlockData {
  type: BlockType;
  health: number;
  revealed: boolean;
  droppedItem?: MineralItem; // New: Item sitting on this block
}

export interface MineralInfo {
  name: string;
  baseValue: number;
  color: string;
  minPickaxe: number;
  rarity: number; // Higher is rarer
  miningTime: number; // ms to mine
}

export interface UpgradeInfo {
  name: string;
  description: string;
  cost: number;
  value: number; // The new stat value (e.g., new max oxygen)
}

export interface GridConfig {
  width: number;
  height: number;
}

export interface FloatingTextItem {
  id: number;
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  timestamp: number;
}
