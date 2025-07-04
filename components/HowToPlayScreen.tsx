
import React from 'react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold text-sky-400 mb-3 border-b-2 border-sky-500/50 pb-1">{title}</h2>
        <div className="text-slate-300 space-y-2 text-left text-base">{children}</div>
    </div>
);

const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center justify-start h-screen bg-slate-900 text-center p-4 sm:p-6 overflow-y-auto">
            <h1 className="text-5xl font-bold text-green-400 mt-4 mb-6 tracking-wider">How to Play</h1>
            
            <div className="w-full max-w-4xl bg-slate-800/50 border-2 border-green-500/50 rounded-lg p-6">
                <div className="h-[65vh] overflow-y-auto pr-4 text-left">
                    
                    <Section title="The Goal">
                        <p>Descend as deep into the Arcane Gauntlet as you can. Each floor is filled with monsters, items, and a staircase to the next level. The game is turn-based: every action you take allows every monster on the level to take an action as well.</p>
                    </Section>

                    <Section title="Controls">
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Desktop:</strong> Use <kbd className="font-sans bg-slate-700 px-2 py-1 rounded">Arrow Keys</kbd> or <kbd className="font-sans bg-slate-700 px-2 py-1 rounded">WASD</kbd> to move and attack adjacent monsters.</li>
                            <li><strong>Mobile (D-Pad):</strong> Use the on-screen D-Pad for precise, single-step movements. Ideal for tactical combat.</li>
                            <li><strong>Mobile (Tap-to-Move):</strong> Tap any explored tile to automatically walk there. The path will be highlighted.</li>
                            <li><strong>Mobile (Tap-to-Interact):</strong> Tap on a monster, item, door, or stairs to automatically move to and interact with it. This is the most intuitive way to play on a touchscreen.</li>
                        </ul>
                    </Section>

                    <Section title="Core Mechanics">
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Classes</h3>
                        <p>Choose your playstyle at the start of a run:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><span className="font-bold text-red-400">Warrior:</span> A master of offense. Starts with higher Attack and lower Defense.</li>
                            <li><span className="font-bold text-sky-400">Guardian:</span> A stalwart defender. Starts with higher Defense and lower Attack.</li>
                        </ul>
                        <h3 className="text-xl font-bold text-slate-200 mt-4 mb-2">Procedural Generation</h3>
                        <p>Every floor of the dungeon is generated from scratch. Layouts, monster placements, and item locations are always different. Every 5th floor is a special "Boss Arena" with a powerful guardian.</p>
                    </Section>

                     <Section title="Legacy System: The Armory">
                        <p>Death is not the end! When you are defeated, you leave behind a legacy in the form of <span className="text-purple-400 font-bold">Soul Shards</span>. These are a permanent currency you can spend in **The Armory** (from the main menu) on powerful, permanent upgrades that apply to all future runs.</p>
                    </Section>

                    <Section title="Relic System">
                        <p>Relics are powerful passive items found at rare <span className="text-yellow-400 font-bold">Ancient Altars</span>. They provide unique bonuses that last only for the current run. You can view all possible relics in the "Relic Compendium" from the main menu.</p>
                    </Section>
                </div>
            </div>

            <button
                onClick={onBack}
                className="mt-6 mb-4 px-8 py-3 bg-slate-600 text-white font-bold text-xl rounded-lg hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105"
            >
                Back to Main Menu
            </button>
        </div>
    );
};

export default HowToPlayScreen;
