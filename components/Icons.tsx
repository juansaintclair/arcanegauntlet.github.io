
import React from 'react';
import { ItemType, PlayerClass } from '../types';

const SPRITE_CLASS = 'w-6 h-6 object-contain flex-shrink-0';

// Reverted to DiceBear API for visually appealing and consistent sprites.
export const PlayerIcon: React.FC<{ playerClass: PlayerClass }> = ({ playerClass }) => {
    // Using a simple seed based on the class name.
    const seed = playerClass === PlayerClass.WARRIOR ? 'warrior' : 'guardian';
    const url = `https://api.dicebear.com/8.x/miniavs/svg?seed=${seed}&backgroundColor=transparent`;
    return <img src={url} alt="Player" className={SPRITE_CLASS} />;
};

// Reverted to DiceBear for varied and interesting monster sprites.
// Using 'name' in the seed ensures different monsters can look different.
export const MonsterIcon: React.FC<{ name: string; spriteType: string; isBoss?: boolean; }> = ({ name, isBoss }) => {
    // The unique monster name provides a unique seed for its visual appearance.
    const seed = name;
    // Bosses get a more distinct, menacing style.
    const style = isBoss ? 'lorelei' : 'croodles';
    const url = `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent&radius=50`;
    return <img src={url} alt={name} className={SPRITE_CLASS} />;
};


export const StairsIcon: React.FC = () => (
    <div className="w-6 h-6 flex items-center justify-center font-bold text-2xl text-yellow-300">
        &gt;
    </div>
);

const itemColorMap: { [key in ItemType]: string } = {
    [ItemType.HEALTH_POTION]: 'text-red-400',
    [ItemType.ATTACK_BOOST]: 'text-orange-400',
    [ItemType.DEFENSE_BOOST]: 'text-sky-400',
};

export const ItemIcon: React.FC<{ symbol: string; type: ItemType }> = ({ symbol, type }) => {
    const colorClass = itemColorMap[type] || 'text-slate-400';
    return (
        <div className={`w-6 h-6 flex items-center justify-center font-extrabold text-xl ${colorClass}`}>
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
