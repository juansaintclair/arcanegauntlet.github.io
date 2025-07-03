
import { useEffect } from 'react';
import { Direction } from '../types';

interface Actions {
    onDirection: (dir: Direction) => void;
}

export const useGameInput = (actions: Actions, enabled: boolean) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            let direction: Direction | null = null;
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                    direction = 'UP';
                    break;
                case 'ArrowDown':
                case 's':
                    direction = 'DOWN';
                    break;
                case 'ArrowLeft':
                case 'a':
                    direction = 'LEFT';
                    break;
                case 'ArrowRight':
                case 'd':
                    direction = 'RIGHT';
                    break;
                default:
                    return;
            }
            
            event.preventDefault();
            if(direction) {
                actions.onDirection(direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [actions.onDirection, enabled]);
};