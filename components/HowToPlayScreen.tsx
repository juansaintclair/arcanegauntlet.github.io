

import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold text-sky-400 mb-3 border-b-2 border-sky-500/30 pb-1">{title}</h2>
        <div className="text-slate-300 space-y-2 leading-relaxed">
            {children}
        </div>
    </div>
);

const HowToPlayScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
            <h1 className="text-5xl font-bold text-green-400 mb-6 tracking-wider">How to Play</h1>
            <div className="w-full max-w-4xl bg-slate-800/50 border-2 border-green-500/50 rounded-lg p-6 text-left">
                <div className="h-[60vh] overflow-y-auto pr-4 space-y-4">
                    
                    <Section title="The Goal">
                        <p>
                            Descend as deep into the Arcane Gauntlet as you can. Each floor is procedurally generated and filled with monsters, items, and a staircase to the next level. The game is turn-based: every action you take (moving or attacking) allows every monster on the level to take an action as well.
                        </p>
                    </Section>
                    
                    <Section title="Controls">
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Desktop Controls:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li><strong>Movement:</strong> Use the <strong>Arrow Keys</strong> or <strong>WASD</strong> keys.</li>
                                    <li><strong>Melee Attack (Warrior/Guardian):</strong> Move into an adjacent enemy to attack.</li>
                                    <li><strong>Ranged Attack (Mage):</strong> Press the <strong>'T' key or Spacebar</strong> to automatically fire at the nearest visible enemy.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Mobile Controls:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li>Use the on-screen <strong>D-Pad</strong> for precise, single-step movements.</li>
                                    <li><strong>Tap-to-Move:</strong> Tap any explored tile to automatically walk there.</li>
                                    <li><strong>Tap-to-Interact:</strong> Tap a monster, item, or door to automatically move towards it and interact.</li>
                                </ul>
                            </li>
                        </ul>
                    </Section>

                    <Section title="Core Mechanics">
                        <h3 className="text-xl font-bold text-yellow-300 mb-2">Classes</h3>
                        <p>Choose your path at the start of each run:</p>
                        <ul className="list-disc list-inside ml-6">
                            <li><strong>Warrior:</strong> A master of offense. Starts with high Attack and low Defense.</li>
                            <li><strong>Guardian:</strong> A stalwart defender. Starts with high Defense and low Attack.</li>
                            <li><strong>Mage:</strong> A fragile but powerful caster who attacks from a distance. High attack, low defense.</li>
                        </ul>
                        
                        <h3 className="text-xl font-bold text-yellow-300 mt-4 mb-2">The Armory (Legacy System)</h3>
                        <p>
                            Death is not the end! After a run, you earn <strong>Soul Shards</strong>. Spend them in The Armory on permanent upgrades that apply to all future characters, strengthening your legacy.
                        </p>

                        <h3 className="text-xl font-bold text-yellow-300 mt-4 mb-2">Relics</h3>
                        <p>
                            Relics are powerful passive items found at rare altars. Their effects last only for the current run, creating unique and powerful combinations each time you play. Check the "Relic Compendium" from the main menu for a full list.
                        </p>
                    </Section>
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

export default HowToPlayScreen;
