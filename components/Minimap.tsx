import React from 'react';
import { Tile, Player, TileType } from '../types';

interface MinimapProps {
  map: Tile[][];
  player: Player;
  isVisible: boolean;
}

const TILE_SIZE = 4; // Pixel size for each tile on the minimap
const PLAYER_DOT_SIZE = 6; // Pixel size for the player indicator

const Minimap: React.FC<MinimapProps> = ({ map, player, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const MAP_HEIGHT = map.length;
  const MAP_WIDTH = map[0]?.length || 0;

  return (
    <div className="absolute top-4 right-4 bg-black/50 border-2 border-slate-600/70 rounded-lg p-2 z-40 shadow-2xl backdrop-blur-sm">
      <div
        className="relative"
        style={{
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
        }}
      >
        {map.map((row, y) =>
          row.map((tile, x) => {
            if (!tile.explored) {
              return null;
            }
            let colorClass = 'bg-slate-800'; // Unseen but explored wall
            if (tile.type !== TileType.WALL) {
              colorClass = 'bg-slate-600'; // Explored floor
            }
            
            return (
              <div
                key={`${x}-${y}`}
                className={`absolute ${colorClass}`}
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              />
            );
          })
        )}
        {/* Player Position */}
        <div
          className="absolute bg-cyan-400 rounded-full animate-pulse"
          style={{
            left: player.x * TILE_SIZE + (TILE_SIZE / 2) - (PLAYER_DOT_SIZE / 2),
            top: player.y * TILE_SIZE + (TILE_SIZE / 2) - (PLAYER_DOT_SIZE / 2),
            width: PLAYER_DOT_SIZE,
            height: PLAYER_DOT_SIZE,
            boxShadow: '0 0 4px #06b6d4, 0 0 8px #06b6d4',
          }}
          aria-label="Player Position"
        />
      </div>
    </div>
  );
};

export default Minimap;