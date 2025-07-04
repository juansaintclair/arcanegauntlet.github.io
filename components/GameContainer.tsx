


import React, { useState } from 'react';
import GameMap from './GameMap';
import PlayerStatus from './PlayerStatus';
import MessageLog from './MessageLog';
import Controls from './Controls';
import { GameData, Direction, Position } from '../types';

interface GameContainerProps {
  gameData: GameData;
  level: number;
  messages: string[];
  theme: string;
  isMuted: boolean;
  onToggleMute: () => void;
  isDpadVisible: boolean;
  onToggleDpad: () => void;
  requiredKeys: number;
  elapsedTime: number;
  onDirection: (dir: Direction) => void;
  dpadPosition: 'left' | 'right';
  onToggleDpadPosition: () => void;
  shardsThisRun: number;
  onTileClick: (pos: Position) => void;
  currentPath: Position[];
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 text-center text-sm font-bold uppercase tracking-wider transition-colors duration-200
            ${active ? 'bg-sky-600 text-white' : 'bg-slate-700/60 text-slate-400 hover:bg-slate-700'}`}
    >
        {children}
    </button>
);


const GameContainer: React.FC<GameContainerProps> = ({ 
    gameData, 
    level, 
    messages, 
    theme, 
    isMuted, 
    onToggleMute, 
    isDpadVisible, 
    onToggleDpad, 
    requiredKeys,
    elapsedTime,
    onDirection,
    dpadPosition,
    onToggleDpadPosition,
    shardsThisRun,
    onTileClick,
    currentPath,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'log'>('status');
  
  return (
    <div className="w-full h-full p-2 md:p-4 gap-4 flex flex-col md:flex-row">
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
            onTileClick={onTileClick}
            currentPath={currentPath}
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

      {/* Sidebar Wrapper for Desktop */}
      <div className="hidden md:flex flex-col gap-4 md:w-80 lg:w-96 flex-shrink-0">
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
              elapsedTime={elapsedTime}
              shardsThisRun={shardsThisRun}
            />
          </div>
          <div className="flex-1 min-h-0">
            <MessageLog messages={messages} />
          </div>
      </div>

      {/* Tabbed Panels for Mobile */}
      <div className="flex md:hidden flex-col gap-2 h-72 flex-shrink-0">
         <div className="flex bg-slate-800 rounded-t-lg overflow-hidden">
            <TabButton active={activeTab === 'status'} onClick={() => setActiveTab('status')}>Status</TabButton>
            <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')}>Log</TabButton>
         </div>
         <div className="flex-grow min-h-0">
            {activeTab === 'status' && (
                 <PlayerStatus
                    player={gameData.player}
                    level={level}
                    requiredKeys={requiredKeys}
                    theme={theme}
                    isMuted={isMuted}
                    onToggleMute={onToggleMute}
                    isDpadVisible={isDpadVisible}
                    onToggleDpad={onToggleDpad}
                    elapsedTime={elapsedTime}
                    shardsThisRun={shardsThisRun}
                />
            )}
            {activeTab === 'log' && <MessageLog messages={messages} />}
         </div>
      </div>
    </div>
  );
};

export default GameContainer;
