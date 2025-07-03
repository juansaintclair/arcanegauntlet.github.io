
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
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
        const numMonsters = Math.floor(Math.random() * (Math.min(level, 3) + 1)); 
        for (let i = 0; i < numMonsters; i++) {
            const x = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
            const y = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;
            
            const monsterTemplate = generatedMonsters[Math.floor(Math.random() * generatedMonsters.length)];
            
            // Smoother difficulty scaling
            const hp = 10 + Math.floor(level * 3);
            const attack = 2 + Math.floor(level * 1.2);

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
    // Re-tuned for a more manageable first boss fight, but still scaling.
    const bossHp = 30 + Math.floor(level * 7);
    const bossAttack = 5 + Math.floor(level * 1.6);
    
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
    const map: Tile[][] = Array.from({ length: MAP_HEIGHT }, () =>
        Array.from({ length: MAP_WIDTH }, () => ({ type: TileType.WALL, visible: false, explored: false }))
    );

    if (isBossLevel) {
        // Create a single large arena for the boss
        const arena = new Room(5, 5, MAP_WIDTH - 10, MAP_HEIGHT - 10);
        createRoom(map, arena);
        const startingPosition = { x: arena.center.x, y: arena.y2 - 2 };
        const boss = placeBoss(arena, level, generatedMonsters[0]);
        
        // The stairs position is recorded, but the tile is not created yet.
        // It will be spawned by the game logic after the boss is defeated.
        const stairs: Position = { x: boss.x, y: boss.y };
        
        return { map, monsters: [boss], stairs, items: [], startingPosition };
    }

    // Standard level generation
    const rooms: Room[] = [];
    const maxRooms = 12;
    const minRoomSize = 6;
    const maxRoomSize = 10;

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
    const stairs: Position = rooms[rooms.length - 1].center;
    map[stairs.y][stairs.x].type = TileType.STAIRS;
    
    const monsters = placeMonsters(rooms, level, generatedMonsters);
    
    const items: Item[] = [];
    const occupiedPositions = new Set(monsters.map(m => `${m.x},${m.y}`));
    occupiedPositions.add(`${stairs.x},${stairs.y}`);

    // Fewer items on early levels
    const numberOfItems = level < 3 ? Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2); // 0-1 on L1-2, 1-2 on L3+
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
                // Health potions are rarer: 15% HP, 42.5% ATK, 42.5% DEF
                if (rand < 0.15) { 
                     items.push({
                        id: `item_${Date.now()}_${i}`, position, type: ItemType.HEALTH_POTION, value: 40,
                        name: "Healing Salve", symbol: '♥', description: "Restores 40% of max HP."
                    });
                } else if (rand < 0.575) {
                    items.push({
                        id: `item_${Date.now()}_${i}`, position, type: ItemType.ATTACK_BOOST, value: 2,
                        name: "Sharpening Stone", symbol: '▲', description: "Attack +2."
                    });
                } else {
                    items.push({
                        id: `item_${Date.now()}_${i}`, position, type: ItemType.DEFENSE_BOOST, value: 1,
                        name: "Iron Plates", symbol: '⬟', description: "Defense +1."
                    });
                }
            }
        }
    }

    return { map, monsters, stairs, items, startingPosition };
};