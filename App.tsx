import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GameState, GameData, Player, Monster, TileType, Position, ItemType, PlayerClass, Item, Tile, Direction, LegacyData, UpgradeType, Relic, RelicType, Projectile } from './types';
import { useGameInput } from './hooks/useGameInput';
import { generateDungeon } from './services/dungeonService';
import { generateLevelContent } from './services/proceduralGenerationService';
import { legacyService } from './services/legacyService';
import { pathfindingService } from './services/pathfindingService.ts';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import GameContainer from './components/GameContainer';
import LeaderboardScreen from './components/LeaderboardScreen';
import ArmoryScreen from './components/ArmoryScreen';
import RelicCompendiumScreen from './components/RelicCompendiumScreen';
import HowToPlayScreen from './components/HowToPlayScreen';
import { audioService } from './services/audioService';
import { RELICS_CONFIG } from './constants';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [dungeonLevel, setDungeonLevel] = useState(1);
    const [levelTheme, setLevelTheme] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    
    // Check for touch support once
    const isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const [isDpadVisible, setIsDpadVisible] = useState(isMobileDevice);
    const [isMinimapVisible, setIsMinimapVisible] = useState(true);

    const [dpadPosition, setDpadPosition] = useState<'left' | 'right'>('right');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = React.useRef<number | null>(null);
    
    // Meta-progression state
    const [legacyData, setLegacyData] = useState<LegacyData | null>(null);
    const [shardsThisRun, setShardsThisRun] = useState(0);

    // Gameplay state
    const [currentPath, setCurrentPath] = useState<Position[]>([]);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);

    const requiredKeys = gameData ? 1 + Math.floor((dungeonLevel - 1) / 5) : 1;

    useEffect(() => {
        // Load legacy data on initial app load
        setLegacyData(legacyService.loadLegacyData());
    }, []);

    useEffect(() => {
        if (gameState === GameState.PLAYING) {
            timerRef.current = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState]);

    useEffect(() => {
        if (gameState === GameState.PLAYING) {
            if (dungeonLevel % 5 === 0) {
                audioService.playBossMusic();
            } else {
                audioService.playMusic();
            }
        } else {
            audioService.stopMusic();
        }
    }, [gameState, dungeonLevel]);

    const handleToggleMute = () => {
        const muted = audioService.toggleMute();
        setIsMuted(muted);
    };
    
    const handleToggleDpad = () => {
        setIsDpadVisible(prev => !prev);
    };

    const handleToggleMinimap = () => {
        setIsMinimapVisible(prev => !prev);
    };

    const addMessage = useCallback((msg: string) => {
        setMessages(prev => [...prev.slice(-10), msg]);
    }, []);
    
    const gameDataRef = React.useRef(gameData);
    useEffect(() => {
        gameDataRef.current = gameData;
    }, [gameData]);

    const submitScore = useCallback(async (player: Player) => {
        try {
            await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: player.name,
                    floor: dungeonLevel,
                    time: elapsedTime,
                }),
            });
        } catch (error) {
            console.error('Failed to submit score:', error);
            addMessage("Error: Could not submit score to leaderboard.");
        }
    }, [dungeonLevel, elapsedTime, addMessage]);
    
    const handleGameOver = useCallback((message: string) => {
        setCurrentPath([]);
        setProjectiles([]);
        audioService.play('gameOver');
        setGameState(GameState.GAME_OVER);
        addMessage(message);
        if (gameDataRef.current?.player) {
            submitScore(gameDataRef.current.player);
        }

        if (legacyData) {
            const floorBonus = dungeonLevel * 10;
            const totalShardsGained = shardsThisRun + floorBonus;
            const updatedLegacyData = {
                ...legacyData,
                soulShards: legacyData.soulShards + totalShardsGained,
            };
            legacyService.saveLegacyData(updatedLegacyData);
            setLegacyData(updatedLegacyData);
            addMessage(`You collected ${totalShardsGained} Soul Shards for your legacy.`);
        }
        setIsProcessingTurn(false);
    }, [addMessage, submitScore, legacyData, dungeonLevel, shardsThisRun]);

    const handleXpGain = useCallback((player: Player, xpGained: number): Player => {
        let updatedPlayer = { ...player, xp: player.xp + xpGained };
        if (xpGained > 0) {
            addMessage(`You gained ${xpGained} XP.`);
        }

        while (updatedPlayer.xp >= updatedPlayer.xpToNextLevel) {
            audioService.play('levelUp');
            updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
            updatedPlayer.level += 1;
            
            if (updatedPlayer.playerClass === PlayerClass.WARRIOR) {
                updatedPlayer.attack += 2;
                updatedPlayer.defense += 1;
            } else if (updatedPlayer.playerClass === PlayerClass.GUARDIAN) {
                updatedPlayer.attack += 1;
                updatedPlayer.defense += 2;
            } else { // Mage
                updatedPlayer.attack += 2; // Mages get stronger attack
                // No defense increase for mages
            }
            
            const hpIncrease = 10;
            updatedPlayer.maxHp += hpIncrease;
            const healAmount = Math.floor(updatedPlayer.maxHp * 0.25);
            updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + healAmount);
            
            addMessage(`LEVEL UP! You are now level ${updatedPlayer.level}. Stats increased!`);
            updatedPlayer.xpToNextLevel = Math.floor(updatedPlayer.xpToNextLevel * 1.5);
        }
        return updatedPlayer;
    }, [addMessage]);

    const updateFogOfWar = useCallback((center: Position, map: GameData['map']) => {
        const visionRadius = 8;
        const newMap = map.map(row => row.map(tile => ({...tile, visible: false})));
        const MAP_HEIGHT = newMap.length;
        const MAP_WIDTH = newMap[0]?.length || 0;

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const dx = x - center.x;
                const dy = y - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < visionRadius) {
                    let isBlocked = false;
                    const line = pathfindingService.getLine(center, {x, y});
                    for (const point of line) {
                        if (point.x === x && point.y === y) continue;
                        if(newMap[point.y]?.[point.x]?.type === TileType.WALL) {
                            isBlocked = true;
                            break;
                        }
                    }
                    if(!isBlocked) {
                         newMap[y][x].visible = true;
                         newMap[y][x].explored = true;
                    }
                }
            }
        }
        return newMap;
    }, []);
    
    const startNewGame = useCallback((playerClass: PlayerClass, playerName: string) => {
        if (!legacyData) return;
        
        setGameState(GameState.GENERATING);
        setDungeonLevel(1);
        setMessages([]);
        setElapsedTime(0);
        setShardsThisRun(0);
        setCurrentPath([]);
        setProjectiles([]);
        setIsProcessingTurn(false);

        const legacyBonuses = legacyService.getUpgradeBonuses(legacyData.upgrades);

        let baseStats;
        if (playerClass === PlayerClass.WARRIOR) {
            baseStats = { attack: 5, defense: 2, hp: 80 };
        } else if (playerClass === PlayerClass.GUARDIAN) {
            baseStats = { attack: 2, defense: 5, hp: 120 };
        } else { // MAGE
            baseStats = { attack: 4, defense: 1, hp: 70 };
        }

        const initialStats = {
            attack: baseStats.attack + legacyBonuses.attack,
            defense: baseStats.defense + legacyBonuses.defense,
            hp: baseStats.hp + legacyBonuses.maxHp,
            maxHp: baseStats.hp + legacyBonuses.maxHp,
            steps: 250 + legacyBonuses.steps,
        };
        
        addMessage(`Welcome, ${playerName}. Your journey begins.`);
        if (legacyBonuses.attack > 0 || legacyBonuses.defense > 0 || legacyBonuses.maxHp > 0 || legacyBonuses.steps > 0) {
            addMessage("The spirits of your ancestors lend you their strength.");
        }

        const { theme, monsters: generatedMonsters } = generateLevelContent(false);
        setLevelTheme(theme);
        addMessage(`You enter a level known as: ${theme}`);
        
        let { map, monsters, stairs, items, startingPosition } = generateDungeon(1, generatedMonsters, false);
        
        const player: Player = {
            name: playerName,
            ...startingPosition,
            ...initialStats,
            playerClass,
            keysHeld: 0,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            relics: [],
            stepsSinceLastRegen: 0,
        };

        map = updateFogOfWar(player, map);

        setGameData({ map, player, monsters, stairs, items });
        setGameState(GameState.PLAYING);
    }, [addMessage, updateFogOfWar, legacyData]);
    
    const onMonsterDefeat = useCallback((player: Player, monster: Monster): { updatedPlayer: Player; shardsGained: number } => {
        const hasAmulet = player.relics.some(r => r.id === 'AMULET_OF_KNOWLEDGE');
        const hasCatcher = player.relics.some(r => r.id === 'SOUL_CATCHER');

        let xpGained = Math.floor(10 + monster.maxHp / 4 + monster.attack * 2);
        if (hasAmulet) xpGained *= 2;
        
        const updatedPlayer = handleXpGain(player, xpGained);

        let shardsGained = 1 + Math.floor(monster.maxHp / 15);
        if (hasCatcher) shardsGained = Math.floor(shardsGained * 1.5);
        
        return { updatedPlayer, shardsGained };
    }, [handleXpGain]);

    const processTurn = useCallback((playerState: Player, monsterState: Monster[], itemState: Item[], newMap?: Tile[][]) => {
        if (playerState.steps < 0) {
             handleGameOver("You ran out of energy and collapsed.");
             return;
        }

        let playerAfterTurn = {...playerState};
        const currentMap = newMap || gameDataRef.current!.map;

        const livingMonsters = monsterState.filter(m => m.hp > 0);

        const monstersAfterMove = livingMonsters.map(monster => {
            const dx = playerState.x - monster.x;
            const dy = playerState.y - monster.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            let newMonsterPos = { x: monster.x, y: monster.y };

            if (distance < 8) {
                if (distance >= 1.5) { // Monster moves if not adjacent
                    const path = pathfindingService.findPath(currentMap, monster, playerState);
                    if (path.length > 0) {
                        const nextStep = path[0];
                        const isMonsterAtPos = monsterState.some(m => m.id !== monster.id && m.x === nextStep.x && m.y === nextStep.y);
                        if (!isMonsterAtPos) {
                           newMonsterPos = nextStep;
                        }
                    }
                }
            }
            return { ...monster, ...newMonsterPos };
        });

        const monstersStillAlive = [];

        for(const monster of monstersAfterMove) {
            const dx = playerAfterTurn.x - monster.x;
            const dy = playerAfterTurn.y - monster.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1.5) { // Monster attacks if adjacent
                const monsterDamage = Math.max(1, monster.attack - playerAfterTurn.defense);
                if (monsterDamage > 0) {
                    playerAfterTurn.hp -= monsterDamage;
                    addMessage(`The ${monster.name} attacks you for ${monsterDamage} damage.`);
                    audioService.play('damage');
                    setCurrentPath([]); // Interrupt pathfinding on taking damage
                } else {
                    addMessage(`The ${monster.name}'s attack glances off your armor.`);
                }

                // Thorns Shield Relic Effect
                const hasThorns = playerAfterTurn.relics.some(r => r.id === 'THORNS_SHIELD');
                if (hasThorns && monsterDamage > 0) {
                    const thornsDamage = Math.max(1, Math.floor(playerAfterTurn.defense / 3));
                    monster.hp -= thornsDamage;
                    addMessage(`Your [Thorns Shield] damages the ${monster.name} for ${thornsDamage}.`);

                    if (monster.hp <= 0) {
                        addMessage(`The ${monster.name} was defeated by your spikes!`);
                        const { updatedPlayer, shardsGained } = onMonsterDefeat(playerAfterTurn, monster);
                        playerAfterTurn = updatedPlayer;
                        setShardsThisRun(prev => prev + shardsGained);
                        continue; // Skip adding this monster to the next turn's list
                    }
                }
            }
            monstersStillAlive.push(monster);
        }

        const mapAfterFog = updateFogOfWar(playerAfterTurn, currentMap);

        setGameData({
            player: playerAfterTurn,
            monsters: monstersStillAlive,
            items: itemState,
            map: mapAfterFog,
            stairs: gameDataRef.current!.stairs,
        });

        if (playerAfterTurn.hp <= 0) {
            handleGameOver("You have been defeated.");
        } else {
            setIsProcessingTurn(false);
        }
    }, [addMessage, updateFogOfWar, handleGameOver, onMonsterDefeat]);

    const advanceLevel = useCallback(() => {
        audioService.play('stairs');
        const nextLevel = dungeonLevel + 1;
        const isBossLevel = nextLevel % 5 === 0;

        setCurrentPath([]);
        setProjectiles([]);
        setDungeonLevel(nextLevel);
        setGameState(GameState.GENERATING);
        addMessage(`You descend to floor ${nextLevel}...`);
        
        let currentPlayer = gameDataRef.current!.player;

        if (isBossLevel) {
            addMessage("You feel a dreadful presence...");
        }
        const { theme, monsters: generatedMonsters } = generateLevelContent(isBossLevel);
        setLevelTheme(theme);
        addMessage(`This place feels different... like a ${theme}`);
        let { map, monsters, stairs, items, startingPosition } = generateDungeon(nextLevel, generatedMonsters, isBossLevel);
        
        const legacyBonuses = legacyData ? legacyService.getUpgradeBonuses(legacyData.upgrades) : { steps: 0 };
        const baseSteps = 250;
        const stepBonusPerFiveLevels = Math.floor(dungeonLevel / 5) * 25;

        let newPlayer = {
             ...currentPlayer,
             ...startingPosition,
             keysHeld: 0,
             steps: baseSteps + stepBonusPerFiveLevels + legacyBonuses.steps,
        };
        
        const healAmount = Math.floor(newPlayer.maxHp * 0.5);
        newPlayer.hp = Math.min(newPlayer.maxHp, currentPlayer.hp + healAmount);
        
        addMessage(`Your energy is restored for the new challenge.`);
        
        const xpBonus = 50 * dungeonLevel;
        newPlayer = handleXpGain(newPlayer, xpBonus);


        map = updateFogOfWar(newPlayer, map);
        setGameData({ map, player: newPlayer, monsters, stairs, items });
        setGameState(GameState.PLAYING);
        setIsProcessingTurn(false);
    }, [dungeonLevel, addMessage, updateFogOfWar, handleXpGain, legacyData]);
    
    const handleRelicStepEffects = useCallback((player: Player): Player => {
        let updatedPlayer = {...player};
        const hasGolemHeart = player.relics.some(r => r.id === 'GOLEM_HEART');

        if(hasGolemHeart) {
            updatedPlayer.stepsSinceLastRegen += 1;
            if (updatedPlayer.stepsSinceLastRegen >= 20) {
                updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + 1);
                updatedPlayer.stepsSinceLastRegen = 0;
                addMessage("[Golem Heart] You regenerate 1 HP.");
            }
        }
        return updatedPlayer;
    }, [addMessage]);

    const handlePlayerMove = useCallback((dx: number, dy: number) => {
        if (!gameDataRef.current || gameState !== GameState.PLAYING || isProcessingTurn) return;
        
        setIsProcessingTurn(true);
        
        let { player, map, monsters, stairs, items } = gameDataRef.current;
        const newX = player.x + dx;
        const newY = player.y + dy;
        const MAP_WIDTH = map[0].length;
        const MAP_HEIGHT = map.length;

        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT || map[newY][newX].type === TileType.WALL) {
            setCurrentPath([]); // Stop if trying to move into a wall
            setIsProcessingTurn(false);
            return;
        }
        
        let playerForNextTurn = { ...player, steps: player.steps - 1 };

        const monsterAtNewPos = monsters.find(m => m.x === newX && m.y === newY);
        if (monsterAtNewPos) {
            setCurrentPath([]); // Stop pathfinding to engage in combat
            
            // Mages cannot attack in melee
            if (playerForNextTurn.playerClass === PlayerClass.MAGE) {
                addMessage("You are too close to attack. Reposition yourself!");
                setIsProcessingTurn(false);
                return;
            }

            const hasVampiricFang = playerForNextTurn.relics.some(r => r.id === 'VAMPIRIC_FANG');
            const playerDamage = Math.max(1, playerForNextTurn.attack - 0);
            const newMonsterHp = monsterAtNewPos.hp - playerDamage;
            addMessage(`You attack the ${monsterAtNewPos.name} for ${playerDamage} damage.`);
            audioService.play('attack');
            
            if (hasVampiricFang) {
                playerForNextTurn.hp = Math.min(playerForNextTurn.maxHp, playerForNextTurn.hp + 1);
                addMessage(`[Vampiric Fang] You drain 1 HP.`);
            }
            
            const damagedMonsters = monsters.map(m => m.id === monsterAtNewPos.id ? {...m, hp: newMonsterHp} : m);
            let mapForNextTurn;

            if (newMonsterHp <= 0) {
                addMessage(`You defeated the ${monsterAtNewPos.name}!`);
                const { updatedPlayer, shardsGained } = onMonsterDefeat(playerForNextTurn, monsterAtNewPos);
                playerForNextTurn = updatedPlayer;
                addMessage(`You collected ${shardsGained} Soul Shards.`);
                setShardsThisRun(prev => prev + shardsGained);

                if (monsterAtNewPos.isBoss) {
                    addMessage("The way forward is revealed!");
                    const { map, stairs } = gameDataRef.current!;
                    const mapCopy = map.map(row => row.map(tile => ({...tile})));
                    mapCopy[stairs.y][stairs.x].type = TileType.STAIRS;
                    mapForNextTurn = mapCopy;
                }
            }
            const livingMonsters = damagedMonsters.filter(m => m.hp > 0);
            processTurn(playerForNextTurn, livingMonsters, items, mapForNextTurn);
            return;
        }

        if (map[newY][newX].type === TileType.LOCKED_DOOR) {
            setCurrentPath([]); // Stop pathfinding at doors
            if (player.keysHeld >= requiredKeys) {
                addMessage(`You use ${requiredKeys} key(s) and the door unlocks.`);
                audioService.play('stairs');
                const newMap = map.map(row => row.map(tile => ({...tile})));
                newMap[newY][newX].type = TileType.FLOOR;
                playerForNextTurn = { ...playerForNextTurn, x: newX, y: newY, keysHeld: 0 };
                playerForNextTurn = handleRelicStepEffects(playerForNextTurn);
                processTurn(playerForNextTurn, monsters, items, newMap);
            } else {
                addMessage(`The door is locked. It requires ${requiredKeys} key(s).`);
                setIsProcessingTurn(false);
            }
            return;
        }
        
        if (map[newY][newX].type === TileType.STAIRS) {
            if (stairs.x === newX && stairs.y === newY) {
                advanceLevel();
                return;
            }
        }
        
        playerForNextTurn = { ...playerForNextTurn, x: newX, y: newY };
        let newItems = [...items];
        const itemIndex = items.findIndex(i => i.position.x === newX && i.position.y === newY);

        if (itemIndex > -1) {
            const item = items[itemIndex];
            audioService.play('pickup');
            addMessage(`You found: ${item.name}.`);
            
            if (item.type === ItemType.KEY) {
                playerForNextTurn.keysHeld += 1;
                const xpForKey = 25 * dungeonLevel;
                playerForNextTurn = handleXpGain(playerForNextTurn, xpForKey);
            } else if (item.type === ItemType.HEALTH_POTION) {
                const healAmount = Math.floor(playerForNextTurn.maxHp * (item.value / 100));
                playerForNextTurn.hp = Math.min(playerForNextTurn.maxHp, playerForNextTurn.hp + healAmount);
            } else if (item.type === ItemType.ATTACK_BOOST) {
                playerForNextTurn.attack += item.value;
            } else if (item.type === ItemType.DEFENSE_BOOST) {
                playerForNextTurn.defense += item.value;
            } else if (item.type === ItemType.STEP_BOOST) {
                playerForNextTurn.steps += item.value;
            } else if (item.type === ItemType.RELIC) {
                const heldRelicIds = new Set(playerForNextTurn.relics.map(r => r.id));
                const availableRelics = (Object.keys(RELICS_CONFIG) as RelicType[]).filter(id => !heldRelicIds.has(id));

                if (availableRelics.length > 0) {
                    const newRelicId = availableRelics[Math.floor(Math.random() * availableRelics.length)];
                    const newRelic = RELICS_CONFIG[newRelicId];
                    playerForNextTurn.relics.push(newRelic);
                    addMessage(`You touch the altar. A new power infuses you...`);
                    addMessage(`[${newRelic.name}]: ${newRelic.description}`);
                } else {
                    addMessage("The altar is dormant. You have already absorbed all available power.");
                }
            }
            newItems.splice(itemIndex, 1);
        }
        
        playerForNextTurn = handleRelicStepEffects(playerForNextTurn);
        processTurn(playerForNextTurn, monsters, newItems);
    }, [gameState, processTurn, advanceLevel, addMessage, handleXpGain, requiredKeys, dungeonLevel, onMonsterDefeat, handleRelicStepEffects, isProcessingTurn]);
    
    const hasLineOfSight = useCallback((start: Position, end: Position, map: Tile[][]): boolean => {
        const line = pathfindingService.getLine(start, end);
        for (const point of line) {
            if (point.x === end.x && point.y === end.y) continue;
            if (map[point.y]?.[point.x]?.type === TileType.WALL) {
                return false;
            }
        }
        return true;
    }, []);

    const fireProjectile = useCallback((targetMonster: Monster) => {
        if (!gameDataRef.current || isProcessingTurn) return;
        const { player, monsters, items } = gameDataRef.current;

        setIsProcessingTurn(true);
        setCurrentPath([]);

        const newProjectile: Projectile = {
            id: `proj_${Date.now()}`,
            start: { x: player.x, y: player.y },
            end: { x: targetMonster.x, y: targetMonster.y },
            targetId: targetMonster.id,
        };
        audioService.play('fireball');
        addMessage("You launch a magic bolt!");
        setProjectiles(prev => [...prev, newProjectile]);

        const playerForNextTurn = { ...player, steps: player.steps - 1 };
        processTurn(playerForNextTurn, monsters, items);
    }, [isProcessingTurn, addMessage, processTurn]);

    const handleProjectileHit = useCallback((projectileId: string) => {
        const projectile = projectiles.find(p => p.id === projectileId);
        if (!projectile || !gameDataRef.current) return;
        
        let { player, monsters, items } = gameDataRef.current;
        const targetMonster = monsters.find(m => m.id === projectile.targetId);

        if (targetMonster) {
            const hasVampiricFang = player.relics.some(r => r.id === 'VAMPIRIC_FANG');
            const playerDamage = Math.max(1, player.attack - 0);
            const newMonsterHp = targetMonster.hp - playerDamage;
            addMessage(`Your magic bolt hits the ${targetMonster.name} for ${playerDamage} damage.`);
            audioService.play('damage');

            if (hasVampiricFang) {
                player.hp = Math.min(player.maxHp, player.hp + 1);
                addMessage(`[Vampiric Fang] You drain 1 HP.`);
            }

            const damagedMonsters = monsters.map(m => m.id === targetMonster.id ? {...m, hp: newMonsterHp} : m);
            let mapForNextTurn = gameDataRef.current.map;

            if (newMonsterHp <= 0) {
                addMessage(`You defeated the ${targetMonster.name}!`);
                const { updatedPlayer, shardsGained } = onMonsterDefeat(player, targetMonster);
                player = updatedPlayer;
                addMessage(`You collected ${shardsGained} Soul Shards.`);
                setShardsThisRun(prev => prev + shardsGained);

                 if (targetMonster.isBoss) {
                    addMessage("The way forward is revealed!");
                    const { map, stairs } = gameDataRef.current!;
                    const mapCopy = map.map(row => row.map(tile => ({...tile})));
                    mapCopy[stairs.y][stairs.x].type = TileType.STAIRS;
                    mapForNextTurn = mapCopy;
                }
            }

            const livingMonsters = damagedMonsters.filter(m => m.hp > 0);
            
            // Update game state without processing monster turn, as that happened when the projectile was fired
            const mapAfterFog = updateFogOfWar(player, mapForNextTurn);
            setGameData({ ...gameDataRef.current, player, monsters: livingMonsters, map: mapAfterFog });
             if (player.hp <= 0) {
                handleGameOver("You have been defeated.");
            }
        }
        
        // Remove projectile after it hits
        setProjectiles(prev => prev.filter(p => p.id !== projectileId));

    }, [projectiles, addMessage, onMonsterDefeat, updateFogOfWar, handleGameOver]);

    const handleDirectionalControl = useCallback((dir: Direction) => {
        if (isProcessingTurn) return;
        setCurrentPath([]); // Interrupt any ongoing pathfinding
        let dx = 0, dy = 0;
        if (dir === 'UP') dy = -1;
        else if (dir === 'DOWN') dy = 1;
        else if (dir === 'LEFT') dx = -1;
        else if (dir === 'RIGHT') dx = 1;
        if (dx !== 0 || dy !== 0) handlePlayerMove(dx, dy);
    }, [handlePlayerMove, isProcessingTurn]);
    
    const handleTileClick = useCallback((pos: Position) => {
        if (!gameDataRef.current || gameState !== GameState.PLAYING || isProcessingTurn) return;
        const { player, map, monsters } = gameDataRef.current;

        if (map[pos.y]?.[pos.x]?.type === TileType.WALL) return;
        
        const targetMonster = monsters.find(m => m.x === pos.x && m.y === pos.y);

        if (player.playerClass === PlayerClass.MAGE && targetMonster) {
            if (hasLineOfSight(player, targetMonster, map)) {
                 fireProjectile(targetMonster);
            } else {
                addMessage("No clear shot!");
            }
            return;
        }

        // For non-mages or clicking on empty tiles
        if (targetMonster) {
            const dx = targetMonster.x - player.x;
            const dy = targetMonster.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1.5) {
                handlePlayerMove(dx, dy);
                return;
            }
        }
        
        const path = pathfindingService.findPath(map, player, pos);
        setCurrentPath(path);
        
    }, [gameState, handlePlayerMove, isProcessingTurn, hasLineOfSight, addMessage, fireProjectile]);

    useEffect(() => {
        if (gameState !== GameState.PLAYING || currentPath.length === 0 || !gameData || isProcessingTurn) {
            return;
        }

        const player = gameData.player;
        const nextStep = currentPath[0];

        if (player.x === nextStep.x && player.y === nextStep.y) {
            const timerId = setTimeout(() => setCurrentPath(p => p.slice(1)), 30); 
            return () => clearTimeout(timerId);
        }

        const dx = nextStep.x - player.x;
        const dy = nextStep.y - player.y;

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) { // Path is diagonal or broken
             setCurrentPath([]); // Stop invalid paths
             return;
        }
        
        const timerId = setTimeout(() => handlePlayerMove(dx, dy), 60);
        return () => clearTimeout(timerId);

    }, [gameData, currentPath, gameState, handlePlayerMove, isProcessingTurn]);


    const handlePurchaseUpgrade = useCallback((upgradeId: UpgradeType) => {
        if (!legacyData) return;
        const currentLevel = legacyData.upgrades[upgradeId];
        const cost = legacyService.getUpgradeCost(upgradeId, currentLevel);
        
        if (legacyData.soulShards >= cost) {
            audioService.play('upgrade');
            const newLegacyData: LegacyData = {
                ...legacyData,
                soulShards: legacyData.soulShards - cost,
                upgrades: {
                    ...legacyData.upgrades,
                    [upgradeId]: currentLevel + 1,
                },
            };
            setLegacyData(newLegacyData);
            legacyService.saveLegacyData(newLegacyData);
        }
    }, [legacyData]);
    
    const handleQuickFire = useCallback(() => {
        if (!gameDataRef.current || isProcessingTurn || gameDataRef.current.player.playerClass !== PlayerClass.MAGE) return;

        const { player, monsters, map } = gameDataRef.current;
        
        const visibleTargets = monsters.filter(m => hasLineOfSight(player, m, map));

        if (visibleTargets.length === 0) {
            addMessage("No targets in line of sight.");
            return;
        }

        // Find the closest target
        let closestTarget = visibleTargets[0];
        let minDistance = Infinity;

        for (const target of visibleTargets) {
            const distance = Math.sqrt(Math.pow(player.x - target.x, 2) + Math.pow(player.y - target.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestTarget = target;
            }
        }
        
        fireProjectile(closestTarget);

    }, [isProcessingTurn, hasLineOfSight, addMessage, fireProjectile]);

    useGameInput({
        onDirection: handleDirectionalControl,
        onQuickFire: handleQuickFire,
    }, gameState === GameState.PLAYING);
    
    const restartGame = () => {
        setGameState(GameState.START_SCREEN);
        setGameData(null);
    };

    switch (gameState) {
        case GameState.START_SCREEN:
            return <StartScreen onStartGame={startNewGame} onShowLeaderboard={() => setGameState(GameState.LEADERBOARD)} onShowArmory={() => setGameState(GameState.ARMORY)} onShowRelicCompendium={() => setGameState(GameState.RELIC_COMPENDIUM)} onShowHowToPlay={() => setGameState(GameState.HOW_TO_PLAY)} />;
        case GameState.LEADERBOARD:
            return <LeaderboardScreen onBack={() => setGameState(GameState.START_SCREEN)} />;
        case GameState.RELIC_COMPENDIUM:
            return <RelicCompendiumScreen onBack={() => setGameState(GameState.START_SCREEN)} />;
        case GameState.HOW_TO_PLAY:
            return <HowToPlayScreen onBack={() => setGameState(GameState.START_SCREEN)} />;
        case GameState.ARMORY:
            if (!legacyData) return null; // or a loading screen
            return <ArmoryScreen onBack={() => setGameState(GameState.START_SCREEN)} legacyData={legacyData} onPurchase={handlePurchaseUpgrade} />;
        case GameState.GAME_OVER:
            const floorBonus = dungeonLevel * 10;
            return <GameOverScreen onRestart={restartGame} level={dungeonLevel} time={elapsedTime} shardsEarned={shardsThisRun + floorBonus} />;
        case GameState.GENERATING:
             return (
                <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
                    <h1 className="text-4xl font-bold text-sky-400 mb-4 animate-pulse">The gauntlet reshapes itself...</h1>
                    <p className="text-xl text-slate-300">The walls shift and reform...</p>
                </div>
            );
        case GameState.PLAYING:
            if (!gameData) return null;
            return (
                <main className="w-screen h-screen flex flex-col overflow-hidden bg-slate-900">
                    <GameContainer
                        gameData={gameData}
                        level={dungeonLevel}
                        messages={messages}
                        theme={levelTheme}
                        isMuted={isMuted}
                        onToggleMute={handleToggleMute}
                        isDpadVisible={isDpadVisible}
                        onToggleDpad={handleToggleDpad}
                        requiredKeys={requiredKeys}
                        elapsedTime={elapsedTime}
                        onDirection={handleDirectionalControl}
                        dpadPosition={dpadPosition}
                        onToggleDpadPosition={() => setDpadPosition(p => p === 'left' ? 'right' : 'left')}
                        shardsThisRun={shardsThisRun}
                        onTileClick={handleTileClick}
                        currentPath={currentPath}
                        projectiles={projectiles}
                        onProjectileHit={handleProjectileHit}
                        isMinimapVisible={isMinimapVisible}
                        onToggleMinimap={handleToggleMinimap}
                    />
                </main>
            );
        default:
            return null;
    }
};

export default App;