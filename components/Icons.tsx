

import React, { useState, useEffect } from 'react';
import { ItemType, PlayerClass } from '../types';
import { WARRIOR_GIF_URL, GUARDIAN_GIF_URL, MONSTER_GIFS } from '../constants';

const SPRITE_CLASS = 'w-16 h-16 object-contain flex-shrink-0';

// O ícone do jogador agora exibe um GIF diferente com base na classe escolhida.
// Os GIFs podem ser alterados no arquivo `constants.ts`.
// Adicionado fallback para caso o GIF não carregue.
export const PlayerIcon: React.FC<{ playerClass: PlayerClass }> = ({ playerClass }) => {
    const [imageError, setImageError] = useState(false);
    const isWarrior = playerClass === PlayerClass.WARRIOR;
    const gifUrl = isWarrior ? WARRIOR_GIF_URL : GUARDIAN_GIF_URL;
    const altText = isWarrior ? 'Warrior' : 'Guardian';

    useEffect(() => {
        setImageError(false);
    }, [gifUrl]);

    if (imageError) {
        const initial = isWarrior ? 'W' : 'G';
        const bgColor = isWarrior ? 'bg-red-600' : 'bg-sky-600';
        return (
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-4xl font-bold text-white flex-shrink-0 ${bgColor}`} aria-label={altText}>
                {initial}
            </div>
        );
    }
    
    return <img src={gifUrl} alt={altText} className={SPRITE_CLASS} onError={() => setImageError(true)} />;
};

// Os monstros agora são representados por GIFs animados específicos para uma estética mais coesa.
// Os GIFs podem ser configurados no objeto `MONSTER_GIFS` em `constants.ts`.
// Adicionado fallback para caso o GIF não carregue.
export const MonsterIcon: React.FC<{ name: string; spriteType: string; isBoss?: boolean; }> = ({ name, spriteType, isBoss }) => {
    const [imageError, setImageError] = useState(false);
    const gifKey = isBoss ? 'boss' : spriteType;
    const url = MONSTER_GIFS[gifKey] || MONSTER_GIFS['default'];

    useEffect(() => {
        setImageError(false);
    }, [url]);

    if (imageError) {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        const bgColor = isBoss ? 'bg-purple-800' : 'bg-slate-700';
        return (
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-4xl font-bold text-white flex-shrink-0 ${bgColor}`} aria-label={name}>
                {initial}
            </div>
        );
    }

    return <img src={url} alt={name} className={SPRITE_CLASS} onError={() => setImageError(true)} />;
};


export const StairsIcon: React.FC = () => (
    <div className="w-16 h-16 flex items-center justify-center font-bold text-6xl text-yellow-300">
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
        <div className={`w-16 h-16 flex items-center justify-center font-extrabold text-5xl ${colorClass}`}>
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

export const SoulShardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <defs>
            <radialGradient id="soulShardGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#e9d5ff'}} />
                <stop offset="60%" style={{stopColor: '#c084fc'}} />
                <stop offset="100%" style={{stopColor: '#9333ea'}} />
            </radialGradient>
        </defs>
        <path 
            fill="url(#soulShardGradient)"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"
            transform="matrix(0.83, -0.55, 0.55, 0.83, -4.8, 8.2)"
        />
        <path 
            fill="rgba(255,255,255,0.4)"
            d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 1.5c3.03 0 5.5 2.47 5.5 5.5s-2.47 5.5-5.5 5.5-5.5-2.47-5.5-5.5 2.47-5.5 5.5-5.5z"
        />
    </svg>
);
