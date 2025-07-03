
import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
  level: number;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, level }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">You Have Fallen</h1>
      <p className="text-2xl text-slate-300 mb-8">
        You reached dungeon level <span className="font-bold text-yellow-400">{level}</span>.
      </p>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-slate-600 text-white font-bold text-2xl rounded-lg hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105"
      >
        Try Again
      </button>
    </div>
  );
};

export default GameOverScreen;