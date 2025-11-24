
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GridConfig, BlockType, PlayerStats, BlockData, UpgradeType, FloatingTextItem, QualityTier } from './types';
import { GRID_WIDTH, GRID_HEIGHT, VIEWPORT_HEIGHT, UPGRADES, MINERALS, OXYGEN_PASSIVE_DRAIN, OXYGEN_DEPTH_PENALTY, OXYGEN_REGEN_RATE, MOVE_DELAY_MS, SWING_TIME_MS, ELEVATOR_DEPTHS, SURFACE_SHOP_X, SURFACE_ELEVATOR_X, DROP_TIMEOUT_MS } from './constants';
import { generateGrid, getBlockIndex, checkCollision, createMineralItem, revealArea } from './services/gameLogic';
import { getMineralAppraisal } from './services/geminiService';
import { audioService } from './services/audioService';
import { Tile } from './components/Tile';
import { HUD } from './components/HUD';
import { ShopModal } from './components/ShopModal';
import { InventoryDisplay } from './components/InventoryDisplay';
import { FloatingTextOverlay } from './components/FloatingTextOverlay';
import { FlyingItemOverlay, FlyingItem } from './components/FlyingItemOverlay';
import { TutorialModal } from './components/TutorialModal';
import { SurfaceTransition } from './components/SurfaceTransition';
import { ElevatorTransition } from './components/ElevatorTransition';
import { MineralIcon } from './components/MineralIcon';
import { SurfaceBase } from './components/SurfaceBase';
import { ElevatorModal } from './components/ElevatorModal';
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const INITIAL_STATS: PlayerStats = {
  money: 0,
  currentOxygen: 30,
  maxOxygen: 30,
  inventory: [],
  maxInventory: 5,
  pickaxeLevel: 1,
  scannerLevel: 1, 
  moveSpeedLevel: 1, 
  drillLevel: 1,
  unlockedElevators: [],
  depth: 0
};

const App: React.FC = () => {
  const [grid, setGrid] = useState<BlockData[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: Math.floor(GRID_WIDTH / 2), y: 0 });
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isElevatorOpen, setIsElevatorOpen] = useState(false);
  const [isElevatorMoving, setIsElevatorMoving] = useState(false); // For transition animation
  const [elevatorTargetDepth, setElevatorTargetDepth] = useState<number | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [appraisal, setAppraisal] = useState<string>("准备估值。");
  const [gameStarted, setGameStarted] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSurfaceAnim, setShowSurfaceAnim] = useState(false);
  const [maxDepthThisRun, setMaxDepthThisRun] = useState(0);
  
  // Action State
  const [isBusy, setIsBusy] = useState(false);
  const [miningTarget, setMiningTarget] = useState<{x: number, y: number} | null>(null);

  // Input State
  const keysPressed = useRef<Set<string>>(new Set());
  
  // We use a ref to hold the latest handleMove so the interval doesn't need to reset
  const handleMoveRef = useRef<(dx: number, dy: number) => void>(() => {});

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const oxygenWarningRef = useRef<number>(0);

  const getVisionRadius = (level: number) => UPGRADES[UpgradeType.SCANNER][level - 1]?.value || 1;
  const getMoveDelay = (level: number) => UPGRADES[UpgradeType.EXOSKELETON][level - 1]?.value || MOVE_DELAY_MS;

  // Objective Guide Logic
  const getObjectiveText = () => {
    if (stats.currentOxygen < stats.maxOxygen * 0.25 && playerPos.y > 0) return "警告: 氧气不足！立即返回地表！";
    if (stats.inventory.length >= stats.maxInventory) return "背包已满 - 返回地表出售";
    if (playerPos.y === 0 && stats.inventory.length > 0) return "前往交易所 (左侧) 出售货物";
    if (playerPos.y === 0 && stats.currentOxygen < stats.maxOxygen) return "正在补充氧气...";
    if (playerPos.y === 0) return "向下挖掘！";
    return `继续探索 - 当前深度: ${playerPos.y}m`;
  };

  useEffect(() => {
    const initialGrid = generateGrid();
    const radius = getVisionRadius(INITIAL_STATS.scannerLevel);
    setGrid(revealArea(initialGrid, Math.floor(GRID_WIDTH / 2), 0, radius));
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
    setShowTutorial(true);
    audioService.enable();
  };

  useEffect(() => {
    if (!gameStarted || isShopOpen || isElevatorOpen || isGameOver || showTutorial || showSurfaceAnim || isElevatorMoving) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setStats(prev => {
        if (prev.currentOxygen <= 0) {
          setIsGameOver(true);
          return prev;
        }
        if (prev.currentOxygen < prev.maxOxygen * 0.2) {
          const now = Date.now();
          if (now - oxygenWarningRef.current > 1000) {
            audioService.playLowOxygen();
            oxygenWarningRef.current = now;
          }
        }
        if (playerPos.y === 0) {
          return { ...prev, currentOxygen: Math.min(prev.maxOxygen, prev.currentOxygen + OXYGEN_REGEN_RATE) };
        }
        const depthPenalty = playerPos.y * OXYGEN_DEPTH_PENALTY;
        const totalDrain = OXYGEN_PASSIVE_DRAIN + depthPenalty;
        return { ...prev, currentOxygen: prev.currentOxygen - totalDrain };
      });

      const now = Date.now();
      setFloatingTexts(prev => prev.filter(item => now - item.timestamp < 1500));

      // Dropped Item Cleanup
      setGrid(currentGrid => {
         let changed = false;
         const newGrid = currentGrid.map(b => {
             if (b.droppedItem && b.droppedItem.droppedAt && now - b.droppedItem.droppedAt > DROP_TIMEOUT_MS) {
                 changed = true;
                 return { ...b, droppedItem: undefined };
             }
             return b;
         });
         return changed ? newGrid : currentGrid;
      });

    }, 1000);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, isShopOpen, isElevatorOpen, isGameOver, playerPos.y, showTutorial, showSurfaceAnim, isElevatorMoving]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2000);
      audioService.playError();
      return () => clearTimeout(timer);
    }
  }, [message]);

  const addFloatingText = (x: number, y: number, text: string, subText: string, color: string) => {
    setFloatingTexts(prev => [
      ...prev,
      { id: Date.now() + Math.random(), x, y, text, subText, color, timestamp: Date.now() }
    ]);
  };

  const triggerFlyingItem = (x: number, y: number, type: BlockType) => {
    const xOffset = (x - playerPos.x) * 30; 
    const yOffset = (y - playerPos.y) * 40;
    const startX = (window.innerWidth / 2) + xOffset;
    const startY = (window.innerHeight / 2) + yOffset;
    const mineralInfo = MINERALS[type];
    
    setFlyingItems(prev => [
      ...prev,
      {
        id: Date.now(),
        startX,
        startY,
        color: mineralInfo.color === '#1a1a1a' ? 'border-gray-500' : 'border-white', 
        icon: <MineralIcon type={type} size={20} />
      }
    ]);

    setTimeout(() => {
      setFlyingItems(prev => prev.slice(1));
    }, 800);
  };

  const openShop = () => {
    setAppraisal("正在分析货物..."); 
    setIsShopOpen(true);
    if (stats.inventory.length > 0) {
       getMineralAppraisal(stats.inventory).then(text => setAppraisal(text));
    } else {
       setAppraisal("没有可出售的物品。");
    }
  };

  const handleElevatorTravel = (targetDepth: number) => {
    setIsElevatorOpen(false);
    setIsElevatorMoving(true); 
    setElevatorTargetDepth(targetDepth);
    audioService.playMove(); // Start sound

    setTimeout(() => {
      setPlayerPos(prev => ({ x: SURFACE_ELEVATOR_X, y: targetDepth })); // Always teleport to elevator X
      const radius = getVisionRadius(stats.scannerLevel);
      setGrid(prev => revealArea(prev, SURFACE_ELEVATOR_X, targetDepth, radius));
      setStats(prev => ({...prev, depth: Math.max(prev.depth, targetDepth)}));
      setIsElevatorMoving(false);
      setElevatorTargetDepth(null);
      audioService.playSuccess(); // Arrival sound
    }, 1500); // 1.5s Transition
  };

  const checkUnlockElevator = (y: number) => {
    // Only unlock if we are AT the elevator X position to avoid unlocking by just mining near depth
    if (Math.abs(playerPos.x - SURFACE_ELEVATOR_X) > 2) return;

    const foundDepth = ELEVATOR_DEPTHS.find(d => Math.abs(d - y) < 3); 
    if (foundDepth && !stats.unlockedElevators.includes(foundDepth)) {
       // Wait a brief moment to ensure we are settled
       setTimeout(() => {
         setMessage(`电梯层解锁: -${foundDepth}m`);
         audioService.playSuccess();
         setStats(prev => ({...prev, unlockedElevators: [...prev.unlockedElevators, foundDepth]}));
       }, 500);
    }
  };

  const handleDropItem = (itemId: string) => {
    const itemToDrop = stats.inventory.find(i => i.id === itemId);
    if (!itemToDrop) return;

    // Try to drop on current tile
    const playerIdx = getBlockIndex(playerPos.x, playerPos.y);
    if (grid[playerIdx] && grid[playerIdx].type === BlockType.EMPTY && !grid[playerIdx].droppedItem) {
       // Drop to world
       setGrid(prev => {
         const newGrid = [...prev];
         const dropped = { ...itemToDrop, droppedAt: Date.now() };
         newGrid[playerIdx] = { ...newGrid[playerIdx], droppedItem: dropped };
         return newGrid;
       });
       setStats(prev => ({
         ...prev,
         inventory: prev.inventory.filter(i => i.id !== itemId)
       }));
       audioService.playMove(); 
    } else {
      setStats(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i.id !== itemId)
      }));
    }
  };

  const handleMove = useCallback((dx: number, dy: number) => {
    if (isShopOpen || isElevatorOpen || isElevatorMoving || isGameOver || !gameStarted || showTutorial || isBusy || showSurfaceAnim) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) return;

    // Surface Movement Logic
    if (newY === 0) {
      setPlayerPos({ x: newX, y: 0 });
      setStats(prev => ({ ...prev, currentOxygen: prev.maxOxygen }));
      
      if (newX === SURFACE_SHOP_X) {
        openShop();
      } else if (newX === SURFACE_ELEVATOR_X) {
        if (stats.unlockedElevators.length > 0) {
            setIsElevatorOpen(true);
        } else {
            setMessage("需先在地下解锁电梯");
        }
      }

      if (playerPos.y > 0) {
        audioService.playSuccess();
        setShowSurfaceAnim(true);
      }
      return;
    }

    const targetBlock = checkCollision(newX, newY, grid);
    if (!targetBlock) return;

    // MOVE TO EMPTY BLOCK or ELEVATOR
    if (targetBlock.type === BlockType.EMPTY || targetBlock.type === BlockType.ELEVATOR) {
      setIsBusy(true);
      audioService.playMove();
      
      const moveDelay = getMoveDelay(stats.moveSpeedLevel);

      setTimeout(() => {
        setPlayerPos({ x: newX, y: newY });

        // Elevator Interaction (Underground)
        if (targetBlock.type === BlockType.ELEVATOR) {
           checkUnlockElevator(newY);
           setTimeout(() => {
              setIsElevatorOpen(true);
           }, 200);
        } else {
           // Also check if we are in the elevator station (empty blocks near elevator)
           if (ELEVATOR_DEPTHS.includes(newY) && Math.abs(newX - SURFACE_ELEVATOR_X) <= 2) {
             checkUnlockElevator(newY);
           }
        }
        
        // Pickup Logic
        setGrid(prevGrid => {
          const idx = getBlockIndex(newX, newY);
          const cell = prevGrid[idx];
          let updatedGrid = prevGrid;

          if (cell.droppedItem) {
             if (stats.inventory.length < stats.maxInventory) {
                // Pick up
                setStats(s => ({
                  ...s,
                  inventory: [...s.inventory, cell.droppedItem!]
                }));
                audioService.playCollect();
                
                updatedGrid = [...prevGrid];
                updatedGrid[idx] = { ...cell, droppedItem: undefined };
                
                triggerFlyingItem(newX, newY, cell.droppedItem.type);
             } else {
                setMessage("背包已满");
             }
          }

          const radius = getVisionRadius(stats.scannerLevel);
          return revealArea(updatedGrid, newX, newY, radius);
        });
        
        const newDepth = Math.max(stats.depth, newY);
        setStats(prev => ({...prev, depth: newDepth}));
        setMaxDepthThisRun(prev => Math.max(prev, newY));
        setIsBusy(false);
      }, moveDelay); 
      return;
    } 
    
    // --- Mining Logic ---
    if ((targetBlock.type as BlockType) !== BlockType.BEDROCK) {
      
      const targets: {x: number, y: number}[] = [{x: newX, y: newY}];
      const drillLvl = stats.drillLevel;

      if (drillLvl >= 2) targets.push({x: newX, y: newY + 1});
      if (drillLvl >= 3) targets.push({x: newX, y: newY + 2});
      if (drillLvl >= 4) { targets.push({x: newX + 1, y: newY}); targets.push({x: newX + 1, y: newY + 1}); }
      if (drillLvl >= 5) {
        for(let ox = -1; ox <= 1; ox++) {
          for(let oy = -1; oy <= 1; oy++) {
             if(ox === 0 && oy === 0) continue;
             targets.push({x: newX + ox, y: newY + oy});
          }
        }
      }

      const validBlocks = targets
        .filter(p => p.x >= 0 && p.x < GRID_WIDTH && p.y > 0 && p.y < GRID_HEIGHT)
        .map(p => ({pos: p, block: grid[getBlockIndex(p.x, p.y)]}))
        .filter(item => item.block && item.block.type !== BlockType.BEDROCK && item.block.type !== BlockType.EMPTY && item.block.type !== BlockType.ELEVATOR);
      
      if (validBlocks.length === 0) {
         audioService.playMiningHit();
         return;
      }

      const hardestBlock = validBlocks.reduce((prev, curr) => {
         const mPrev = MINERALS[prev.block.type];
         const mCurr = MINERALS[curr.block.type];
         return mCurr.minPickaxe > mPrev.minPickaxe ? curr : prev;
      }, validBlocks[0]);

      const mineralInfo = MINERALS[hardestBlock.block.type];
      
      if (stats.pickaxeLevel >= mineralInfo.minPickaxe) {
        
        setIsBusy(true);
        setMiningTarget({ x: newX, y: newY }); 
        
        const levelDiff = Math.max(0, stats.pickaxeLevel - mineralInfo.minPickaxe);
        const speedMultiplier = 1 + (levelDiff * 0.25); 
        const baseTime = Math.max(SWING_TIME_MS, mineralInfo.miningTime / speedMultiplier);
        const totalTime = baseTime + (validBlocks.length - 1) * (baseTime * 0.15);

        const hitDelay = SWING_TIME_MS * 0.45; 
        const firstHitTimer = setTimeout(() => audioService.playMiningHit(), hitDelay);
        const hitInterval = setInterval(() => {
          audioService.playMiningHit();
        }, SWING_TIME_MS);

        setTimeout(() => {
          clearTimeout(firstHitTimer);
          clearInterval(hitInterval); 
          
          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            let itemsAdded = 0;
            
            validBlocks.forEach(({pos, block}) => {
                const idx = getBlockIndex(pos.x, pos.y);
                if (newGrid[idx].type !== BlockType.EMPTY) {
                    const newItem = createMineralItem(block.type);
                    newGrid[idx] = { ...newGrid[idx], type: BlockType.EMPTY, revealed: true };
                    
                    if (newItem.value > 0) {
                        if (stats.inventory.length < stats.maxInventory) {
                             setStats(s => ({
                                ...s,
                                inventory: [...s.inventory, newItem]
                            }));
                            
                            let qualityColor = "text-white";
                            if (newItem.quality === QualityTier.HIGH) qualityColor = "text-blue-400";
                            if (newItem.quality === QualityTier.PRISTINE) qualityColor = "text-purple-400";
                            
                            setTimeout(() => {
                               addFloatingText(pos.x, pos.y, `${newItem.quality} ${newItem.name}`, `+$${newItem.value}`, qualityColor);
                               triggerFlyingItem(pos.x, pos.y, block.type);
                            }, Math.random() * 300);
                            itemsAdded++;

                        } else {
                            // DROP TO GROUND
                            const dropped = { ...newItem, droppedAt: Date.now() };
                            newGrid[idx].droppedItem = dropped;
                            setTimeout(() => {
                               addFloatingText(pos.x, pos.y, "背包已满", "掉落", "text-gray-400");
                            }, Math.random() * 300);
                        }
                    }
                }
            });

            audioService.playMiningBreak();
            setTimeout(() => {
                 if (itemsAdded > 0) audioService.playCollect();
            }, 800);

            const radius = getVisionRadius(stats.scannerLevel);
            return revealArea(newGrid, newX, newY, radius);
          });

          setPlayerPos({ x: newX, y: newY }); 
          const newDepth = Math.max(stats.depth, newY);
          setStats(prev => ({ ...prev, depth: newDepth }));
          setMaxDepthThisRun(prev => Math.max(prev, newY));
          
          // Also check elevator unlock if we mined into one
          if (Math.abs(newX - SURFACE_ELEVATOR_X) <= 2) {
             checkUnlockElevator(newY);
          }

          setIsBusy(false);
          setMiningTarget(null);

        }, totalTime); 

      } else {
        setMessage("镐等级不足！");
      }
    } else {
      audioService.playMiningHit(); 
    }
  }, [grid, playerPos, stats, isShopOpen, isElevatorOpen, isGameOver, gameStarted, showTutorial, isBusy, showSurfaceAnim, isElevatorMoving]);

  // Sync the latest handleMove to the ref, so the interval always uses the fresh version
  useEffect(() => {
    handleMoveRef.current = handleMove;
  }, [handleMove]);

  // Input Polling Loop (Optimized for continuous hold)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // We use a fixed interval that is NEVER cleared by dependencies
    // It checks the ref to see if it should act
    const inputLoop = setInterval(() => {
      if (keysPressed.current.size === 0) return;
      
      // We pass the "isBusy" check to handleMove, but we also check here to avoid 
      // pointless calls if we can access the state. 
      // Note: we can't easily access 'isBusy' state here without ref, but handleMove checks it.
      // To optimize: handleMoveRef.current checks isBusy internally.
      
      if (keysPressed.current.has('ArrowUp')) handleMoveRef.current(0, -1);
      else if (keysPressed.current.has('ArrowDown')) handleMoveRef.current(0, 1);
      else if (keysPressed.current.has('ArrowLeft')) handleMoveRef.current(-1, 0);
      else if (keysPressed.current.has('ArrowRight')) handleMoveRef.current(1, 0);
    }, 50); // 50ms polling

    return () => {
       window.removeEventListener('keydown', handleKeyDown);
       window.removeEventListener('keyup', handleKeyUp);
       clearInterval(inputLoop);
    };
  }, []); // Empty dependencies = runs once on mount

  const handleMobileInputStart = (key: string) => {
     keysPressed.current.add(key);
     // Immediate trigger for responsiveness
     if (!isBusy) {
        if (key === 'ArrowUp') handleMove(0, -1);
        if (key === 'ArrowDown') handleMove(0, 1);
        if (key === 'ArrowLeft') handleMove(-1, 0);
        if (key === 'ArrowRight') handleMove(1, 0);
     }
  };

  const handleMobileInputEnd = (key: string) => {
     keysPressed.current.delete(key);
  };

  const handleSell = () => {
    const totalValue = stats.inventory.reduce((acc, item) => acc + item.value, 0);
    setStats(prev => ({
      ...prev,
      money: prev.money + totalValue,
      inventory: []
    }));
    setAppraisal("交易完成。");
  };

  const handleUpgrade = (type: UpgradeType, level: number) => {
    const upgrades = UPGRADES[type];
    const upgradeInfo = upgrades[level - 1];
    
    if (stats.money >= upgradeInfo.cost) {
      setStats(prev => {
        const newStats = { ...prev, money: prev.money - upgradeInfo.cost };
        if (type === UpgradeType.PICKAXE) newStats.pickaxeLevel = level;
        if (type === UpgradeType.OXYGEN_TANK) newStats.maxOxygen = upgradeInfo.value;
        if (type === UpgradeType.CARGO_HOLD) newStats.maxInventory = upgradeInfo.value;
        if (type === UpgradeType.SCANNER) newStats.scannerLevel = level;
        if (type === UpgradeType.EXOSKELETON) newStats.moveSpeedLevel = level;
        if (type === UpgradeType.DRILL) newStats.drillLevel = level;
        return newStats;
      });
    }
  };

  const checkExposure = (x: number, y: number): boolean => {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const idx = getBlockIndex(nx, ny);
        if (idx !== -1) {
            // Elevator counts as exposure? Yes.
            if (grid[idx].type === BlockType.EMPTY || grid[idx].type === BlockType.ELEVATOR) return true;
        } else if (ny < 0) {
            return true;
        }
    }
    return false;
  };

  const viewportStart = Math.max(0, playerPos.y - Math.floor(VIEWPORT_HEIGHT / 2));
  const viewportEnd = Math.min(GRID_HEIGHT, viewportStart + VIEWPORT_HEIGHT);
  const visibleRows = Array.from({ length: viewportEnd - viewportStart }, (_, i) => i + viewportStart);

  if (isGameOver) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-8 max-w-md bg-red-900/20 border border-red-500 rounded-2xl backdrop-blur-lg animate-in fade-in zoom-in duration-500">
          <h1 className="text-5xl font-bold text-red-500 mb-4">严重故障</h1>
          <p className="text-xl mb-6">你的氧气在 {playerPos.y} 米深处耗尽了。</p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw />
            重生
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0c0805] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rocky-wall.png')]"></div>
        <div className="z-10 text-center max-w-lg px-6">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-600 mb-6 drop-shadow-lg">
            双子星深渊矿工
          </h1>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            挖掘无尽的深渊。管理氧气，寻找稀有同位素，让 
            <span className="text-sky-400 font-bold"> Gemini AI </span> 
            估算你的财富。
          </p>
          <button 
            onClick={handleStartGame}
            className="group relative px-8 py-4 bg-orange-600 font-bold text-xl rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              启动钻头 <ArrowDown className="group-hover:translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0c0805] relative flex justify-center overflow-hidden select-none">
      
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-20 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(255,0,0,0.4)_100%)] ${stats.currentOxygen < stats.maxOxygen * 0.2 ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

      <HUD 
        stats={stats} 
        message={message} 
        onToggleTutorial={() => setShowTutorial(true)}
        objectiveText={getObjectiveText()}
      />
      
      <InventoryDisplay inventory={stats.inventory} onDropItem={handleDropItem} />
      <FlyingItemOverlay items={flyingItems} />

      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {showSurfaceAnim && (
        <SurfaceTransition 
          depthReached={maxDepthThisRun} 
          itemsCollected={stats.inventory.length}
          onComplete={() => {
            setShowSurfaceAnim(false);
            setMaxDepthThisRun(0);
          }}
        />
      )}

      {isElevatorMoving && (
        <ElevatorTransition fromDepth={playerPos.y} toDepth={elevatorTargetDepth || 0} />
      )}

      {isShopOpen && (
        <ShopModal 
          stats={stats} 
          onClose={() => setIsShopOpen(false)} 
          onSell={handleSell}
          onUpgrade={handleUpgrade}
          appraisalText={appraisal}
        />
      )}

      {isElevatorOpen && (
        <ElevatorModal 
          unlockedDepths={stats.unlockedElevators} 
          currentDepth={playerPos.y}
          onClose={() => setIsElevatorOpen(false)}
          onTravel={handleElevatorTravel}
        />
      )}

      {/* Game Area */}
      <div className="relative w-full max-w-3xl h-full bg-[#0c0805] shadow-2xl border-x border-[#2a1d15] flex items-center">
        
        {/* Sky Background */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-sky-400 pointer-events-none transition-transform duration-300 z-0"
          style={{ 
            transform: `translateY(${-playerPos.y * 60}px)`,
            height: '600px', 
            opacity: Math.max(0, 1 - (playerPos.y / 10)) 
          }} 
        />

        <div 
          className="w-full grid transition-transform duration-200 ease-out relative z-10"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
            gap: '0px',
            alignContent: 'center'
          }}
        >
          {/* Surface Base moved INSIDE grid for correct alignment */}
          {viewportStart === 0 && (
            <SurfaceBase 
               onOpenShop={() => {}} 
               onUseElevator={() => {}}
               unlockedElevators={stats.unlockedElevators}
            />
          )}

          {visibleRows.map(y => (
            <React.Fragment key={y}>
              {Array.from({ length: GRID_WIDTH }, (_, x) => {
                const idx = getBlockIndex(x, y);
                const block = grid[idx] || { type: BlockType.BEDROCK, health: 100, revealed: true };
                const isPlayer = x === playerPos.x && y === playerPos.y;
                const isBeingMined = miningTarget?.x === x && miningTarget?.y === y; 
                const isPlayerMining = isPlayer && miningTarget !== null;
                const isExposed = checkExposure(x, y);

                return (
                  <Tile 
                    key={`${x}-${y}`} 
                    x={x} 
                    y={y} 
                    block={block} 
                    isPlayer={isPlayer}
                    isMining={isPlayerMining}
                    isBeingMined={isBeingMined}
                    isExposed={isExposed}
                  />
                );
              })}
            </React.Fragment>
          ))}

           <FloatingTextOverlay 
             items={floatingTexts.filter(t => t.y >= viewportStart && t.y <= viewportEnd)} 
             viewportStart={viewportStart}
             visibleRowCount={visibleRows.length}
           />

        </div>
      </div>

      {/* Mobile Controls - Updated for Hold-to-Move */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 md:hidden opacity-80 z-40">
        <button 
          className="p-4 bg-gray-800/80 rounded-lg text-white active:bg-gray-700 select-none touch-none" 
          onPointerDown={() => handleMobileInputStart('ArrowUp')}
          onPointerUp={() => handleMobileInputEnd('ArrowUp')}
          onPointerLeave={() => handleMobileInputEnd('ArrowUp')}
        >
           <ArrowUp />
        </button>
        <div className="flex gap-2">
          <button 
             className="p-4 bg-gray-800/80 rounded-lg text-white active:bg-gray-700 select-none touch-none"
             onPointerDown={() => handleMobileInputStart('ArrowLeft')}
             onPointerUp={() => handleMobileInputEnd('ArrowLeft')}
             onPointerLeave={() => handleMobileInputEnd('ArrowLeft')}
          >
             <ArrowLeft />
          </button>
          <button 
             className="p-4 bg-gray-800/80 rounded-lg text-white active:bg-gray-700 select-none touch-none"
             onPointerDown={() => handleMobileInputStart('ArrowDown')}
             onPointerUp={() => handleMobileInputEnd('ArrowDown')}
             onPointerLeave={() => handleMobileInputEnd('ArrowDown')}
          >
             <ArrowDown />
          </button>
          <button 
             className="p-4 bg-gray-800/80 rounded-lg text-white active:bg-gray-700 select-none touch-none"
             onPointerDown={() => handleMobileInputStart('ArrowRight')}
             onPointerUp={() => handleMobileInputEnd('ArrowRight')}
             onPointerLeave={() => handleMobileInputEnd('ArrowRight')}
          >
             <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
