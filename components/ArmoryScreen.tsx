

import React, { useState, useEffect } from 'react';
import { LegacyData, UpgradeType } from '../types';
import { UPGRADES_CONFIG, legacyService } from '../services/legacyService';
import { SoulShardIcon } from './Icons';

interface ArmoryScreenProps {
  onBack: () => void;
  legacyData: LegacyData;
  onPurchase: (upgradeId: UpgradeType) => void;
}

const UpgradeCard: React.FC<{
    upgradeId: UpgradeType;
    level: number;
    soulShards: number;
    onPurchase: (upgradeId: UpgradeType) => void;
}> = ({ upgradeId, level, soulShards, onPurchase }) => {
    const config = UPGRADES_CONFIG[upgradeId];
    const cost = legacyService.getUpgradeCost(upgradeId, level);
    const canAfford = soulShards >= cost;
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [config.gifUrl]);

    const fallbackIcon = (
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl font-bold text-white bg-slate-700 flex-shrink-0" aria-label={config.name}>
            {config.name ? config.name.charAt(0).toUpperCase() : '?'}
        </div>
    );

    return (
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-5 flex flex-col text-center h-full items-center">
             <div className="w-24 h-24 mb-4 flex items-center justify-center">
                {imageError ? fallbackIcon : (
                    <img 
                        src={config.gifUrl} 
                        alt={config.name} 
                        className="w-full h-full object-contain" 
                        onError={() => setImageError(true)} 
                    />
                )}
            </div>
            <h3 className="text-2xl font-bold text-sky-400 mb-2">{config.name}</h3>
            <p className="text-slate-300 mb-4 flex-grow">{config.description}</p>
            <div className="font-mono text-lg mb-4">
                <p>Level: <span className="font-bold text-yellow-300">{level}</span></p>
                <p>Bonus: <span className="font-bold text-green-400">+{level * config.bonusPerLevel}</span></p>
            </div>
            <button
                onClick={() => onPurchase(upgradeId)}
                disabled={!canAfford}
                className="w-full mt-auto px-4 py-3 font-bold text-xl rounded-lg transition-all duration-300 disabled:cursor-not-allowed
                           enabled:bg-purple-700 enabled:hover:bg-purple-600 enabled:text-white enabled:transform enabled:hover:scale-105
                           disabled:bg-slate-700 disabled:text-slate-500"
            >
                <div className="flex items-center justify-center gap-2">
                    <span>Upgrade</span>
                    <SoulShardIcon className="w-6 h-6" />
                    <span>{cost}</span>
                </div>
            </button>
        </div>
    );
};


const ArmoryScreen: React.FC<ArmoryScreenProps> = ({ onBack, legacyData, onPurchase }) => {
    return (
        <div className="flex flex-col items-center justify-start h-screen bg-slate-900 text-center p-4 sm:p-6 overflow-y-auto">
            <h1 className="text-5xl font-bold text-sky-400 mt-4 mb-2 tracking-wider">The Armory</h1>
            <p className="text-xl text-slate-300 mb-6">Your legacy lives on. Spend Soul Shards to grow stronger.</p>

            <div className="flex items-center justify-center gap-3 bg-slate-800 border border-purple-500/50 rounded-full px-6 py-2 mb-8 shadow-lg">
                <SoulShardIcon className="w-8 h-8"/>
                <span className="text-3xl font-bold text-purple-300">{legacyData.soulShards}</span>
                <span className="text-xl text-slate-400">Soul Shards</span>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.keys(legacyData.upgrades).map(key => (
                    <UpgradeCard
                        key={key}
                        upgradeId={key as UpgradeType}
                        level={legacyData.upgrades[key as UpgradeType]}
                        soulShards={legacyData.soulShards}
                        onPurchase={onPurchase}
                    />
                ))}
            </div>

            <button
                onClick={onBack}
                className="mt-auto mb-4 px-8 py-3 bg-slate-600 text-white font-bold text-xl rounded-lg hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105"
            >
                Back to Main Menu
            </button>
        </div>
    );
};

export default ArmoryScreen;