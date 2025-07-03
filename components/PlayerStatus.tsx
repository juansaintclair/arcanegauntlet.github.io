import React from 'react';
import { Player } from '../types';
import { GamepadIcon } from './Icons';

interface PlayerStatusProps {
  player: Player;
  level: number;
  theme: string;
  isMuted: boolean;
  onToggleMute: () => void;
  isDpadVisible: boolean;
  onToggleDpad: () => void;
  desktopLayout: 'horizontal' | 'vertical';
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


const PlayerStatus: React.FC<PlayerStatusProps> = ({ player, level, theme, isMuted, onToggleMute, isDpadVisible, onToggleDpad, desktopLayout }) => {
  const hpPercentage = (player.hp / player.maxHp) * 100;
  const isVerticalDesktop = desktopLayout === 'vertical';

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700 flex-1 min-w-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-sky-400">Player</h2>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold">Level: <span className="text-yellow-400">{level}</span></span>
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
      <div className={`mt-3 ${isVerticalDesktop ? 'md:flex md:gap-4 md:items-start' : ''}`}>
        {/* Stats */}
        <div className={isVerticalDesktop ? 'md:w-1/2' : ''}>
          <div className="mb-2">
              <span className="font-bold text-base md:text-lg">Attack:</span> <span className="font-mono text-base md:text-lg">{player.attack}</span>
          </div>
          <div className="mb-2">
              <span className="font-bold text-base md:text-lg">Defense:</span> <span className="font-mono text-base md:text-lg">{player.defense}</span>
          </div>
        </div>
        
        {/* Theme */}
        <div className={`hidden md:block ${isVerticalDesktop ? 'md:w-1/2' : ''}`}>
          <h3 className="text-base md:text-lg font-bold text-slate-400 mb-1">Dungeon Theme</h3>
          <p className="text-sm md:text-base text-slate-300 italic break-words">"{theme}"</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatus;