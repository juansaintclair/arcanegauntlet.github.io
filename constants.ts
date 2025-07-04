

import { Relic, RelicType } from './types';

export const BASE_MAP_WIDTH = 40;
export const BASE_MAP_HEIGHT = 30;
export const TILE_PIXEL_SIZE = 64; // Visual size of a tile in pixels

/**
 * Caminhos para os GIFs animados dos jogadores na pasta /assets.
 * Coloque seus GIFs na pasta /assets com os nomes correspondentes.
 * Para melhores resultados, use GIFs com fundo transparente.
 */
export const WARRIOR_GIF_URL = "/assets/player/Warrior.gif";
export const GUARDIAN_GIF_URL = '/assets/player/Guardian.gif';


/**
 * Mapeamento dos tipos de monstros para seus respectivos GIFs na pasta /assets.
 * Você pode adicionar novos monstros ou alterar os GIFs existentes aqui,
 * apenas certifique-se de que o arquivo GIF correspondente esteja na pasta /assets.
 * A chave 'default' é usada caso um tipo de monstro não seja encontrado.
 */
export const MONSTER_GIFS: { [key: string]: string } = {
    goblin: '/assets/monsters/Goblin.gif',
    skeleton: '/assets/monsters/Skeleton.gif',
    slime: '/assets/monsters/Slime.gif',
    bat: '/assets/monsters/Bat.gif',
    orc: '/assets/monsters/Orc.gif',
    undead: '/assets/monsters/Undead.gif',
    beast: '/assets/monsters/Beast.gif',
    demon: '/assets/monsters/Demon.gif',
    boss: '/assets/monsters/Boss.gif', // GIF especial para chefes
    default: '/assets/monsters/Slime.gif', // Fallback
};

/**
 * Caminhos para os GIFs dos upgrades permanentes na pasta /assets.
 * Coloque seus GIFs na pasta /assets/upgrades/ com os nomes correspondentes.
 */
export const UPGRADE_GIFS: { [key: string]: string } = {
    ATTACK: '/assets/upgrades/Attack.gif',
    DEFENSE: '/assets/upgrades/Defense.gif',
    HP: '/assets/upgrades/Health.gif',
    STEPS: '/assets/upgrades/Steps.gif',
};


/**
 * Calculates the map dimensions for a given level.
 * The map grows by 2 units in width and height for each level after the first.
 * @param level The current dungeon level (starting from 1).
 * @returns An object containing the calculated width and height.
 */
export const getMapDimensionsForLevel = (level: number) => {
    const width = BASE_MAP_WIDTH + (level - 1) * 2;
    const height = BASE_MAP_HEIGHT + (level - 1) * 2;
    return { width, height };
};

export const RELICS_CONFIG: Record<RelicType, Relic> = {
    'VAMPIRIC_FANG': {
        id: 'VAMPIRIC_FANG',
        name: "Vampiric Fang",
        description: "Heals you for 1 HP whenever you deal attack damage.",
        symbol: "🩸",
    },
    'THORNS_SHIELD': {
        id: 'THORNS_SHIELD',
        name: "Thorns Shield",
        description: "Deals damage back to attackers based on your Defense.",
        symbol: "🛡️",
    },
    'AMULET_OF_KNOWLEDGE': {
        id: 'AMULET_OF_KNOWLEDGE',
        name: "Amulet of Knowledge",
        description: "Gain double XP from defeating monsters.",
        symbol: "🎓",
    },
    'SOUL_CATCHER': {
        id: 'SOUL_CATCHER',
        name: "Soul Catcher",
        description: "Collect 50% more Soul Shards from fallen foes.",
        symbol: "💎",
    },
    'GOLEM_HEART': {
        id: 'GOLEM_HEART',
        name: "Golem Heart",
        description: "Regenerates 1 HP every 20 steps you take.",
        symbol: "💖",
    }
};
