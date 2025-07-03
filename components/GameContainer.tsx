import React, { useState } from 'react';
import GameMap from './GameMap';
import PlayerStatus from './PlayerStatus';
import MessageLog from './MessageLog';
import Controls from './Controls';
import { ArrowIcon } from './Icons';
import { GameData, Monster } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface GameContainerProps {
  gameData: GameData;
  level: number;
  messages: string[];
  theme: string;
  selectedMonster: Monster | null;
  onSelectMonster: (monster: Monster) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onDirection: (dir: Direction) => void;
  desktopLayout: 'horizontal' | 'vertical';
  onToggleLayout: () => void;
  isDpadVisible: boolean;
  onToggleDpad: () => void;
}

const MonsterTooltip: React.FC<{ monster: Monster }> = ({ monster }) => {
  const hpPercentage = (monster.hp / monster.maxHp) * 100;
  return (
    <div className="absolute z-10 p-3 bg-slate-900 border border-red-500 rounded-lg shadow-lg max-w-xs text-sm pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+10px)]">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-lg text-red-400">{monster.name}</h4>
            <span className="font-mono">{monster.hp}/{monster.maxHp} HP</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2 border border-slate-500 mb-2">
          <div className="bg-red-600 h-full rounded-full" style={{ width: `${hpPercentage}%` }}></div>
        </div>
      <p className="italic text-slate-300">{monster.description}</p>
    </div>
  );
};


const GameContainer: React.FC<GameContainerProps> = ({ gameData, level, messages, theme, selectedMonster, onSelectMonster, isMuted, onToggleMute, onDirection, desktopLayout, onToggleLayout, isDpadVisible, onToggleDpad }) => {
  const [hoveredMonster, setHoveredMonster] = useState<Monster | null>(null);
  const [dpadPosition, setDpadPosition] = useState<'right' | 'left'>('right');


  const monsterForTooltip = selectedMonster || hoveredMonster;
  const arrowRotation = desktopLayout === 'horizontal' ? '-90deg' : '180deg';

  return (
    <div className={`flex h-full w-full p-4 gap-4 ${desktopLayout === 'horizontal' ? 'flex-col md:flex-row' : 'flex-col'}`}>
      {/* Map Side (Left on desktop, Top on mobile/vertical layout) */}
      <div className="relative flex-auto flex items-center justify-center min-w-0 min-h-0">
        <div 
          className="relative w-full h-full aspect-[50/30] bg-black p-2 rounded-lg border border-slate-700"
        >
          <GameMap
            map={gameData.map}
            player={gameData.player}
            monsters={gameData.monsters}
            stairs={gameData.stairs}
            items={gameData.items}
            onMonsterHover={setHoveredMonster}
            onSelectMonster={onSelectMonster}
          />
          {monsterForTooltip && (
            <div 
              className="absolute pointer-events-none" 
              style={{
                left: `calc(${(monsterForTooltip.x + 0.5) / MAP_WIDTH * 100}%)`,
                top: `calc(${(monsterForTooltip.y + 0.5) / MAP_HEIGHT * 100}%)`,
              }}
            >
              <MonsterTooltip monster={monsterForTooltip} />
            </div>
          )}
           <button
                onClick={onToggleLayout}
                className="absolute top-2 right-2 z-20 p-2 bg-slate-700/80 rounded-full hidden md:block hover:bg-sky-500/80 transition-colors shadow-lg"
                aria-label={desktopLayout === 'horizontal' ? 'Switch to vertical layout' : 'Switch to horizontal layout'}
            >
                <ArrowIcon rotation={arrowRotation} />
            </button>
        </div>
        {isDpadVisible && <Controls 
            onDirection={onDirection}
            position={dpadPosition}
            onTogglePosition={() => setDpadPosition(p => p === 'left' ? 'right' : 'left')}
        />}
      </div>
      
      {/* Info Panel (Right on desktop, Bottom on mobile/vertical layout) */}
      <div className={`flex gap-4 flex-none ${desktopLayout === 'horizontal' ? 'flex-row md:flex-col w-full md:w-96 h-48 md:h-auto' : 'flex-row w-full h-48'}`}>
        <PlayerStatus 
          player={gameData.player} 
          level={level} 
          theme={theme} 
          isMuted={isMuted} 
          onToggleMute={onToggleMute} 
          isDpadVisible={isDpadVisible} 
          onToggleDpad={onToggleDpad}
          desktopLayout={desktopLayout}
        />
        <MessageLog messages={messages} />
      </div>
    </div>
  );
};

export default GameContainer;