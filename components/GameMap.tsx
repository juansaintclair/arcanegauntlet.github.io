
import React from 'react';
import { Tile, Player, Monster, TileType, Position, Item, PlayerClass } from '../types';
import { PlayerIcon, MonsterIcon, StairsIcon, ItemIcon } from './Icons';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

interface GameMapProps {
  map: Tile[][];
  player: Player;
  monsters: Monster[];
  stairs: Position;
  items: Item[];
  onMonsterHover: (monster: Monster | null) => void;
  onSelectMonster: (monster: Monster) => void;
}

const getTileClass = (tile: Tile): string => {
  if (!tile.explored) {
    return 'bg-black'; // Unseen area
  }
  
  // Explored but not visible
  if (!tile.visible) {
    switch (tile.type) {
      case TileType.WALL:
        return 'bg-slate-800'; // Darkest shade for walls you've seen
      case TileType.FLOOR:
      case TileType.STAIRS:
        return 'bg-slate-700'; // Dark, but clearly walkable path
      default:
        return 'bg-black';
    }
  }

  // Currently visible area
  switch (tile.type) {
    case TileType.WALL:
      return 'bg-slate-600'; // Lighter walls in line of sight
    case TileType.FLOOR:
    case TileType.STAIRS:
      return 'bg-slate-400'; // Brightest for walkable area in sight
    default:
        return 'bg-black';
  }
};


const GameMap: React.FC<GameMapProps> = ({ map, player, monsters, stairs, items, onMonsterHover, onSelectMonster }) => {
  const monsterPositions = new Map<string, Monster>();
  monsters.forEach(m => monsterPositions.set(`${m.x},${m.y}`, m));
  
  const itemPositions = new Map<string, Item>();
  items.forEach(i => itemPositions.set(`${i.position.x},${i.position.y}`, i));


  const renderTileContent = (x: number, y: number) => {
    const monster = monsterPositions.get(`${x},${y}`);
    const item = itemPositions.get(`${x},${y}`);

    // Render priority: Player > Monster > Item > Stairs
    if (player.x === x && player.y === y) return <PlayerIcon playerClass={player.playerClass} />;

    if (monster) {
      return (
        <div 
          onMouseEnter={() => onMonsterHover(monster)} 
          onMouseLeave={() => onMonsterHover(null)}
          onClick={() => onSelectMonster(monster)}
          role="button"
          tabIndex={0}
          aria-label={`Inspect ${monster.name}`}
          className="cursor-pointer w-full h-full flex items-center justify-center"
        >
            <MonsterIcon name={monster.name} spriteType={monster.spriteType} isBoss={monster.isBoss} />
        </div>
      );
    }
    
    if (item) {
        return <ItemIcon symbol={item.symbol} type={item.type} />;
    }
    
    // Correctly render stairs only if the tile type is STAIRS
    if (map[y][x].type === TileType.STAIRS) {
        return <StairsIcon />;
    }

    return null;
  };

  return (
      <div
        className="grid font-mono text-center leading-none w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${MAP_WIDTH}, 1fr)`,
          gridTemplateRows: `repeat(${MAP_HEIGHT}, 1fr)`,
        }}
      >
        {map.map((row, y) =>
          row.map((tile, x) => (
            <div
              key={`${x},${y}`}
              className={`flex items-center justify-center ${getTileClass(tile)}`}
            >
              {tile.visible ? renderTileContent(x, y) : tile.explored && tile.type === TileType.WALL ? '' : ' '}
            </div>
          ))
        )}
      </div>
  );
};

export default GameMap;