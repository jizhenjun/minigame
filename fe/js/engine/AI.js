import { getMoveRange, getAttackRange, findPath } from './Pathfinder.js';
import { computeForecast } from './CombatForecast.js';
import { posKey } from '../utils/grid.js';

// AI decision for a single enemy unit. Returns action: { type, path, targetTile, targetUnit }
export function decideAction(enemy, mapState) {
  const playerUnits = Object.values(mapState.units).filter(
    u => u.alive && (u.faction === 'player' || u.faction === 'ally')
  );

  if (playerUnits.length === 0) return { type: 'wait' };

  const weapon = enemy.equippedWeapon;
  if (!weapon) return { type: 'wait' };

  // Get movement range
  const moveRange = getMoveRange(enemy, mapState);
  // Include current position
  const allPositions = [{ x: enemy.x, y: enemy.y, remaining: enemy.mov }, ...moveRange];

  // Collect all possible attack targets with forecasts
  const threats = [];
  for (const pos of allPositions) {
    const attackPositions = getAttackRange(enemy, pos.x, pos.y, mapState);
    for (const atkPos of attackPositions) {
      const target = playerUnits.find(u => u.x === atkPos.x && u.y === atkPos.y);
      if (!target) continue;

      const forecast = computeForecast(
        { ...enemy, x: pos.x, y: pos.y },
        target,
        mapState.tiles
      );
      if (forecast) {
        threats.push({
          targetId: target.id,
          moveTo: pos,
          attackFrom: pos,
          forecast,
          distance: Math.abs(enemy.x - pos.x) + Math.abs(enemy.y - pos.y),
        });
      }
    }
  }

  // Sort by priority: can kill > high damage > low target HP > closest
  threats.sort((a, b) => {
    // Can kill?
    const aKill = a.forecast.damage >= a.forecast.defenderHpAfter;
    // Wait, we need the target's actual HP
    const target = mapState.units[a.targetId];
    const aKills = a.forecast.damage >= (target?.hp || 999);
    const bTarget = mapState.units[b.targetId];
    const bKills = b.forecast.damage >= (bTarget?.hp || 999);

    if (aKills !== bKills) return bKills ? 1 : -1;
    if (a.forecast.damage !== b.forecast.damage) return b.forecast.damage - a.forecast.damage;
    if ((target?.hp || 0) !== (bTarget?.hp || 0)) return (target?.hp || 0) - (bTarget?.hp || 0);
    return a.distance - b.distance;
  });

  if (threats.length > 0) {
    const best = threats[0];
    return {
      type: 'attack',
      targetId: best.targetId,
      moveTo: best.moveTo,
    };
  }

  // No attackable targets — move toward nearest player unit
  let nearestPlayer = null;
  let nearestDist = Infinity;
  for (const u of playerUnits) {
    const d = Math.abs(enemy.x - u.x) + Math.abs(enemy.y - u.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearestPlayer = u;
    }
  }

  if (nearestPlayer && moveRange.length > 0) {
    // Move as close as possible
    const sortedMoves = moveRange.sort((a, b) => {
      const da = Math.abs(a.x - nearestPlayer.x) + Math.abs(a.y - nearestPlayer.y);
      const db = Math.abs(b.x - nearestPlayer.x) + Math.abs(b.y - nearestPlayer.y);
      return da - db;
    });
    return { type: 'move', destination: sortedMoves[0] };
  }

  return { type: 'wait' };
}
