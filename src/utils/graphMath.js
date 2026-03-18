// Compute degree (number of connections) for each node
export const computeDegrees = (nodes, connections) => {
  const deg = {};
  nodes.forEach(n => { deg[n.id] = 0; });
  connections.forEach(c => {
    if (deg[c.from] !== undefined) deg[c.from]++;
    if (deg[c.to] !== undefined) deg[c.to]++;
  });
  return deg;
};

// Node radius based on degree
export const getNodeRadius = (degree) => {
  const base = 36;
  const scale = 6;
  return Math.min(base + degree * scale, 66);
};

// Cubic bezier midpoint at t=0.5
const bezierMidpoint = (sx, sy, c1x, c1y, c2x, c2y, ex, ey) => {
  const t = 0.5;
  const t1 = 1 - t;
  return {
    x: t1 * t1 * t1 * sx + 3 * t1 * t1 * t * c1x + 3 * t1 * t * t * c2x + t * t * t * ex,
    y: t1 * t1 * t1 * sy + 3 * t1 * t1 * t * c1y + 3 * t1 * t * t * c2y + t * t * t * ey,
  };
};

// Cubic bezier path for single edges — adaptive curvature, asymmetric CPs
export const getEdgePath = (sx, sy, ex, ey, pairIndex = 0, pairCount = 1) => {
  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  // Perpendicular unit vector
  const nx = -dy / dist;
  const ny = dx / dist;

  // Adaptive curvature: short edges curve more, long edges nearly straight
  const curveFactor = Math.min(0.3, 40 / dist);

  // Parallel edge offset (for multiple edges between same pair)
  const parallelOffset = pairCount > 1
    ? (pairIndex - (pairCount - 1) / 2) * 30
    : 0;

  const offset = dist * curveFactor + parallelOffset;

  // Two control points at 1/3 and 2/3 — asymmetric for organic feel
  const c1x = sx + dx * 0.33 + nx * offset * 0.6;
  const c1y = sy + dy * 0.33 + ny * offset * 0.6;
  const c2x = sx + dx * 0.67 + nx * offset * 0.4;
  const c2y = sy + dy * 0.67 + ny * offset * 0.4;

  const mid = bezierMidpoint(sx, sy, c1x, c1y, c2x, c2y, ex, ey);

  return {
    path: `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`,
    labelX: mid.x,
    labelY: mid.y,
  };
};

// Bidirectional: single line with subtle curve, arrows both ends
export const getBidirectionalPath = (sx, sy, ex, ey) => {
  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;

  // Very subtle curve — just enough to look organic
  const offset = Math.min(15, dist * 0.06);
  const c1x = sx + dx * 0.33 + nx * offset;
  const c1y = sy + dy * 0.33 + ny * offset;
  const c2x = sx + dx * 0.67 + nx * offset;
  const c2y = sy + dy * 0.67 + ny * offset;

  const mid = bezierMidpoint(sx, sy, c1x, c1y, c2x, c2y, ex, ey);

  return {
    path: `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`,
    labelX: mid.x,
    labelY: mid.y,
  };
};

// Wrap long labels into lines
export const wrapLabel = (label) => {
  const words = label.split(' ');
  if (words.length <= 2) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
};

// Group connections: detect bidirectional pairs
export const groupConnections = (connections) => {
  const groups = [];
  const processed = new Set();
  connections.forEach((conn, i) => {
    if (processed.has(i)) return;
    const reverseIdx = connections.findIndex((c, j) => j !== i && c.from === conn.to && c.to === conn.from);
    if (reverseIdx !== -1 && !processed.has(reverseIdx)) {
      processed.add(i);
      processed.add(reverseIdx);
      const reverse = connections[reverseIdx];
      const minusCount = (conn.type === '-' ? 1 : 0) + (reverse.type === '-' ? 1 : 0);
      groups.push({ type: 'bidirectional', forward: conn, reverse, loopType: minusCount % 2 === 0 ? 'R' : 'B' });
    } else {
      processed.add(i);
      groups.push({ type: 'single', conn });
    }
  });
  return groups;
};

// Determine dash pattern for polarity
export const getPolarityDash = (type) => {
  return type === '-' ? '8 4' : 'none';
};

// For bidirectional: determine combined dash pattern
export const getBidirectionalDash = (forwardType, reverseType) => {
  if (forwardType === '+' && reverseType === '+') return 'none'; // both reinforcing
  if (forwardType === '-' && reverseType === '-') return '8 4'; // both balancing
  return '8 4 2 4'; // mixed
};

// Color helpers for node gradients
export const lightenColor = (hex, amount = 40) => {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const darkenColor = (hex, amount = 30) => {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
