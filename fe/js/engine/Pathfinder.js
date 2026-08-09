import { TERRAIN } from '../data/terrain.js';
import { CLASSES } from '../data/classes.js';
import { getNeighbors, posKey, inBounds } from '../utils/grid.js';

// Standard pairwise min-heap priority queue
class PriorityQueue {
  constructor() { this.items = []; }
  push(item, priority) { this.items.push({ item, priority }); this.items.sort((a,b) => a.priority - b.priority); }
  pop() { return this.items.shift()?.item; }
  get size() { return this.items.length; }
}

// Get movement cost for a unit on a specific terrain
function getMoveCost(unit, terrainId) {
  const terrain = TERRAIN[terrainId] || TERRAIN['plains'];
  const cls = CLASSES[unit.classId];
  const moveType = cls ? cls.movementType : 'infantry';
  return terrain.moveCost[moveType] || Infinity;
}

// BFS Flood-Fill: Returns Set of position keys reachable within unit's move
export function getMoveRange(unit, mapState) {
  const maxCost = unit.mov;
  const visited = {};       // posKey -> remainingCost
  const startKey = posKey(unit.x, unit.y);
  visited[startKey] = maxCost;

  const frontier = new PriorityQueue();
  frontier.push({ x: unit.x, y: unit.y }, 0);

  while (frontier.size > 0) {
    const pos = frontier.pop();
    const currentKey = posKey(pos.x, pos.y);
    const costSoFar = maxCost - (visited[currentKey] || 0);

    for (const nb of getNeighbors(pos, mapState.mapWidth, mapState.mapHeight)) {
      const nbKey = posKey(nb.x, nb.y);
      const moveCost = getMoveCost(unit, getTerrainId(mapState, nb.x, nb.y));
      if (moveCost === Infinity) continue;

      const nextCost = costSoFar + moveCost;
      if (nextCost > maxCost) continue;

      const remainingCost = maxCost - nextCost;
      if (remainingCost > (visited[nbKey] || -1)) {
        // Check if tile is occupied by another unit
        const occupant = getUnitAt(mapState, nb.x, nb.y);
        if (occupant && occupant.id !== unit.id) continue; // can't move through units

        visited[nbKey] = remainingCost;
        frontier.push(nb, nextCost);
      }
    }
  }

  // Convert visited keys back to coordinate objects
  const result = [];
  for (const [key, remaining] of Object.entries(visited)) {
    if (key === startKey) continue;
    const [x, y] = key.split(',').map(Number);
    result.push({ x, y, remaining });
  }
  return result;
}

// Compute attack range tiles from a given position
export function getAttackRange(unit, x, y, mapState) {
  const weapon = unit.equippedWeapon;
  if (!weapon || weapon.isStaff) return [];

  const range = weapon.range;
  const result = [];
  for (let dx = -range.max; dx <= range.max; dx++) {
    for (let dy = -range.max; dy <= range.max; dy++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist >= range.min && dist <= range.max) {
        const tx = x + dx;
        const ty = y + dy;
        if (inBounds(tx, ty, mapState.mapWidth, mapState.mapHeight)) {
          result.push({ x: tx, y: ty });
        }
      }
    }
  }
  return result;
}

// A* Pathfinding
export function findPath(unit, destX, destY, mapState) {
  const start = { x: unit.x, y: unit.y };
  const goal = { x: destX, y: destY };

  const openSet = new PriorityQueue();
  const cameFrom = {};
  const gScore = {};
  const startKey = posKey(start.x, start.y);
  gScore[startKey] = 0;

  const h = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  openSet.push(start, h(start, goal));

  while (openSet.size > 0) {
    const current = openSet.pop();
    const currentKey = posKey(current.x, current.y);

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    for (const nb of getNeighbors(current, mapState.mapWidth, mapState.mapHeight)) {
      const nbKey = posKey(nb.x, nb.y);

      // Check occupancy (allow goal tile if occupied by enemy)
      const occupant = getUnitAt(mapState, nb.x, nb.y);
      if (occupant && occupant.id !== unit.id) {
        if (nb.x !== goal.x || nb.y !== goal.y) continue;
      }

      const moveCost = getMoveCost(unit, getTerrainId(mapState, nb.x, nb.y));
      if (moveCost === Infinity) continue;

      const tentativeG = (gScore[currentKey] || 0) + moveCost;
      if (tentativeG < (gScore[nbKey] || Infinity)) {
        cameFrom[nbKey] = current;
        gScore[nbKey] = tentativeG;
        openSet.push(nb, tentativeG + h(nb, goal));
      }
    }
  }

  return null; // No path found
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  let key = posKey(current.x, current.y);
  while (cameFrom[key]) {
    const prev = cameFrom[key];
    path.unshift(prev);
    key = posKey(prev.x, prev.y);
  }
  return path;
}

function getTerrainId(mapState, x, y) {
  const row = mapState.tiles[y];
  return row ? row[x] || 'plains' : 'plains';
}

function getUnitAt(mapState, x, y) {
  const units = mapState.units;
  for (const id of Object.keys(units)) {
    const u = units[id];
    if (u.alive && u.x === x && u.y === y) return u;
  }
  return null;
}
