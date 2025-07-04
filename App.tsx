
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameData, Player, Monster, TileType, Position, ItemType, PlayerClass, Item, Tile, Direction, LegacyData, UpgradeType } from './types';
import { useGameInput } from './hooks/useGameInput';
import { generateDungeon } from './services/dungeonService';
import { generateLevelContent } from './services/proceduralGenerationService';
import { legacyService } from './services/legacyService';
import { pathfindingService } from './services/pathfindingService';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import GameContainer from './components/GameContainer';
import LeaderboardScreen from './components/LeaderboardScreen';
import ArmoryScreen from './components/ArmoryScreen';
import { audioService } from './services/audioService';

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

    const [dpadPosition, setDpadPosition] = useState<'left' | 'right'>('right');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = React.useRef<number | null>(null);
    
    // Meta-progression state
    const [legacyData, setLegacyData] = useState<LegacyData | null>(null);
    const [shardsThisRun, setShardsThisRun] = useState(0);

    // Pathfinding state
    const [currentPath, setCurrentPath] = useState<Position[]>([]);

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
            } else {
                updatedPlayer.attack += 1;
                updatedPlayer.defense += 2;
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
        const visionRadius = 6;
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
                    for (let i = 0; i < distance; i++) {
                        const checkX = Math.round(center.x + (dx/distance) * i);
                        const checkY = Math.round(center.y + (dy/distance) * i);
                        if(newMap[checkY]?.[checkX]?.type === TileType.WALL) {
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

        const legacyBonuses = legacyService.getUpgradeBonuses(legacyData.upgrades);

        const baseStats = playerClass === PlayerClass.WARRIOR
            ? { attack: 5, defense: 2, hp: 80 }
            : { attack: 2, defense: 5, hp: 120 };

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
        };

        map = updateFogOfWar(player, map);

        setGameData({ map, player, monsters, stairs, items });
        setGameState(GameState.PLAYING);
    }, [addMessage, updateFogOfWar, legacyData]);
    
    const processTurn = useCallback((playerState: Player, monsterState: Monster[], itemState: Item[], newMap?: Tile[][]) => {
        if (playerState.steps < 0) {
             handleGameOver("You ran out of energy and collapsed.");
             return;
        }

        const playerAfterMonsterAttacks = {...playerState};
        const currentMap = newMap || gameDataRef.current!.map;

        const updatedMonsters = monsterState.map(monster => {
            const dx = playerState.x - monster.x;
            const dy = playerState.y - monster.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            let newMonsterPos = { x: monster.x, y: monster.y };

            if (distance < 8) {
                if (distance < 1.5) {
                    const monsterDamage = Math.max(1, monster.attack - playerState.defense);
                    if (monsterDamage > 0) {
                        playerAfterMonsterAttacks.hp -= monsterDamage;
                        addMessage(`The ${monster.name} attacks you for ${monsterDamage} damage.`);
                        audioService.play('damage');
                        setCurrentPath([]); // Interrupt pathfinding on taking damage
                    } else {
                        addMessage(`The ${monster.name}'s attack glances off your armor.`);
                    }
                } else {
                    const nextPosOptions = [];
                    if (Math.sign(dx) !== 0) nextPosOptions.push({x: monster.x + Math.sign(dx), y: monster.y});
                    if (Math.sign(dy) !== 0) nextPosOptions.push({x: monster.x, y: monster.y + Math.sign(dy)});
                    nextPosOptions.sort(() => Math.random() - 0.5);

                    for (const pos of nextPosOptions) {
                        const isPlayerAtPos = playerState.x === pos.x && playerState.y === pos.y;
                        const isMonsterAtPos = monsterState.some(m => m.id !== monster.id && m.x === pos.x && m.y === pos.y);
                        if (currentMap[pos.y]?.[pos.x]?.type !== TileType.WALL && !isPlayerAtPos && !isMonsterAtPos) {
                            newMonsterPos = pos;
                            break;
                        }
                    }
                }
            }
            return { ...monster, ...newMonsterPos };
        });

        const mapAfterFog = updateFogOfWar(playerAfterMonsterAttacks, currentMap);

        setGameData({
            player: playerAfterMonsterAttacks,
            monsters: updatedMonsters,
            items: itemState,
            map: mapAfterFog,
            stairs: gameDataRef.current!.stairs,
        });

        if (playerAfterMonsterAttacks.hp <= 0) {
            handleGameOver("You have been defeated.");
        }
    }, [addMessage, updateFogOfWar, handleGameOver]);

    const advanceLevel = useCallback(() => {
        audioService.play('stairs');
        const nextLevel = dungeonLevel + 1;
        const isBossLevel = nextLevel % 5 === 0;

        setCurrentPath([]);
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
    }, [dungeonLevel, addMessage, updateFogOfWar, handleXpGain, legacyData]);

    const handlePlayerMove = useCallback((dx: number, dy: number) => {
        if (!gameDataRef.current || gameState !== GameState.PLAYING) return;
        
        const { player, map, monsters, stairs, items } = gameDataRef.current;
        const newX = player.x + dx;
        const newY = player.y + dy;
        const MAP_WIDTH = map[0].length;
        const MAP_HEIGHT = map.length;

        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT || map[newY][newX].type === TileType.WALL) {
            setCurrentPath([]); // Stop if trying to move into a wall
            return;
        }
        
        const monsterAtNewPos = monsters.find(m => m.x === newX && m.y === newY);
        if (monsterAtNewPos) {
            setCurrentPath([]); // Stop pathfinding to engage in combat
            const playerDamage = Math.max(1, player.attack - 0);
            const newMonsterHp = monsterAtNewPos.hp - playerDamage;
            addMessage(`You attack the ${monsterAtNewPos.name} for ${playerDamage} damage.`);
            audioService.play('attack');
            
            const damagedMonsters = monsters.map(m => m.id === monsterAtNewPos.id ? {...m, hp: newMonsterHp} : m);
            let mapForNextTurn;
            let playerForNextTurn = { ...player, steps: player.steps - 1 };

            if (newMonsterHp <= 0) {
                addMessage(`You defeated the ${monsterAtNewPos.name}!`);
                const xpGained = Math.floor(10 + monsterAtNewPos.maxHp / 4 + monsterAtNewPos.attack * 2);
                playerForNextTurn = handleXpGain(playerForNextTurn, xpGained);

                const shardsGained = 1 + Math.floor(monsterAtNewPos.maxHp / 15);
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
                const updatedPlayer = { ...player, x: newX, y: newY, keysHeld: 0, steps: player.steps - 1 };
                processTurn(updatedPlayer, monsters, items, newMap);
            } else {
                addMessage(`The door is locked. It requires ${requiredKeys} key(s).`);
            }
            return;
        }
        
        if (map[newY][newX].type === TileType.STAIRS) {
            if (stairs.x === newX && stairs.y === newY) {
                advanceLevel();
                return;
            }
        }

        let newPlayer = { ...player, x: newX, y: newY, steps: player.steps - 1 };
        let newItems = [...items];
        const itemIndex = items.findIndex(i => i.position.x === newX && i.position.y === newY);

        if (itemIndex > -1) {
            const item = items[itemIndex];
            audioService.play('pickup');
            addMessage(`You picked up: ${item.name}.`);
            
            if (item.type === ItemType.KEY) {
                newPlayer.keysHeld += 1;
                const xpForKey = 25 * dungeonLevel;
                newPlayer = handleXpGain(newPlayer, xpForKey);
            } else if (item.type === ItemType.HEALTH_POTION) {
                const healAmount = Math.floor(newPlayer.maxHp * (item.value / 100));
                newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + healAmount);
            } else if (item.type === ItemType.ATTACK_BOOST) {
                newPlayer.attack += item.value;
            } else if (item.type === ItemType.DEFENSE_BOOST) {
                newPlayer.defense += item.value;
            } else if (item.type === ItemType.STEP_BOOST) {
                newPlayer.steps += item.value;
            }
            newItems.splice(itemIndex, 1);
        }

        processTurn(newPlayer, monsters, newItems);
    }, [gameState, processTurn, advanceLevel, addMessage, handleXpGain, requiredKeys, dungeonLevel]);

    const handleDirectionalControl = useCallback((dir: Direction) => {
        setCurrentPath([]); // Interrupt any ongoing pathfinding
        let dx = 0, dy = 0;
        if (dir === 'UP') dy = -1;
        else if (dir === 'DOWN') dy = 1;
        else if (dir === 'LEFT') dx = -1;
        else if (dir === 'RIGHT') dx = 1;
        if (dx !== 0 || dy !== 0) handlePlayerMove(dx, dy);
    }, [handlePlayerMove]);
    
    const handleTileClick = useCallback((pos: Position) => {
        if (!gameDataRef.current || gameState !== GameState.PLAYING) return;
        const { player, map, monsters } = gameDataRef.current;

        if (map[pos.y]?.[pos.x]?.type === TileType.WALL) return;

        const targetMonster = monsters.find(m => m.x === pos.x && m.y === pos.y);

        if (targetMonster) {
            const dx = targetMonster.x - player.x;
            const dy = targetMonster.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1.5) {
                handlePlayerMove(dx, dy);
            } else {
                const targetTiles: Position[] = [];
                const directions = [
                    {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0},
                    {x: -1, y: -1}, {x: -1, y: 1}, {x: 1, y: -1}, {x: 1, y: 1}
                ];
                
                for (const dir of directions) {
                    const checkPos = { x: targetMonster.x + dir.x, y: targetMonster.y + dir.y };
                    const tile = map[checkPos.y]?.[checkPos.x];
                    
                    if (tile && tile.type !== TileType.WALL && !(player.x === checkPos.x && player.y === checkPos.y)) {
                        const isBlockedByOtherMonster = monsters.some(m => m.id !== targetMonster.id && m.x === checkPos.x && m.y === checkPos.y);
                        if (!isBlockedByOtherMonster) {
                             targetTiles.push(checkPos);
                        }
                    }
                }
                
                if (targetTiles.length === 0) return;

                targetTiles.sort((a, b) => {
                    const distA = Math.abs(a.x - player.x) + Math.abs(a.y - player.y);
                    const distB = Math.abs(b.x - player.x) + Math.abs(b.y - player.y);
                    return distA - distB;
                });
                
                const bestTargetTile = targetTiles[0];
                const path = pathfindingService.findPath(map, player, bestTargetTile);
                setCurrentPath(path);
            }
        } else {
            const path = pathfindingService.findPath(map, player, pos);
            setCurrentPath(path);
        }
    }, [gameState, handlePlayerMove]);

    useEffect(() => {
        if (gameState !== GameState.PLAYING || currentPath.length === 0 || !gameData) {
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

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx !== 0 && dy !== 0)) {
            setCurrentPath([]);
            return;
        }
        
        const timerId = setTimeout(() => handlePlayerMove(dx, dy), 60);
        return () => clearTimeout(timerId);

    }, [gameData, currentPath, gameState, handlePlayerMove]);


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

    useGameInput({
        onDirection: handleDirectionalControl,
    }, gameState === GameState.PLAYING);
    
    const restartGame = () => {
        setGameState(GameState.START_SCREEN);
        setGameData(null);
    };

    switch (gameState) {
        case GameState.START_SCREEN:
            return <StartScreen onStartGame={startNewGame} onShowLeaderboard={() => setGameState(GameState.LEADERBOARD)} onShowArmory={() => setGameState(GameState.ARMORY)} />;
        case GameState.LEADERBOARD:
            return <LeaderboardScreen onBack={() => setGameState(GameState.START_SCREEN)} />;
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
                    />
                </main>
            );
        default:
            return null;
    }
};

export default App;
