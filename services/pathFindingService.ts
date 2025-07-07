

import { Position, Tile, TileType } from '../types';

interface Node {
    pos: Position;
    g: number; // cost from start
    h: number; // heuristic cost to end
    f: number; // g + h
    parent: Node | null;
}

const arePositionsEqual = (a: Position, b: Position): boolean => a.x === b.x && a.y === b.y;

const getNeighbors = (node: Node, grid: Tile[][]): Position[] => {
    const neighbors: Position[] = [];
    const { x, y } = node.pos;
    const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}]; // 4-directional movement

    for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;

        if (
            newY >= 0 && newY < grid.length &&
            newX >= 0 && newX < grid[0].length &&
            grid[newY][newX].type !== TileType.WALL
        ) {
            neighbors.push({ x: newX, y: newY });
        }
    }
    return neighbors;
};

const heuristic = (a: Position, b: Position): number => {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const reconstructPath = (node: Node): Position[] => {
    const path: Position[] = [];
    let current: Node | null = node;
    while(current) {
        path.unshift(current.pos);
        current = current.parent;
    }
    return path.slice(1); // Remove the starting node
};

// Bresenham's line algorithm to get all points on a line
const getLinePoints = (start: Position, end: Position): Position[] => {
    const points: Position[] = [];
    let x0 = start.x, y0 = start.y;
    const x1 = end.x, y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        points.push({ x: x0, y: y0 });

        if ((x0 === x1) && (y0 === y1)) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
    return points;
};


export const pathfindingService = {
    findPath(grid: Tile[][], start: Position, end: Position): Position[] {
        const openSet: Node[] = [];
        const closedSet = new Set<string>();

        const startNode: Node = { pos: start, g: 0, h: heuristic(start, end), f: heuristic(start, end), parent: null };
        openSet.push(startNode);
        
        while(openSet.length > 0) {
            // Find node with lowest F score in open set
            let lowestIndex = 0;
            for(let i = 1; i < openSet.length; i++) {
                if(openSet[i].f < openSet[lowestIndex].f) {
                    lowestIndex = i;
                }
            }
            const currentNode = openSet[lowestIndex];

            // If we reached the end, reconstruct the path
            if (arePositionsEqual(currentNode.pos, end)) {
                return reconstructPath(currentNode);
            }
            
            // Move current node from open to closed set
            openSet.splice(lowestIndex, 1);
            closedSet.add(`${currentNode.pos.x},${currentNode.pos.y}`);

            const neighbors = getNeighbors(currentNode, grid);
            for (const neighborPos of neighbors) {
                const neighborKey = `${neighborPos.x},${neighborPos.y}`;
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                const gScore = currentNode.g + 1; // All steps have a cost of 1
                let neighborNode = openSet.find(n => arePositionsEqual(n.pos, neighborPos));
                
                if (!neighborNode) {
                     neighborNode = { 
                        pos: neighborPos, 
                        g: gScore, 
                        h: heuristic(neighborPos, end), 
                        f: gScore + heuristic(neighborPos, end),
                        parent: currentNode 
                    };
                    openSet.push(neighborNode);
                } else if (gScore >= neighborNode.g) {
                    continue; // This is not a better path
                }

                // This is the best path so far. Record it.
                neighborNode.parent = currentNode;
                neighborNode.g = gScore;
                neighborNode.f = neighborNode.g + neighborNode.h;
            }
        }
        
        // No path found
        return [];
    },
    getLine: getLinePoints,
};