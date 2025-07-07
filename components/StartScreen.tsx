

import React, { useState } from 'react';
import { PlayerClass } from '../types';
import { PlayerIcon } from './Icons';

interface StartScreenProps {
  onStartGame: (playerClass: PlayerClass, name: string) => void;
  onShowLeaderboard: () => void;
  onShowArmory: () => void;
  onShowRelicCompendium: () => void;
  onShowHowToPlay: () => void;
}

const ClassCard: React.FC<{
    title: string;
    description: string;
    stats: string;
    onClick: () => void;
    playerClass: PlayerClass;
    color: string;
}> = ({ title, description, stats, onClick, playerClass, color }) => (
    <div 
        className={`border-2 p-6 rounded-lg bg-slate-800/50 hover:bg-slate-800/90 transition-all duration-300 cursor-pointer w-full md:w-80 lg:w-96 text-left transform hover:scale-105 ${color}`}
        onClick={onClick}
    >
        <div className="flex items-center gap-6">
            <PlayerIcon playerClass={playerClass} />
            <div className="flex-grow">
                <h3 className={`text-2xl font-bold mb-1 ${color.replace('border', 'text')}`}>{title}</h3>
                <p className="font-mono text-lg text-yellow-300">{stats}</p>
            </div>
        </div>
         <p className="text-slate-300 mt-4 h-12">{description}</p>
    </div>
);


const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onShowLeaderboard, onShowArmory, onShowRelicCompendium, onShowHowToPlay }) => {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleStart = (playerClass: PlayerClass) => {
    const trimmedName = playerName.trim();
    if (trimmedName.length < 3 || trimmedName.length > 20) {
        setError('Name must be between 3 and 20 characters.');
        return;
    }
    setError('');
    onStartGame(playerClass, trimmedName);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
      <h1 className="text-4xl md:text-6xl font-bold text-sky-400 mb-4 tracking-wider">Arcane Gauntlet</h1>
      <p className="text-xl text-slate-300 mb-6 max-w-2xl">
        Enter your name, choose your path, and etch your legend.
      </p>

      <div className="mb-6 w-full max-w-md">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-lg text-center text-xl text-white focus:outline-none focus:border-sky-500 transition-colors"
          />
          {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>

      <div className="flex flex-col lg:flex-row flex-wrap justify-center items-stretch gap-8 mb-8">
        <ClassCard 
            playerClass={PlayerClass.WARRIOR}
            title="Warrior"
            description="A master of offense, carving through foes with raw power."
            stats="Attack: 5 | Defense: 2"
            onClick={() => handleStart(PlayerClass.WARRIOR)}
            color="border-red-500/50 hover:border-red-400"
        />
        <ClassCard 
            playerClass={PlayerClass.GUARDIAN}
            title="Guardian"
            description="A stalwart defender, weathering blows that would fell lesser adventurers."
            stats="Attack: 2 | Defense: 5"
            onClick={() => handleStart(PlayerClass.GUARDIAN)}
            color="border-sky-500/50 hover:border-sky-400"
        />
         <ClassCard 
            playerClass={PlayerClass.MAGE}
            title="Mage"
            description="A fragile but powerful caster who attacks from a distance."
            stats="Attack: 4 | Defense: 1"
            onClick={() => handleStart(PlayerClass.MAGE)}
            color="border-indigo-500/50 hover:border-indigo-400"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
            onClick={onShowHowToPlay}
            className="px-8 py-3 bg-green-700 text-white font-bold text-xl rounded-lg hover:bg-green-600 transition-colors duration-300 transform hover:scale-105"
        >
            How to Play
        </button>
        <button
            onClick={onShowRelicCompendium}
            className="px-8 py-3 bg-yellow-700 text-white font-bold text-xl rounded-lg hover:bg-yellow-600 transition-colors duration-300 transform hover:scale-105"
        >
            Relic Compendium
        </button>
        <button
            onClick={onShowArmory}
            className="px-8 py-3 bg-purple-700 text-white font-bold text-xl rounded-lg hover:bg-purple-600 transition-colors duration-300 transform hover:scale-105"
        >
            The Armory
        </button>
        <button
            onClick={onShowLeaderboard}
            className="px-8 py-3 bg-sky-700 text-white font-bold text-xl rounded-lg hover:bg-sky-600 transition-colors duration-300 transform hover:scale-105"
        >
            View Leaderboard
        </button>
      </div>
    </div>
  );
};

export default StartScreen;