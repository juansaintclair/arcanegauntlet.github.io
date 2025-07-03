
import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
  level: number;
  time: number;
}

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, level, time }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">You Have Fallen</h1>
      <p className="text-2xl text-slate-300 mb-2">
        You reached dungeon level <span className="font-bold text-yellow-400">{level}</span>.
      </p>
      <p className="text-xl text-slate-400 mb-8">
        Time: <span className="font-bold text-yellow-400">{formatTime(time)}</span>
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
