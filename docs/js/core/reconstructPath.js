export default function reconstructPath(prev, start, end) {
    const path = [];
    let cur = { row: end.row, col: end.col };
    while (cur && !(cur.row === start.row && cur.col === start.col)) {
      path.push(cur);
      cur = prev[cur.row][cur.col];
    }
    if (cur) path.push(start);
    return path.reverse();
  }
  