
import { BlockData, BlockType, MineralItem, QualityTier } from '../types';
import { GRID_WIDTH, GRID_HEIGHT, DEPTH_TIERS, MINERALS, QUALITY_MULTIPLIERS, ELEVATOR_DEPTHS, SURFACE_ELEVATOR_X } from '../constants';

// Simple 2D noise function (Pseudo-Perlin ish)
// Returns value roughly between -1 and 1
const pseudoPerlin = (x: number, y: number, scale: number, seed: number): number => {
  const X = x * scale + seed;
  const Y = y * scale + seed;
  // Combine sine waves of different frequencies to create organic shapes
  return (Math.sin(X) + Math.cos(Y) + Math.sin(X * 2 + Y) * 0.5 + Math.cos(X + Y * 2) * 0.5) / 2.5;
};

export const generateGrid = (): BlockData[] => {
  const grid: BlockData[] = [];
  const seedCave = Math.random() * 1000;
  const seedVein = Math.random() * 1000;

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      let type = BlockType.DIRT;
      
      // 0. Surface Logic
      if (y === 0) {
        grid.push({ type: BlockType.EMPTY, health: 0, revealed: true });
        continue;
      }
      if (y === GRID_HEIGHT - 1) {
        grid.push({ type: BlockType.BEDROCK, health: 9999, revealed: false });
        continue;
      }

      // Check for Elevator Shaft Placement
      // Place elevator block at exact depth, and ensure it's revealed/accessible logic elsewhere
      if (ELEVATOR_DEPTHS.includes(y)) {
         // Elevator Core
         if (x === SURFACE_ELEVATOR_X) {
             grid.push({ type: BlockType.ELEVATOR, health: 9999, revealed: false }); 
             continue;
         }
         // Elevator Station (Empty space around it to make it visible/accessible)
         if (Math.abs(x - SURFACE_ELEVATOR_X) <= 2) {
             grid.push({ type: BlockType.EMPTY, health: 0, revealed: false });
             continue;
         }
      }

      // 1. Cave Generation (Cavities)
      const caveNoise = pseudoPerlin(x, y, 0.12, seedCave);
      const isCave = y > 8 && caveNoise > 0.35; 

      if (isCave) {
         grid.push({ type: BlockType.EMPTY, health: 0, revealed: false });
         continue;
      }

      // 2. Determine Tier
      const tier = DEPTH_TIERS.find(t => y >= t.start && y < t.end) || DEPTH_TIERS[DEPTH_TIERS.length - 1];
      
      // 3. Vein Generation
      const veinNoise = pseudoPerlin(x, y, 0.25, seedVein);
      const isVein = veinNoise > 0.45; 

      // Separate composition into "Structure" and "Ores"
      const structureTypes: string[] = [];
      const structureProbs: number[] = [];
      const oreTypes: string[] = [];
      const oreProbs: number[] = [];

      Object.entries(tier.composition).forEach(([key, prob]) => {
        const typeId = Number(key);
        // Define what is structure
        if (typeId === BlockType.DIRT || typeId === BlockType.STONE || typeId === BlockType.HARD_STONE) {
           structureTypes.push(key);
           structureProbs.push(prob as number);
        } else {
           oreTypes.push(key);
           oreProbs.push(prob as number);
        }
      });

      // Helper to pick from weighted arrays
      const pickType = (types: string[], probs: number[]): BlockType => {
         if (types.length === 0) return BlockType.STONE;
         const totalP = probs.reduce((a, b) => a + b, 0);
         let r = Math.random() * totalP;
         for(let i=0; i<types.length; i++) {
            r -= probs[i];
            if (r <= 0) return Number(types[i]) as BlockType;
         }
         return Number(types[types.length - 1]) as BlockType;
      };

      if (isVein) {
        if (Math.random() < 0.35 && oreTypes.length > 0) {
           type = pickType(oreTypes, oreProbs);
        } else {
           type = pickType(structureTypes, structureProbs);
        }
      } else {
        if (Math.random() < 0.01 && oreTypes.length > 0) {
            type = pickType(oreTypes, oreProbs);
        } else {
            type = pickType(structureTypes, structureProbs);
        }
      }

      grid.push({
        type,
        health: 100,
        revealed: y < 2 
      });
    }
  }
  return grid;
};

export const getBlockIndex = (x: number, y: number): number => {
  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return -1;
  return y * GRID_WIDTH + x;
};

export const checkCollision = (x: number, y: number, grid: BlockData[]): BlockData | null => {
  const idx = getBlockIndex(x, y);
  if (idx === -1) return { type: BlockType.BEDROCK, health: 9999, revealed: true }; 
  return grid[idx];
};

export const revealArea = (grid: BlockData[], centerX: number, centerY: number, radius: number): BlockData[] => {
  let hasChanges = false;
  const newGrid = [...grid];

  // 1. Standard Radius Reveal (Scanner Upgrade)
  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      const idx = getBlockIndex(x, y);
      if (idx !== -1) {
        if (!newGrid[idx].revealed) {
          newGrid[idx] = { ...newGrid[idx], revealed: true };
          hasChanges = true;
        }
      }
    }
  }

  // 2. Cave Flood Fill Visibility
  const centerIdx = getBlockIndex(centerX, centerY);
  const centerBlock = newGrid[centerIdx];
  
  // Propagate through EMPTY blocks AND ELEVATOR blocks (they count as open space for visibility)
  if (centerIdx !== -1 && (centerBlock.type === BlockType.EMPTY || centerBlock.type === BlockType.ELEVATOR)) {
    const queue = [centerIdx];
    const visited = new Set<number>([centerIdx]);

    while (queue.length > 0) {
      const currIdx = queue.shift()!;
      const cx = currIdx % GRID_WIDTH;
      const cy = Math.floor(currIdx / GRID_WIDTH);

      const neighbors = [
        { x: cx + 1, y: cy },
        { x: cx - 1, y: cy },
        { x: cx, y: cy + 1 },
        { x: cx, y: cy - 1 }
      ];

      for (const n of neighbors) {
        const nIdx = getBlockIndex(n.x, n.y);
        
        // Check bounds and visited
        if (nIdx !== -1 && !visited.has(nIdx)) {
          const neighborBlock = newGrid[nIdx];
          
          if (!neighborBlock.revealed) {
            newGrid[nIdx] = { ...neighborBlock, revealed: true };
            hasChanges = true;
          }
          
          visited.add(nIdx);

          // Continue traversing through EMPTY or ELEVATOR blocks
          if (neighborBlock.type === BlockType.EMPTY || neighborBlock.type === BlockType.ELEVATOR) {
             queue.push(nIdx);
          }
        }
      }
    }
  }

  return hasChanges ? newGrid : grid;
};

export const createMineralItem = (type: BlockType): MineralItem => {
  const mineralInfo = MINERALS[type];
  const weight = Math.round((0.5 + Math.random() * 4.5) * 10) / 10;
  
  const rand = Math.random();
  let quality = QualityTier.NORMAL;
  if (rand > 0.95) quality = QualityTier.PRISTINE;
  else if (rand > 0.75) quality = QualityTier.HIGH;
  else if (rand < 0.2) quality = QualityTier.POOR;
  
  const multiplier = QUALITY_MULTIPLIERS[quality];
  const value = Math.ceil(mineralInfo.baseValue * weight * multiplier);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    name: mineralInfo.name,
    quality,
    weight,
    value
  };
};
