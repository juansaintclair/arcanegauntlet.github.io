

export enum TileType {
  FLOOR,
  WALL,
  STAIRS,
  LOCKED_DOOR,
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export enum GameState {
  START_SCREEN,
  PLAYING,
  GAME_OVER,
  GENERATING,
  LEADERBOARD,
  ARMORY,
}

export enum PlayerClass {
    WARRIOR,
    GUARDIAN,
}

export enum ItemType {
    ATTACK_BOOST,
    DEFENSE_BOOST,
    HEALTH_POTION,
    KEY,
    STEP_BOOST,
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
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  playerClass: PlayerClass;
  keysHeld: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  steps: number;
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

export interface LeaderboardEntry {
    id: string;
    name: string;
    floor: number;
    time: number; // in seconds
    createdAt: number;
}

// Meta-progression Types
export type UpgradeType = 'ATTACK' | 'DEFENSE' | 'HP' | 'STEPS';

export interface Upgrade {
    id: UpgradeType;
    name: string;
    description: string;
    baseCost: number;
    bonusPerLevel: number;
    gifUrl: string;
}

export interface LegacyData {
    soulShards: number;
    upgrades: Record<UpgradeType, number>;
}