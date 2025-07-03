
import React, { useState } from 'react';
import GameMap from './GameMap';
import PlayerStatus from './PlayerStatus';
import MessageLog from './MessageLog';
import Controls from './Controls';
import { SwapIcon } from './Icons';
import { GameData, Monster, Direction } from '../types';

interface GameContainerProps {
  gameData: GameData;
  level: number;
  messages: string[];
  theme: string;
  selectedMonster: Monster | null;
  onSelectMonster: (monster: Monster) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  desktopLayout: 'horizontal' | 'vertical';
  onToggleLayout: () => void;
  isDpadVisible: boolean;
  onToggleDpad: () => void;
  requiredKeys: number;
  elapsedTime: number;
  onDirection: (dir: Direction) => void;
  dpadPosition: 'left' | 'right';
  onToggleDpadPosition: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ 
    gameData, 
    level, 
    messages, 
    theme, 
    selectedMonster, 
    onSelectMonster, 
    isMuted, 
    onToggleMute, 
    desktopLayout, 
    onToggleLayout, 
    isDpadVisible, 
    onToggleDpad, 
    requiredKeys,
    elapsedTime,
    onDirection,
    dpadPosition,
    onToggleDpadPosition
}) => {
  const [hoveredMonster, setHoveredMonster] = useState<Monster | null>(null);

  const monsterForTooltip = selectedMonster || hoveredMonster;
  const isHorizontal = desktopLayout === 'horizontal';
  
  return (
    <div className={`w-full h-full p-2 md:p-4 gap-4 flex flex-col ${isHorizontal ? 'md:flex-row' : ''}`}>
      {/* Main Game Map Area */}
      <div className="relative flex-grow flex items-center justify-center bg-black rounded-lg overflow-hidden">
        <div 
          className="relative w-full h-full"
        >
          <GameMap
            map={gameData.map}
            player={gameData.player}
            monsters={gameData.monsters}
            stairs={gameData.stairs}
            items={gameData.items}
            onMonsterHover={setHoveredMonster}
            onSelectMonster={onSelectMonster}
            monsterForTooltip={monsterForTooltip}
          />
           {isDpadVisible && (
              <Controls 
                  onDirection={onDirection} 
                  position={dpadPosition} 
                  onTogglePosition={onToggleDpadPosition}
              />
          )}
        </div>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`flex flex-col gap-4 ${isHorizontal ? 'md:w-96' : 'w-full md:h-72'}`}>
        
        {/* Panels (Status + Log) */}
        <div className={`flex-grow min-h-0 flex flex-col gap-4 ${isHorizontal ? '' : 'md:flex-row'}`}>
          <div className="flex-1 min-h-0">
            <PlayerStatus
              player={gameData.player}
              level={level}
              requiredKeys={requiredKeys}
              theme={theme}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              isDpadVisible={isDpadVisible}
              onToggleDpad={onToggleDpad}
              desktopLayout={desktopLayout}
              elapsedTime={elapsedTime}
            />
          </div>
          <div className="flex-1 min-h-0">
            <MessageLog messages={messages} />
          </div>
        </div>
        
        {/* Layout Toggle Button */}
        <div className="hidden md:flex flex-shrink-0">
          <button
              onClick={onToggleLayout}
              className="flex items-center justify-center gap-2 w-full p-2 bg-slate-700/80 rounded-lg text-white hover:bg-sky-500/80 transition-colors"
              aria-label="Toggle Layout"
          >
              <SwapIcon /> 
              <span>Toggle View</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameContainer;