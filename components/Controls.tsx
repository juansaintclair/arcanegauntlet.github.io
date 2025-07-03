
import React from 'react';
import { ArrowIcon, SwapIcon } from './Icons';
import { Direction } from '../types';

interface ControlsProps {
  onDirection: (dir: Direction) => void;
  position: 'left' | 'right';
  onTogglePosition: () => void;
}

const ControlButton: React.FC<{onClick: () => void, 'aria-label': string, children: React.ReactNode, className?: string}> = ({ onClick, children, className, ...props }) => (
    <button
        onClick={onClick}
        className={`bg-slate-700/80 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center active:bg-sky-500/80 backdrop-blur-sm shadow-lg transition-colors ${className}`}
        aria-label={props['aria-label']}
    >
        {children}
    </button>
);


const Controls: React.FC<ControlsProps> = ({ onDirection, position, onTogglePosition }) => {
  const positionClass = position === 'left' ? 'left-4' : 'right-4';
  
  return (
    <div className={`absolute bottom-4 ${positionClass} z-50 grid grid-cols-3 grid-rows-3 gap-1 w-48 h-48 md:w-56 md:h-56`}>
      <div className="col-start-2 row-start-1 flex justify-center">
        <ControlButton onClick={() => onDirection('UP')} aria-label="Move Up">
            <ArrowIcon rotation="90deg" />
        </ControlButton>
      </div>
      <div className="col-start-1 row-start-2 flex justify-center">
        <ControlButton onClick={() => onDirection('LEFT')} aria-label="Move Left">
            <ArrowIcon rotation="0deg" />
        </ControlButton>
      </div>
      <div className="col-start-2 row-start-2 flex justify-center items-center">
         <ControlButton 
            onClick={onTogglePosition} 
            aria-label={`Move controls to the ${position === 'left' ? 'right' : 'left'}`} 
            className="w-12 h-12 md:w-14 md:h-14 bg-slate-800/80"
          >
            <SwapIcon />
        </ControlButton>
      </div>
       <div className="col-start-3 row-start-2 flex justify-center">
        <ControlButton onClick={() => onDirection('RIGHT')} aria-label="Move Right">
            <ArrowIcon rotation="180deg" />
        </ControlButton>
      </div>
      <div className="col-start-2 row-start-3 flex justify-center">
        <ControlButton onClick={() => onDirection('DOWN')} aria-label="Move Down">
            <ArrowIcon rotation="-90deg" />
        </ControlButton>
      </div>
    </div>
  );
};

export default Controls;