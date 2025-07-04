

import { LegacyData, Upgrade, UpgradeType } from '../types';
import { UPGRADE_GIFS } from '../constants';

const LEGACY_STORAGE_KEY = 'arcaneGauntletLegacy-secure';

export const UPGRADES_CONFIG: Record<UpgradeType, Upgrade> = {
    'ATTACK': {
        id: 'ATTACK',
        name: 'Ancestral Blade',
        description: 'Start with a permanent bonus to your Attack.',
        baseCost: 25,
        bonusPerLevel: 1,
        gifUrl: UPGRADE_GIFS.ATTACK,
    },
    'DEFENSE': {
        id: 'DEFENSE',
        name: 'Aegis of the Fallen',
        description: 'Start with a permanent bonus to your Defense.',
        baseCost: 25,
        bonusPerLevel: 1,
        gifUrl: UPGRADE_GIFS.DEFENSE,
    },
    'HP': {
        id: 'HP',
        name: 'Stalwart Potion',
        description: 'Start with a permanent bonus to your Max HP.',
        baseCost: 20,
        bonusPerLevel: 5,
        gifUrl: UPGRADE_GIFS.HP,
    },
    'STEPS': {
        id: 'STEPS',
        name: 'Endless Vigor',
        description: 'Start with more energy for your journey.',
        baseCost: 50,
        bonusPerLevel: 10,
        gifUrl: UPGRADE_GIFS.STEPS,
    }
};

const defaultLegacyData: LegacyData = {
    soulShards: 0,
    upgrades: {
        ATTACK: 0,
        DEFENSE: 0,
        HP: 0,
        STEPS: 0,
    },
};

// A simple "secret" key that's part of the source code.
// While not truly secure against a determined user, it prevents casual tampering.
const SIGNATURE_KEY = 'b64-encoded-secret-for-arcanegauntlet';

export const legacyService = {
    loadLegacyData(): LegacyData {
        try {
            const rawData = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (!rawData) {
                return defaultLegacyData;
            }

            const { payload, signature } = JSON.parse(rawData);
            if (!payload || !signature) {
                console.warn('Save data is malformed. Resetting progress.');
                return defaultLegacyData;
            }

            // Re-create the signature and check for a match
            const expectedSignature = btoa(`${payload}${SIGNATURE_KEY}`);
            if (signature !== expectedSignature) {
                console.warn('Save data signature mismatch. Progress has been tampered with. Resetting.');
                localStorage.removeItem(LEGACY_STORAGE_KEY); // Remove the fraudulent data
                return defaultLegacyData;
            }

            const parsed = JSON.parse(payload);
            
            // Ensure the parsed data has the correct structure before returning
            if (parsed.soulShards !== undefined && parsed.upgrades) {
                 // Ensure all upgrade keys exist
                const upgrades = { ...defaultLegacyData.upgrades, ...parsed.upgrades };
                return { ...parsed, upgrades };
            }

        } catch (e) {
            console.error("Failed to load or parse legacy data. Resetting progress.", e);
        }
        
        // If anything goes wrong, reset to default.
        return defaultLegacyData;
    },

    saveLegacyData(data: LegacyData): void {
        try {
            const payload = JSON.stringify(data);
            const signature = btoa(`${payload}${SIGNATURE_KEY}`);
            const dataToStore = JSON.stringify({ payload, signature });
            localStorage.setItem(LEGACY_STORAGE_KEY, dataToStore);
        } catch (e) {
            console.error("Failed to save legacy data", e);
        }
    },
    
    getUpgradeCost(type: UpgradeType, currentLevel: number): number {
        const config = UPGRADES_CONFIG[type];
        // Using a slightly more aggressive scaling factor for longevity
        return Math.floor(config.baseCost * Math.pow(1.6, currentLevel));
    },

    getUpgradeBonuses(upgrades: Record<UpgradeType, number>): Record<string, number> {
        const bonuses: Record<string, number> = {
            attack: 0,
            defense: 0,
            maxHp: 0,
            steps: 0
        };

        (Object.keys(upgrades) as UpgradeType[]).forEach(key => {
            const level = upgrades[key];
            const config = UPGRADES_CONFIG[key];
            if (level > 0) {
                 switch(key) {
                    case 'ATTACK': bonuses.attack += config.bonusPerLevel * level; break;
                    case 'DEFENSE': bonuses.defense += config.bonusPerLevel * level; break;
                    case 'HP': bonuses.maxHp += config.bonusPerLevel * level; break;
                    case 'STEPS': bonuses.steps += config.bonusPerLevel * level; break;
                }
            }
        });
        return bonuses;
    },
};