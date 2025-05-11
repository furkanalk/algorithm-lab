import { dirs, walls }     from '../grid/grid.js';
import { reconstructPath,
         heuristic }        from './common.js';

export default function astar(start, end) {
  const rows = walls.length, cols = walls[0].length;
  const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev   = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const open = [{ node: start, g: 0, f: heuristic(start, end) }];
  const visitedOrder = [];
  gScore[start.row][start.col] = 0;

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const { node, g: curG } = open.shift();
    const { row: r, col: c } = node;
    if (visited[r][c]) continue;
    visited[r][c] = true;
    visitedOrder.push(node);
    if (r === end.row && c === end.col) break;
    dirs.forEach(({ dr, dc }) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !walls[nr][nc]) {
        const tentativeG = curG + 1;
        if (tentativeG < gScore[nr][nc]) {
          gScore[nr][nc] = tentativeG;
          prev[nr][nc]   = node;
          open.push({
            node: { row: nr, col: nc },
            g: tentativeG,
            f: tentativeG + heuristic({ row: nr, col: nc }, end)
          });
        }
      }
    });
  }
  return { visitedOrder, path: reconstructPath(prev, start, end) };
}
