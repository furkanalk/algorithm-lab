import { dirs, walls } from '../grid/grid.js';
import { reconstructPath } from './common.js';

export default function bfs(start, end) {
  const rows = walls.length;
  const cols = walls[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev    = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue   = [start];
  const visitedOrder = [];
  visited[start.row][start.col] = true;

  while (queue.length) {
    const node = queue.shift();
    visitedOrder.push(node);
    if (node.row === end.row && node.col === end.col) break;
    dirs.forEach(({ dr, dc }) => {
      const nr = node.row + dr, nc = node.col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !visited[nr][nc] && !walls[nr][nc]) {
        visited[nr][nc] = true;
        prev[nr][nc] = node;
        queue.push({ row: nr, col: nc });
      }
    });
  }
  return { visitedOrder, path: reconstructPath(prev, start, end) };
}
