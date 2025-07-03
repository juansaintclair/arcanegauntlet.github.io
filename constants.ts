

export const BASE_MAP_WIDTH = 50;
export const BASE_MAP_HEIGHT = 20;
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