import { getMapDimensionsForLevel } from '../constants';
import { Tile, TileType, GameData, Monster, Position, ProceduralMonster, Item, ItemType } from '../types';

class Room {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public center: Position;

    constructor(x: number, y: number, w: number, h: number) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + w;
        this.y2 = y + h;
        this.center = { x: Math.floor((this.x1 + this.x2) / 2), y: Math.floor((this.y1 + this.y2) / 2) };
    }

    intersects(other: Room): boolean {
        return this.x1 <= other.x2 && this.x2 >= other.x1 && this.y1 <= other.y2 && this.y2 >= other.y1;
    }
}

const createRoom = (map: Tile[][], room: Room) => {
    for (let x = room.x1 + 1; x < room.x2; x++) {
        for (let y = room.y1 + 1; y < room.y2; y++) {
            map[y][x].type = TileType.FLOOR;
        }
    }
};

const createHTunnel = (map: Tile[][], x1: number, x2: number, y: number) => {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        map[y][x].type = TileType.FLOOR;
    }
};

const createVTunnel = (map: Tile[][], y1: number, y2: number, x: number) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        map[y][x].type = TileType.FLOOR;
    }
};

const placeMonsters = (rooms: Room[], level: number, generatedMonsters: ProceduralMonster[]): Monster[] => {
    const monsters: Monster[] = [];
    if (generatedMonsters.length === 0) return monsters;

    rooms.slice(1).forEach(room => { // Skip the first room (player start)
        // Guarantees at least 1 monster and scales the max number with the level.
        const numMonsters = 1 + Math.floor(Math.random() * (1 + Math.floor(level / 2)));
        for (let i = 0; i < numMonsters; i++) {
            const x = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
            const y = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;
            
            const monsterTemplate = generatedMonsters[Math.floor(Math.random() * generatedMonsters.length)];
            
            // Increased monster strength for a better challenge.
            const hp = 12 + Math.floor(level * 3.5);
            const attack = 2 + Math.floor(level * 1.8);

            monsters.push({
                id: `m_${x}_${y}_${Date.now()}`,
                x,
                y,
                hp,
                maxHp: hp,
                attack,
                ...monsterTemplate
            });
        }
    });
    return monsters;
};

const placeBoss = (room: Room, level: number, bossTemplate: ProceduralMonster): Monster => {
    // Buffed scaling to make bosses a continued threat.
    const bossHp = 50 + Math.floor(level * 10);
    const bossAttack = 8 + Math.floor(level * 2.5);
    
    return {
        id: `boss_${level}`,
        ...room.center,
        hp: bossHp,
        maxHp: bossHp,
        attack: bossAttack,
        ...bossTemplate,
        isBoss: true
    };
};

export const generateDungeon = (level: number, generatedMonsters: ProceduralMonster[], isBossLevel: boolean): Omit<GameData, 'player'> & { startingPosition: Position } => {
    const { width: MAP_WIDTH, height: MAP_HEIGHT } = getMapDimensionsForLevel(level);

    const map: Tile[][] = Array.from({ length: MAP_HEIGHT }, () =>
        Array.from({ length: MAP_WIDTH }, () => ({ type: TileType.WALL, visible: false, explored: false }))
    );

    if (isBossLevel) {
        // Create a single large arena for the boss
        const arena = new Room(5, 5, MAP_WIDTH - 10, MAP_HEIGHT - 10);
        createRoom(map, arena);
        const startingPosition = { x: arena.center.x, y: arena.y2 - 2 };
        const boss = placeBoss(arena, level, generatedMonsters[0]);
        
        const stairs: Position = { x: boss.x, y: boss.y };
        
        return { map, monsters: [boss], stairs, items: [], startingPosition };
    }

    // Standard level generation
    const rooms: Room[] = [];
    const maxRooms = 6 + level; // Dungeon complexity scales with level, starting simpler.
    const minRoomSize = 6;
    const maxRoomSize = 10 + Math.floor(level / 4); // Room size scales slightly

    for (let i = 0; i < maxRooms; i++) {
        const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize)) + minRoomSize;
        const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize)) + minRoomSize;
        const x = Math.floor(Math.random() * (MAP_WIDTH - w - 2)) + 1;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - h - 2)) + 1;

        const newRoom = new Room(x, y, w, h);
        if (!rooms.some(room => newRoom.intersects(room))) {
            if (rooms.length !== 0) {
                const prevRoom = rooms[rooms.length - 1];
                if (Math.random() > 0.5) {
                    createHTunnel(map, prevRoom.center.x, newRoom.center.x, prevRoom.center.y);
                    createVTunnel(map, prevRoom.center.y, newRoom.center.y, newRoom.center.x);
                } else {
                    createVTunnel(map, prevRoom.center.y, newRoom.center.y, prevRoom.center.x);
                    createHTunnel(map, prevRoom.center.x, newRoom.center.x, newRoom.center.y);
                }
            }
            createRoom(map, newRoom);
            rooms.push(newRoom);
        }
    }
    
    if (rooms.length === 0) {
        const room = new Room(5,5,10,10);
        createRoom(map, room);
        rooms.push(room);
    }

    const startingPosition = rooms[0].center;
    const lastRoom = rooms[rooms.length - 1];
    const stairs: Position = lastRoom.center;
    let doorPosition: Position | null = null;

    // Create a sealed 3x3 alcove for the stairs.
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            const y = stairs.y + yOffset;
            const x = stairs.x + xOffset;
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                map[y][x].type = TileType.WALL;
            }
        }
    }

    map[stairs.y][stairs.x].type = TileType.STAIRS;
    
    const candidates = [
        { door: { x: stairs.x, y: stairs.y - 1 }, check: { x: stairs.x, y: stairs.y - 2 } },
        { door: { x: stairs.x, y: stairs.y + 1 }, check: { x: stairs.x, y: stairs.y + 2 } },
        { door: { x: stairs.x - 1, y: stairs.y }, check: { x: stairs.x - 2, y: stairs.y } },
        { door: { x: stairs.x + 1, y: stairs.y }, check: { x: stairs.x + 2, y: stairs.y } },
    ].sort(() => Math.random() - 0.5);

    for (const { door, check } of candidates) {
        if (map[check.y]?.[check.x]?.type === TileType.FLOOR) {
            map[door.y][door.x].type = TileType.LOCKED_DOOR;
            doorPosition = door;
            break;
        }
    }

    if (!doorPosition) {
        const fallbackCandidates = [
            { x: stairs.x, y: stairs.y - 1 }, { x: stairs.x, y: stairs.y + 1 },
            { x: stairs.x - 1, y: stairs.y }, { x: stairs.x + 1, y: stairs.y },
        ].filter(p => p.x > lastRoom.x1 && p.x < lastRoom.x2 && p.y > lastRoom.y1 && p.y < lastRoom.y2)
         .sort(() => Math.random() - 0.5);
        
        if (fallbackCandidates.length > 0) {
            const pos = fallbackCandidates[0];
            map[pos.y][pos.x].type = TileType.LOCKED_DOOR;
            doorPosition = pos;
        }
    }
    
    const monsters = placeMonsters(rooms, level, generatedMonsters);
    
    const items: Item[] = [];
    const occupiedPositions = new Set(monsters.map(m => `${m.x},${m.y}`));
    occupiedPositions.add(`${stairs.x},${stairs.y}`);
    if (doorPosition) {
        occupiedPositions.add(`${doorPosition.x},${doorPosition.y}`);
    }

    // Place required keys if a door exists.
    if (doorPosition) {
        const requiredKeys = 1 + Math.floor((level - 1) / 5);
        for (let k = 0; k < requiredKeys; k++) {
            const keyRoomPool = rooms.slice(1, -1);
            const roomForPlacement = keyRoomPool.length > 0 ? keyRoomPool[Math.floor(Math.random() * keyRoomPool.length)] : rooms[0];
            let keyX, keyY, attempts = 0;
            const MAX_ATTEMPTS = 50;
            do {
                keyX = Math.floor(Math.random() * (roomForPlacement.x2 - roomForPlacement.x1 - 1)) + roomForPlacement.x1 + 1;
                keyY = Math.floor(Math.random() * (roomForPlacement.y2 - roomForPlacement.y1 - 1)) + roomForPlacement.y1 + 1;
                attempts++;
            } while (occupiedPositions.has(`${keyX},${keyY}`) && attempts < MAX_ATTEMPTS);

            if (attempts < MAX_ATTEMPTS) {
                const position = { x: keyX, y: keyY };
                occupiedPositions.add(`${keyX},${keyY}`);
                items.push({
                    id: `item_key_${level}_${k}`, position, type: ItemType.KEY, value: 1,
                    name: "Dungeon Key", symbol: '🔑', description: "Unlocks a special door on this level."
                });
            }
        }
    }

    const numberOfItems = 1 + Math.floor(Math.random() * 3);
    const validRoomsForItems = rooms.slice(1);

    if (validRoomsForItems.length > 0) {
        for (let i = 0; i < numberOfItems; i++) {
            const room = validRoomsForItems[Math.floor(Math.random() * validRoomsForItems.length)];
            let itemX, itemY, attempts = 0;
            const MAX_ATTEMPTS = 50;

            do {
                itemX = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
                itemY = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;
                attempts++;
            } while (occupiedPositions.has(`${itemX},${itemY}`) && attempts < MAX_ATTEMPTS);

            if (attempts < MAX_ATTEMPTS) {
                const position = { x: itemX, y: itemY };
                occupiedPositions.add(`${itemX},${itemY}`);

                const rand = Math.random();
                if (rand < 0.08) {
                    items.push({
                        id: `item_${Date.now()}_${i}`, position, type: ItemType.ATTACK_BOOST, value: 1,
                        name: "Sharpening Stone", symbol: '▲', description: "Permanently increases Attack by 1."
                    });
                } else if (rand < 0.16) {
                     items.push({
                        id: `item_${Date.now()}_${i}`, position, type: ItemType.DEFENSE_BOOST, value: 1,
                        name: "Iron Plates", symbol: '⬟', description: "Permanently increases Defense by 1."
                    });
                } else if (rand < 0.45) {
                    const stepValue = 50 + Math.floor(level / 3) * 10;
                    items.push({
                        id: `item_step_${Date.now()}_${i}`, position, type: ItemType.STEP_BOOST, value: stepValue,
                        name: "Trail Rations", symbol: '🥖', description: `Restores energy, granting ${stepValue} steps.`
                    });
                } else {
                     items.push({
                        id: `item_${Date.now()}_${i}`, position, type: ItemType.HEALTH_POTION, value: 40,
                        name: "Healing Salve", symbol: '♥', description: "Restores 40% of max HP."
                    });
                }
            }
        }
    }

    return { map, monsters, stairs, items, startingPosition };
};