

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Tile, Player, Monster, TileType, Position, Item, Projectile } from '../types';
import { PlayerIcon, MonsterIcon, StairsIcon, ItemIcon, DoorIcon } from './Icons';
import { TILE_PIXEL_SIZE } from '../constants';

interface GameMapProps {
  map: Tile[][];
  player: Player;
  monsters: Monster[];
  stairs: Position;
  items: Item[];
  projectiles: Projectile[];
  onTileClick: (pos: Position) => void;
  onProjectileHit: (projectileId: string) => void;
  currentPath: Position[];
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

const HealthBar: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-800/80 border border-black/50 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const ProjectileVisual: React.FC<{ projectile: Projectile, onHit: (id: string) => void }> = ({ projectile, onHit }) => {
    const [position, setPosition] = useState({ 
        left: projectile.start.x * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
        top: projectile.start.y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
    });
    const hasFired = useRef(false);

    useEffect(() => {
        // This effect runs once to fire the projectile
        if (!hasFired.current) {
            setPosition({
                left: projectile.end.x * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
                top: projectile.end.y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
            });
            hasFired.current = true;
        }
    }, [projectile.end.x, projectile.end.y]);

    return (
        <div
            className="absolute w-4 h-4 bg-cyan-400 rounded-full transition-all duration-200 ease-linear pointer-events-none"
            style={{
                ...position,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 8px 2px #22d3ee, 0 0 4px 1px #67e8f9',
            }}
            onTransitionEnd={() => onHit(projectile.id)}
        />
    );
};

const GameMap: React.FC<GameMapProps> = ({ map, player, monsters, stairs, items, projectiles, onTileClick, onProjectileHit, currentPath }) => {
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
                onClick={() => onTileClick({ x, y })}
              />
             )
          ))
        )}

        {/* Render Path Visualization */}
        {currentPath.map((pos, index) => (
          <div
            key={`path_${index}`}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: pos.x * TILE_PIXEL_SIZE,
              top: pos.y * TILE_PIXEL_SIZE,
              width: TILE_PIXEL_SIZE,
              height: TILE_PIXEL_SIZE,
            }}
          >
            <div className="w-3 h-3 bg-sky-400/50 rounded-full animate-pulse"></div>
          </div>
        ))}
        
        {/* Render Scenery */}
        {map.map((row, y) =>
            row.map((tile, x) => {
                if (!tile.visible) return null;
                const key = `scenery_${x}_${y}`;
                const style: React.CSSProperties = {position: 'absolute', left: x * TILE_PIXEL_SIZE, top: y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'};
                
                if (tile.type === TileType.STAIRS) {
                    return <div key={key} className="cursor-pointer" style={style} onClick={() => onTileClick({ x, y })}><StairsIcon /></div>;
                }
                 if (tile.type === TileType.LOCKED_DOOR) {
                    return <div key={key} className="cursor-pointer" style={style} onClick={() => onTileClick({ x, y })}><DoorIcon /></div>;
                }
                return null;
            })
        )}

        {/* Render Items */}
        {items.map(item => map[item.position.y]?.[item.position.x]?.visible && (
            <div key={item.id} className="cursor-pointer" style={{position: 'absolute', left: item.position.x * TILE_PIXEL_SIZE, top: item.position.y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => onTileClick(item.position)}><ItemIcon symbol={item.symbol} type={item.type} /></div>
        ))}


        {/* Render Monsters */}
        {monsters.map(monster => map[monster.y]?.[monster.x]?.visible && (
             <div 
                key={monster.id} 
                className="absolute flex items-center justify-center cursor-pointer"
                style={{ left: monster.x * TILE_PIXEL_SIZE, top: monster.y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE }}
                onClick={() => onTileClick({ x: monster.x, y: monster.y })}
             >
                <MonsterIcon name={monster.name} spriteType={monster.spriteType} isBoss={monster.isBoss} />
                <HealthBar current={monster.hp} max={monster.maxHp} color="bg-red-500" />
             </div>
        ))}
        
        {/* Render Player */}
        <div className="absolute flex items-center justify-center" style={{ left: player.x * TILE_PIXEL_SIZE, top: player.y * TILE_PIXEL_SIZE, width: TILE_PIXEL_SIZE, height: TILE_PIXEL_SIZE }}>
            <PlayerIcon playerClass={player.playerClass} />
            <HealthBar current={player.hp} max={player.maxHp} color="bg-green-500" />
        </div>

        {/* Render Projectiles */}
        {projectiles.map(p => (
            <ProjectileVisual key={p.id} projectile={p} onHit={onProjectileHit} />
        ))}
      </div>
    </div>
  );
};

export default GameMap;