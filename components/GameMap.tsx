import React, { useRef, useState, useLayoutEffect } from 'react';
import { Tile, Player, Monster, TileType, Position, Item } from '../types';
import { PlayerIcon, MonsterIcon, StairsIcon, ItemIcon, DoorIcon } from './Icons';
import { TILE_PIXEL_SIZE } from '../constants';

interface GameMapProps {
  map: Tile[][];
  player: Player;
  monsters: Monster[];
  stairs: Position;
  items: Item[];
  onMonsterHover: (monster: Monster | null) => void;
  onSelectMonster: (monster: Monster) => void;
  monsterForTooltip: Monster | null;
}

const getTileClass = (tile: Tile): string => {
  if (!tile.explored) {
    return 'bg-black';
  }
  if (!tile.visible) {
    switch (tile.type) {
      case TileType.WALL: return 'bg-slate-800';
      case TileType.FLOOR:
      case TileType.STAIRS: return 'bg-slate-700';
      case TileType.LOCKED_DOOR: return 'bg-amber-900';
      default: return 'bg-black';
    }
  }
  switch (tile.type) {
    case TileType.WALL: return 'bg-slate-600';
    case TileType.FLOOR:
    case TileType.STAIRS: return 'bg-slate-400';
    case TileType.LOCKED_DOOR: return 'bg-amber-800';
    default: return 'bg-black';
  }
};

const MonsterTooltip: React.FC<{ monster: Monster }> = ({ monster }) => {
  const hpPercentage = (monster.hp / monster.maxHp) * 100;
  return (
    <div className="absolute z-20 p-3 bg-slate-900 border border-red-500 rounded-lg shadow-lg max-w-xs text-sm pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+10px)]">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-lg text-red-400">{monster.name}</h4>
            <span className="font-mono">{monster.hp}/{monster.maxHp} HP</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2 border border-slate-500 mb-2">
          <div className="bg-red-600 h-full rounded-full" style={{ width: `${hpPercentage}%` }}></div>
        </div>
      <p className="italic text-slate-300">{monster.description}</p>
    </div>
  );
};

const HealthBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percentage = max > 0 ? Math.max(0, (current / max) * 100) : 0;
  const barColor = percentage > 60 ? 'bg-green-500' : percentage > 30 ? 'bg-yellow-500' : 'bg-red-600';

  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-900/80 border border-slate-900 rounded-full z-10">
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};


const GameMap: React.FC<GameMapProps> = ({ map, player, monsters, stairs, items, onMonsterHover, onSelectMonster, monsterForTooltip }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.offsetWidth,
          height: viewportRef.current.offsetHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (viewportRef.current) {
        resizeObserver.observe(viewportRef.current);
    }
    
    updateSize(); // Initial size

    return () => resizeObserver.disconnect();
  }, []);

  const cameraX = (viewportSize.width / 2) - ((player.x + 0.5) * TILE_PIXEL_SIZE);
  const cameraY = (viewportSize.height / 2) - ((player.y + 0.5) * TILE_PIXEL_SIZE);

  const MAP_HEIGHT = map.length;
  const MAP_WIDTH = map[0]?.length || 0;
  const worldWidth = MAP_WIDTH * TILE_PIXEL_SIZE;
  const worldHeight = MAP_HEIGHT * TILE_PIXEL_SIZE;
  
  return (
    <div ref={viewportRef} className="w-full h-full overflow-hidden bg-black relative">
      <div
        className="absolute transition-transform duration-100 ease-linear"
        style={{
          width: worldWidth,
          height: worldHeight,
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0)`,
        }}
      >
        {/* Render Tiles */}
        {map.map((row, y) =>
          row.map((tile, x) => (
             (tile.explored) && (
              <div
                key={`${x},${y}`}
                className={`absolute ${getTileClass(tile)}`}
                style={{
                  left: x * TILE_PIXEL_SIZE,
                  top: y * TILE_PIXEL_SIZE,
                  width: TILE_PIXEL_SIZE,
                  height: TILE_PIXEL_SIZE,
                }}
              />
             )
          ))
        )}
        
        {/* Render Scenery and Items */}
        {map.map((row, y) =>
            row.map((tile, x) => {
                if (!tile.visible) return null;
                const key = `scenery_${x}_${y}`;
                if (tile.type === TileType.STAIRS) {
                    return <div key={key} style={{position: 'absolute', left: x * TILE_PIXEL_SIZE, top: y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><StairsIcon /></div>;
                }
                 if (tile.type === TileType.LOCKED_DOOR) {
                    return <div key={key} style={{position: 'absolute', left: x * TILE_PIXEL_SIZE, top: y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><DoorIcon /></div>;
                }
                return null;
            })
        )}

        {items.map(item => map[item.position.y]?.[item.position.x]?.visible && (
            <div key={item.id} style={{position: 'absolute', left: item.position.x * TILE_PIXEL_SIZE, top: item.position.y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><ItemIcon symbol={item.symbol} type={item.type} /></div>
        ))}


        {/* Render Monsters and Player */}
        {monsters.map(monster => map[monster.y]?.[monster.x]?.visible && (
             <div 
                key={monster.id} 
                style={{position: 'absolute', left: monster.x * TILE_PIXEL_SIZE, top: monster.y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onMouseEnter={() => onMonsterHover(monster)} 
                onMouseLeave={() => onMonsterHover(null)}
                onClick={() => onSelectMonster(monster)}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${monster.name}`}
                className="cursor-pointer"
             >
                <div className="relative w-full h-full flex items-center justify-center">
                    <MonsterIcon name={monster.name} spriteType={monster.spriteType} isBoss={monster.isBoss} />
                    <HealthBar current={monster.hp} max={monster.maxHp} />
                </div>
             </div>
        ))}
        
        <div style={{position: 'absolute', left: player.x * TILE_PIXEL_SIZE, top: player.y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="relative w-full h-full flex items-center justify-center">
                <PlayerIcon playerClass={player.playerClass} />
                <HealthBar current={player.hp} max={player.maxHp} />
            </div>
        </div>
        
        {/* Render Tooltip */}
        {monsterForTooltip && (
             <div className="absolute" style={{left: (monsterForTooltip.x + 0.5) * TILE_PIXEL_SIZE, top: monsterForTooltip.y * TILE_PIXEL_SIZE}}>
                <MonsterTooltip monster={monsterForTooltip} />
             </div>
        )}

      </div>
    </div>
  );
};

export default GameMap;