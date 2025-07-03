
export enum TileType {
  FLOOR,
  WALL,
  STAIRS,
}

export enum GameState {
  START_SCREEN,
  PLAYING,
  GAME_OVER,
  GENERATING,
}

export enum PlayerClass {
    WARRIOR,
    GUARDIAN,
}

export enum ItemType {
    ATTACK_BOOST,
    DEFENSE_BOOST,
    HEALTH_POTION,
}

export interface Tile {
  type: TileType;
  visible: boolean;
  explored: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Item {
    id: string;
    position: Position;
    type: ItemType;
    value: number;
    name: string;
    symbol: string;
    description: string;
}

export interface Player extends Position {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  playerClass: PlayerClass;
}

export interface Monster extends Position {
  id: string;
  hp: number;
  maxHp: number;
  attack: number;
  name: string;
  spriteType: string;
  description: string;
  isBoss?: boolean;
}

export interface GameData {
  map: Tile[][];
  player: Player;
  monsters: Monster[];
  stairs: Position;
  items: Item[];
}

export interface ProceduralMonster {
    name: string;
    spriteType: string;
    description: string;
    isBoss?: boolean;
}

export interface LevelGenerationResponse {
    theme: string;
    monsters: ProceduralMonster[];
}
