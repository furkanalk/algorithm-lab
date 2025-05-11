// Manhattan (|Δx| + |Δy|) – A*
export default function heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }
  