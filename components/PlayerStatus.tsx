

import React from 'react';
import { Player, PlayerClass } from '../types';
import { GamepadIcon, SoulShardIcon, MinimapIcon } from './Icons';

interface PlayerStatusProps {
  player: Player;
  level: number; // This is the dungeon floor
  requiredKeys: number;
  theme: string;
  isMuted: boolean;
  onToggleMute: () => void;
  isDpadVisible: boolean;
  onToggleDpad: () => void;
  isMinimapVisible: boolean;
  onToggleMinimap: () => void;
  elapsedTime: number;
  shardsThisRun: number;
}

const MuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l4 4m0-4l-4 4" />
    </svg>
);
const UnmuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const getClassName = (playerClass: PlayerClass) => {
    switch (playerClass) {
        case PlayerClass.WARRIOR: return 'Warrior';
        case PlayerClass.GUARDIAN: return 'Guardian';
        case PlayerClass.MAGE: return 'Mage';
        default: return 'Adventurer';
    }
};

const PlayerStatus: React.FC<PlayerStatusProps> = ({ player, level, requiredKeys, theme, isMuted, onToggleMute, isDpadVisible, onToggleDpad, isMinimapVisible, onToggleMinimap, elapsedTime, shardsThisRun }) => {
  const hpPercentage = (player.hp / player.maxHp) * 100;
  const xpPercentage = player.xpToNextLevel > 0 ? (player.xp / player.xpToNextLevel) * 100 : 0;

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700 h-full flex flex-col overflow-y-auto">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-bold text-sky-400 truncate pr-2">{player.name}</h2>
            <div className="flex items-center gap-4">
            <span className="text-lg font-bold">Floor: <span className="text-yellow-400">{level}</span></span>
            <button
                onClick={onToggleMinimap}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label={isMinimapVisible ? "Hide Minimap" : "Show Minimap"}
            >
                <MinimapIcon />
            </button>
            <button
                onClick={onToggleDpad}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label={isDpadVisible ? "Hide D-Pad" : "Show D-Pad"}
            >
                <GamepadIcon />
            </button>
            <button
                onClick={onToggleMute}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
            </div>
        </div>
         <div className="flex justify-between items-center mb-3 text-slate-400">
             <span className="font-mono">Lvl {player.level} {getClassName(player.playerClass)}</span>
             <span className="font-mono">Time: {formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="flex-grow pr-2 -mr-2">
          <div className="mb-3">
            <div className="flex justify-between font-mono text-lg">
              <span className="font-bold">HP</span>
              <span>{player.hp} / {player.maxHp}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-4 border border-slate-500">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between font-mono text-sm">
              <span className="font-bold">XP</span>
              <span>{player.xp} / {player.xpToNextLevel}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3 mt-1 border border-slate-500">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-3">
            <div>
              <div className="mb-2">
                  <span className="font-bold text-base md:text-lg">Attack:</span> <span className="font-mono text-base md:text-lg">{player.attack}</span>
              </div>
              <div className="mb-2">
                  <span className="font-bold text-base md:text-lg">Defense:</span> <span className="font-mono text-base md:text-lg">{player.defense}</span>
              </div>
              <div className="mb-2">
                  <span className="font-bold text-base md:text-lg">Steps:</span>
                  <span className="font-mono text-base md:text-lg ml-2">{player.steps}</span>
              </div>
              <div className="mb-2">
                  <span className="font-bold text-base md:text-lg">Keys:</span>
                  <span className="font-mono text-base md:text-lg ml-2">{player.keysHeld} / {requiredKeys}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold text-base md:text-lg">Shards:</span>
                <span className="font-mono text-base md:text-lg ml-2 inline-flex items-center gap-1">
                    <SoulShardIcon className="w-5 h-5" />
                    {shardsThisRun}
                </span>
              </div>
            </div>
            
            <div className="mt-3">
              <h3 className="text-base md:text-lg font-bold text-slate-400 mb-1">Dungeon Theme</h3>
              <p className="text-sm md:text-base text-slate-300 italic break-words">"{theme}"</p>
            </div>

            <div className="mt-4">
              <h3 className="text-base md:text-lg font-bold text-slate-400 mb-2">Relics</h3>
              {player.relics.length === 0 ? (
                <p className="text-sm text-slate-500 italic">None yet...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {player.relics.map(relic => (
                    <div key={relic.id} className="text-left text-sm" title={relic.description}>
                      <span className="mr-2 text-base">{relic.symbol}</span>
                      <span className="font-bold">{relic.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default PlayerStatus;