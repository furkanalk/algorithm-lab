import { dirs, walls }       from '../grid/grid.js';
import { reconstructPath }   from './common.js';

export default function dijkstra(start, end) {
  const rows = walls.length, cols = walls[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const pq = [{ node: start, dist: 0 }];
  const visitedOrder = [];
  dist[start.row][start.col] = 0;

  while (pq.length) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node, dist: curDist } = pq.shift();
    const { row: r, col: c } = node;
    if (visited[r][c]) continue;
    visited[r][c] = true;
    visitedOrder.push(node);
    if (r === end.row && c === end.col) break;
    dirs.forEach(({ dr, dc }) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !visited[nr][nc] && !walls[nr][nc]) {
        const newDist = curDist + 1;
        if (newDist < dist[nr][nc]) {
          dist[nr][nc] = newDist;
          prev[nr][nc] = node;
          pq.push({ node: { row: nr, col: nc }, dist: newDist });
        }
      }
    });
  }
  return { visitedOrder, path: reconstructPath(prev, start, end) };
}
