import { dirs, walls } from '../grid/grid.js';
import { reconstructPath } from './common.js';

export default function dfs(start, end) {
  const rows = walls.length;
  const cols = walls[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev    = Array.from({ length: rows }, () => Array(cols).fill(null));
  const stack   = [start];
  const visitedOrder = [];

  while (stack.length) {
    const node = stack.pop();
    if (visited[node.row][node.col]) continue;
    visited[node.row][node.col] = true;
    visitedOrder.push(node);
    if (node.row === end.row && node.col === end.col) break;
    dirs.forEach(({ dr, dc }) => {
      const nr = node.row + dr, nc = node.col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !visited[nr][nc] && !walls[nr][nc]) {
        prev[nr][nc] = node;
        stack.push({ row: nr, col: nc });
      }
    });
  }
  return { visitedOrder, path: reconstructPath(prev, start, end) };
}
