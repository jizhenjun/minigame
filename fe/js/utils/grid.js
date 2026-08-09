// Grid utility functions

// Manhattan distance
export function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Chebyshev distance
export function chebyshev(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// Get orthogonal neighbors (up, down, left, right)
export function getNeighbors(pos, width, height) {
  const neighbors = [];
  if (pos.x > 0)           neighbors.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < width - 1)   neighbors.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0)           neighbors.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < height - 1)  neighbors.push({ x: pos.x, y: pos.y + 1 });
  return neighbors;
}

// Convert position to 1D index
export function posToIndex(x, y, width) {
  return y * width + x;
}

// Convert 1D index to position
export function indexToPos(index, width) {
  return { x: index % width, y: Math.floor(index / width) };
}

// Position key for Set/Map usage
export function posKey(x, y) {
  return `${x},${y}`;
}

export function parsePosKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

// Deep clone a 2D array
export function clone2D(array) {
  return array.map(row => [...row]);
}

// Check if position is within bounds
export function inBounds(x, y, width, height) {
  return x >= 0 && x < width && y >= 0 && y < height;
}
