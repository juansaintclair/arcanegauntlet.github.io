
import React from 'react';
import { RELICS_CONFIG } from '../constants';

interface RelicCompendiumScreenProps {
  onBack: () => void;
}

const RelicCompendiumScreen: React.FC<RelicCompendiumScreenProps> = ({ onBack }) => {
    const relics = Object.values(RELICS_CONFIG);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
            <h1 className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider">Relic Compendium</h1>
            <div className="w-full max-w-4xl bg-slate-800/50 border-2 border-yellow-500/50 rounded-lg p-4">
                <div className="h-[60vh] overflow-y-auto pr-2">
                    <div className="flex flex-col gap-4">
                        {relics.map(relic => (
                            <div key={relic.id} className="text-left p-4 bg-slate-800 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{relic.symbol}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-yellow-300">{relic.name}</h2>
                                        <p className="text-slate-300">{relic.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button
                onClick={onBack}
                className="mt-6 px-8 py-3 bg-slate-600 text-white font-bold text-xl rounded-lg hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105"
            >
                Back to Main Menu
            </button>
        </div>
    );
};

export default RelicCompendiumScreen;
