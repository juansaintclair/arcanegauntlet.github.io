
import React from 'react';
import { ItemType, PlayerClass } from '../types';
import { WARRIOR_GIF_URL, GUARDIAN_GIF_URL, MONSTER_GIFS } from '../constants';

const SPRITE_CLASS = 'w-16 h-16 object-contain flex-shrink-0';

// O ícone do jogador agora exibe um GIF diferente com base na classe escolhida.
// Os GIFs podem ser alterados no arquivo `constants.ts`.
export const PlayerIcon: React.FC<{ playerClass: PlayerClass }> = ({ playerClass }) => {
    const gifUrl = playerClass === PlayerClass.WARRIOR ? WARRIOR_GIF_URL : GUARDIAN_GIF_URL;
    const altText = playerClass === PlayerClass.WARRIOR ? 'Warrior' : 'Guardian';
    return <img src={gifUrl} alt={altText} className={SPRITE_CLASS} />;
};

// Os monstros agora são representados por GIFs animados específicos para uma estética mais coesa.
// Os GIFs podem ser configurados no objeto `MONSTER_GIFS` em `constants.ts`.
export const MonsterIcon: React.FC<{ name: string; spriteType: string; isBoss?: boolean; }> = ({ name, spriteType, isBoss }) => {
    const gifKey = isBoss ? 'boss' : spriteType;
    const url = MONSTER_GIFS[gifKey] || MONSTER_GIFS['default'];
    return <img src={url} alt={name} className={SPRITE_CLASS} />;
};


export const StairsIcon: React.FC = () => (
    <div className="w-16 h-16 flex items-center justify-center font-bold text-3xl text-yellow-300">
        &gt;
    </div>
);

export const DoorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 4v16H6V4h12m0-2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
    </svg>
);


const itemColorMap: { [key in ItemType]: string } = {
    [ItemType.HEALTH_POTION]: 'text-red-400',
    [ItemType.ATTACK_BOOST]: 'text-orange-400',
    [ItemType.DEFENSE_BOOST]: 'text-sky-400',
    [ItemType.KEY]: 'text-yellow-400',
    [ItemType.STEP_BOOST]: 'text-lime-400',
};

export const ItemIcon: React.FC<{ symbol: string; type: ItemType }> = ({ symbol, type }) => {
    const colorClass = itemColorMap[type] || 'text-slate-400';
    return (
        <div className={`w-16 h-16 flex items-center justify-center font-extrabold text-2xl ${colorClass}`}>
            {symbol}
        </div>
    );
};

export const GamepadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z"/>
    </svg>
);

export const SwapIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18m0 0l-4 4m4-4l-4-4" />
    </svg>
);


export const ArrowIcon: React.FC<{ rotation?: string }> = ({ rotation = '0deg' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 transition-transform duration-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        style={{ transform: `rotate(${rotation})` }}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);