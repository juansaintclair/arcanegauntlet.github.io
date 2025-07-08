
import { useEffect } from 'react';
import { Direction } from '../types';

interface Actions {
    onDirection: (dir: Direction) => void;
    onQuickFire: () => void;
}

const SINGLE_ACTION_KEYS = ['t', ' '];

export const useGameInput = (actions: Actions, enabled: boolean) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // For single-action keys, we want to ignore the built-in key repeat.
            if (SINGLE_ACTION_KEYS.includes(event.key.toLowerCase())) {
                if (event.repeat) {
                    return; // Ignore held-down key repeats for these specific keys.
                }
            }
            // For movement keys, the above block is skipped, so holding them down will fire events continuously.

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
                case 't':
                case ' ':
                    actions.onQuickFire();
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
    }, [actions, enabled]);
};
