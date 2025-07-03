import React from 'react';
import { PlayerClass } from '../types';
import { PlayerIcon } from './Icons';

interface StartScreenProps {
  onSelectClass: (playerClass: PlayerClass) => Promise<void>;
}

const ClassCard: React.FC<{title: string, description: string, stats: string, playerClass: PlayerClass, onClick: () => void}> = ({ title, description, stats, playerClass, onClick }) => (
    <div 
        className="border-2 border-sky-500/50 p-6 rounded-lg bg-slate-800/50 hover:bg-slate-800/90 hover:border-sky-400 transition-all duration-300 cursor-pointer w-full md:w-96 text-left transform hover:scale-105"
        onClick={onClick}
    >
        <div className="flex items-center gap-6">
            <PlayerIcon playerClass={playerClass} />
            <div className="flex-grow">
                <h3 className="text-2xl font-bold text-sky-400 mb-1">{title}</h3>
                <p className="font-mono text-lg text-yellow-300">{stats}</p>
            </div>
        </div>
         <p className="text-slate-300 mt-4 h-12">{description}</p>
    </div>
);


const StartScreen: React.FC<StartScreenProps> = ({ onSelectClass }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
      <h1 className="text-6xl font-bold text-sky-400 mb-4 tracking-wider">Arcane Gauntlet</h1>
      <p className="text-xl text-slate-300 mb-8 max-w-2xl">
        Choose your path. An ever-changing dungeon awaits.
      </p>
      <div className="flex flex-col md:flex-row gap-8">
        <ClassCard 
            title="Warrior"
            description="A master of offense, carving through foes with raw power."
            stats="Attack: 5 | Defense: 2"
            playerClass={PlayerClass.WARRIOR}
            onClick={() => onSelectClass(PlayerClass.WARRIOR)}
        />
        <ClassCard 
            title="Guardian"
            description="A stalwart defender, weathering blows that would fell lesser adventurers."
            stats="Attack: 2 | Defense: 5"
            playerClass={PlayerClass.GUARDIAN}
            onClick={() => onSelectClass(PlayerClass.GUARDIAN)}
        />
      </div>
    </div>
  );
};

export default StartScreen;