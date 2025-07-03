
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameData, Player, Monster, TileType, Position, ItemType, PlayerClass, Item, Tile } from './types';
import { useGameInput } from './hooks/useGameInput';
import { generateDungeon } from './services/dungeonService';
import { generateLevelContent } from './services/proceduralGenerationService';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import GameContainer from './components/GameContainer';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';
import { audioService } from './services/audioService';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [dungeonLevel, setDungeonLevel] = useState(1);
    const [levelTheme, setLevelTheme] = useState('');
    const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [desktopLayout, setDesktopLayout] = useState<'horizontal' | 'vertical'>('horizontal');
    const [isDpadVisible, setIsDpadVisible] = useState(true);

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
    
    const handleToggleLayout = () => {
        setDesktopLayout(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    };

    const handleToggleDpad = () => {
        setIsDpadVisible(prev => !prev);
    };

    const addMessage = useCallback((msg: string) => {
        setMessages(prev => [...prev.slice(-10), msg]);
    }, []);

    const updateFogOfWar = useCallback((center: Position, map: GameData['map']) => {
        const visionRadius = 6; // Reduced vision radius for more challenge
        const newMap = map.map(row => row.map(tile => ({...tile, visible: false})));

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const dx = x - center.x;
                const dy = y - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < visionRadius) {
                    // Line of sight check
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
    
    const startNewGame = useCallback(async (playerClass: PlayerClass) => {
        setGameState(GameState.GENERATING);
        setDungeonLevel(1);
        setMessages([]);
        setSelectedMonster(null);

        const initialStats = playerClass === PlayerClass.WARRIOR
            ? { attack: 5, defense: 2, hp: 80, maxHp: 80 } // Rebalanced Warrior stats
            : { attack: 2, defense: 5, hp: 120, maxHp: 120 };
        
        const className = playerClass === PlayerClass.WARRIOR ? "Warrior" : "Guardian";
        addMessage(`Welcome, ${className}. Your journey begins.`);

        try {
            const { theme, monsters: generatedMonsters } = await generateLevelContent(false);
            setLevelTheme(theme);
            addMessage(`You enter a level known as: ${theme}`);
            
            let { map, monsters, stairs, items, startingPosition } = generateDungeon(1, generatedMonsters, false);
            
            const player: Player = {
                ...startingPosition,
                ...initialStats,
                playerClass,
            };

            map = updateFogOfWar(player, map);

            setGameData({ map, player, monsters, stairs, items });
            setGameState(GameState.PLAYING);
        } catch (error) {
            console.error("Failed to start new game:", error);
            addMessage("Error: Could not generate the dungeon. Please try again.");
            setGameState(GameState.START_SCREEN);
        }
    }, [addMessage, updateFogOfWar]);
    
    const gameDataRef = React.useRef(gameData);
    useEffect(() => {
        gameDataRef.current = gameData;
    }, [gameData]);

    const processTurn = useCallback((playerState: Player, monsterState: Monster[], itemState: Item[], newMap?: Tile[][]) => {
        const playerAfterMonsterAttacks = {...playerState};
        const currentMap = newMap || gameDataRef.current!.map;

        const updatedMonsters = monsterState.map(monster => {
            const dx = playerState.x - monster.x;
            const dy = playerState.y - monster.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            let newMonsterPos = { x: monster.x, y: monster.y };

            if (distance < 8) { // AI activation range
                if (distance < 1.5) { // Attack
                    const monsterDamage = Math.max(1, monster.attack - playerState.defense);
                    if (monsterDamage > 0) {
                        playerAfterMonsterAttacks.hp -= monsterDamage;
                        addMessage(`The ${monster.name} attacks you for ${monsterDamage} damage.`);
                        audioService.play('damage');
                    } else {
                        addMessage(`The ${monster.name}'s attack glances off your armor.`);
                    }
                } else { // Move
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
            audioService.play('gameOver');
            setGameState(GameState.GAME_OVER);
            addMessage("You have been defeated.");
        }
    }, [addMessage, updateFogOfWar]);

    const advanceLevel = useCallback(async () => {
        audioService.play('stairs');
        const nextLevel = dungeonLevel + 1;
        const isBossLevel = nextLevel % 5 === 0;

        setDungeonLevel(nextLevel);
        setGameState(GameState.GENERATING);
        setSelectedMonster(null);
        addMessage(`You descend to level ${nextLevel}...`);
        
        const currentPlayer = gameDataRef.current!.player;

        try {
            if (isBossLevel) {
                addMessage("You feel a dreadful presence...");
            }
            const { theme, monsters: generatedMonsters } = await generateLevelContent(isBossLevel);
            setLevelTheme(theme);
            addMessage(`This place feels different... like a ${theme}`);
            let { map, monsters, stairs, items, startingPosition } = generateDungeon(nextLevel, generatedMonsters, isBossLevel);
            
            const newPlayer = { ...currentPlayer, ...startingPosition };
            
            // Level up bonus!
            newPlayer.maxHp += 10;
            // Restore 50% of max HP on level up, not a full heal.
            const healAmount = Math.floor(newPlayer.maxHp / 2);
            newPlayer.hp = Math.min(newPlayer.maxHp, currentPlayer.hp + healAmount);
            addMessage("You feel renewed. Max HP up, some health restored.");


            map = updateFogOfWar(newPlayer, map);
            setGameData({ map, player: newPlayer, monsters, stairs, items });
            setGameState(GameState.PLAYING);
        } catch (error) {
            console.error("Failed to advance level:", error);
            addMessage("Error: The path ahead is blocked. Returning to safety.");
            setGameState(GameState.PLAYING); // Revert to current level
        }
    }, [dungeonLevel, addMessage, updateFogOfWar]);

    const handlePlayerMove = useCallback((dx: number, dy: number) => {
        if (!gameDataRef.current || gameState !== GameState.PLAYING) return;
        
        const { player, map, monsters, stairs, items } = gameDataRef.current;
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT || map[newY][newX].type === TileType.WALL) {
            return;
        }

        setSelectedMonster(null);
        
        const monsterAtNewPos = monsters.find(m => m.x === newX && m.y === newY);
        if (monsterAtNewPos) {
            const playerDamage = Math.max(1, player.attack - 0); // Monster defense not implemented
            const newMonsterHp = monsterAtNewPos.hp - playerDamage;
            addMessage(`You attack the ${monsterAtNewPos.name} for ${playerDamage} damage.`);
            audioService.play('attack');
            
            const newMonsters = monsters.map(m => m.id === monsterAtNewPos.id ? {...m, hp: newMonsterHp} : m).filter(m => m.hp > 0);
            let mapForNextTurn;

            if (newMonsterHp <= 0) {
                addMessage(`You defeated the ${monsterAtNewPos.name}!`);
                if (monsterAtNewPos.isBoss) {
                    addMessage("The way forward is revealed!");
                    const { map, stairs } = gameDataRef.current!;
                    const mapCopy = map.map(row => row.map(tile => ({...tile})));
                    mapCopy[stairs.y][stairs.x].type = TileType.STAIRS;
                    mapForNextTurn = mapCopy;
                }
            }
            processTurn(player, newMonsters, items, mapForNextTurn);
            return;
        }
        
        if (map[newY][newX].type === TileType.STAIRS) {
            if (stairs.x === newX && stairs.y === newY) {
                advanceLevel();
                return;
            }
        }


        let newPlayer = { ...player, x: newX, y: newY };
        let newItems = [...items];
        const itemIndex = items.findIndex(i => i.position.x === newX && i.position.y === newY);

        if (itemIndex > -1) {
            const item = items[itemIndex];
            audioService.play('pickup');
            addMessage(`You picked up: ${item.name}. ${item.description}`);
            
            if (item.type === ItemType.HEALTH_POTION) {
                const healAmount = Math.floor(newPlayer.maxHp * (item.value / 100));
                newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + healAmount);
            } else if (item.type === ItemType.ATTACK_BOOST) {
                newPlayer.attack += item.value;
            } else if (item.type === ItemType.DEFENSE_BOOST) {
                newPlayer.defense += item.value;
            }
            newItems.splice(itemIndex, 1);
        }

        processTurn(newPlayer, monsters, newItems);
    }, [gameState, processTurn, advanceLevel, addMessage]);

    useGameInput({
        onDirection: (dir) => {
            let dx = 0, dy = 0;
            if (dir === 'UP') dy = -1;
            else if (dir === 'DOWN') dy = 1;
            else if (dir === 'LEFT') dx = -1;
            else if (dir === 'RIGHT') dx = 1;
            if (dx !== 0 || dy !== 0) handlePlayerMove(dx, dy);
        }
    }, gameState === GameState.PLAYING);
    
    const restartGame = () => {
        setGameState(GameState.START_SCREEN);
        setGameData(null);
    };

    const handleDirectionalControl = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        let dx = 0, dy = 0;
        if (dir === 'UP') dy = -1;
        else if (dir === 'DOWN') dy = 1;
        else if (dir === 'LEFT') dx = -1;
        else if (dir === 'RIGHT') dx = 1;
        handlePlayerMove(dx, dy);
    };

    switch (gameState) {
        case GameState.START_SCREEN:
            return <StartScreen onSelectClass={startNewGame} />;
        case GameState.GAME_OVER:
            return <GameOverScreen onRestart={restartGame} level={dungeonLevel} />;
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
                <main className="bg-slate-900 text-white w-screen h-screen flex flex-col overflow-hidden">
                    <GameContainer
                        gameData={gameData}
                        level={dungeonLevel}
                        messages={messages}
                        theme={levelTheme}
                        selectedMonster={selectedMonster}
                        onSelectMonster={setSelectedMonster}
                        isMuted={isMuted}
                        onToggleMute={handleToggleMute}
                        onDirection={handleDirectionalControl}
                        desktopLayout={desktopLayout}
                        onToggleLayout={handleToggleLayout}
                        isDpadVisible={isDpadVisible}
                        onToggleDpad={handleToggleDpad}
                    />
                </main>
            );
        default:
            return null;
    }
};

export default App;