import { useState, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import useForceGraph from '../../hooks/useForceGraph';
import { groupConnections, getNodeRadius, getEdgePath, getBidirectionalPath, lightenColor, darkenColor } from '../../utils/graphMath';
import { ROLE_COLORS } from '../../constants/prompt';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import GraphLegend from './GraphLegend';

const SVG_SIZE = 800;

// Pre-generate gradient IDs for each role color
const GRADIENT_COLORS = Object.keys(ROLE_COLORS);

export default function CausalGraph({ data, onSelectNode, onSelectConnection }) {
  const { positions, degrees, settled, onDragStart, onDrag, onDragEnd } = useForceGraph(
    data.nodes, data.connections, SVG_SIZE, SVG_SIZE
  );
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const svgRef = useRef(null);
  const isDragging = useRef(false);

  const connectionGroups = useMemo(() => groupConnections(data.connections), [data.connections]);

  const handleMouseDown = useCallback((nodeId, e) => {
    isDragging.current = true;
    onDragStart(nodeId, e);
    const handleMove = (ev) => {
      if (!isDragging.current) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) onDrag(ev, rect, { width: SVG_SIZE, height: SVG_SIZE });
    };
    const handleUp = () => {
      isDragging.current = false;
      onDragEnd();
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [onDragStart, onDrag, onDragEnd]);

  const hasPositions = Object.keys(positions).length > 0;

  return (
    <div className="max-w-4xl mx-auto fade-up">
      <GraphLegend />

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          style={{ cursor: isDragging.current ? 'grabbing' : 'default' }}
        >
          <defs>
            {/* Open chevron arrow — end */}
            <marker id="arrowEnd" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M1,1 L9,4 L1,7" fill="none" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            {/* Open chevron arrow — start (for bidirectional) */}
            <marker id="arrowStart" markerWidth="10" markerHeight="8" refX="1" refY="4" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M9,1 L1,4 L9,7" fill="none" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            {/* Node depth filter */}
            <filter id="nodeDepth" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000" floodOpacity="0.08" />
            </filter>
            <filter id="nodeHoverGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodOpacity="0.2" />
            </filter>

            {/* Radial gradients for each role color */}
            {GRADIENT_COLORS.map(color => (
              <radialGradient key={color} id={`nodeGrad-${color.slice(1)}`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor={lightenColor(color, 50)} stopOpacity="0.40" />
                <stop offset="70%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={darkenColor(color, 20)} stopOpacity="0.10" />
              </radialGradient>
            ))}

            {/* Background gradient */}
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#fafaf8" />
              <stop offset="100%" stopColor="#f3f2ee" />
            </radialGradient>

            {/* Dot grid pattern */}
            <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.5" fill="#d5d0c8" opacity="0.3" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={SVG_SIZE} height={SVG_SIZE} fill="url(#bgGradient)" />
          <rect width={SVG_SIZE} height={SVG_SIZE} fill="url(#dotGrid)" />

          {/* Edges */}
          <AnimatePresence>
            {hasPositions && connectionGroups.map((group, i) => {
              if (group.type === 'bidirectional') {
                const posA = positions[group.forward.from];
                const posB = positions[group.forward.to];
                if (!posA || !posB) return null;

                const rA = getNodeRadius(degrees[group.forward.from] || 0);
                const rB = getNodeRadius(degrees[group.forward.to] || 0);
                const dx = posB.x - posA.x;
                const dy = posB.y - posA.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const ax = posA.x + (dx / dist) * (rA + 6);
                const ay = posA.y + (dy / dist) * (rA + 6);
                const bx = posB.x - (dx / dist) * (rB + 6);
                const by = posB.y - (dy / dist) * (rB + 6);

                const geo = getBidirectionalPath(ax, ay, bx, by);
                const isHovered = hoveredEdge === i;
                const dimmed = hoveredNode && hoveredNode !== group.forward.from && hoveredNode !== group.forward.to;

                return (
                  <GraphEdge
                    key={`bi-${i}`}
                    index={i}
                    type="bidirectional"
                    biPath={geo.path}
                    biLabelPos={geo}
                    forwardConn={group.forward}
                    reverseConn={group.reverse}
                    loopType={group.loopType}
                    isHovered={isHovered}
                    dimmed={dimmed}
                    onHover={() => setHoveredEdge(i)}
                    onLeave={() => setHoveredEdge(null)}
                    onClick={() => onSelectConnection({ ...group, isBidirectional: true })}
                  />
                );
              } else {
                const conn = group.conn;
                const posFrom = positions[conn.from];
                const posTo = positions[conn.to];
                if (!posFrom || !posTo) return null;

                const rFrom = getNodeRadius(degrees[conn.from] || 0);
                const rTo = getNodeRadius(degrees[conn.to] || 0);
                const dx = posTo.x - posFrom.x;
                const dy = posTo.y - posFrom.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const sx = posFrom.x + (dx / dist) * (rFrom + 4);
                const sy = posFrom.y + (dy / dist) * (rFrom + 4);
                const ex = posTo.x - (dx / dist) * (rTo + 10);
                const ey = posTo.y - (dy / dist) * (rTo + 10);

                const geo = getEdgePath(sx, sy, ex, ey);
                const isHovered = hoveredEdge === i;
                const dimmed = hoveredNode && hoveredNode !== conn.from && hoveredNode !== conn.to;

                return (
                  <GraphEdge
                    key={`s-${i}`}
                    index={i}
                    type="single"
                    path={geo.path}
                    labelPos={geo}
                    conn={conn}
                    isHovered={isHovered}
                    dimmed={dimmed}
                    onHover={() => setHoveredEdge(i)}
                    onLeave={() => setHoveredEdge(null)}
                    onClick={() => onSelectConnection({ ...group, isBidirectional: false })}
                  />
                );
              }
            })}
          </AnimatePresence>

          {/* Nodes */}
          <AnimatePresence>
            {hasPositions && data.nodes.map((node, i) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const degree = degrees[node.id] || 0;
              const r = getNodeRadius(degree);
              const isHovered = hoveredNode === node.id;
              const dimmed = hoveredNode && hoveredNode !== node.id;

              return (
                <GraphNode
                  key={node.id}
                  node={node}
                  x={pos.x}
                  y={pos.y}
                  radius={r}
                  degree={degree}
                  index={i}
                  isHovered={isHovered}
                  dimmed={dimmed}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  onClick={() => onSelectNode(node)}
                />
              );
            })}
          </AnimatePresence>
        </svg>
      </div>
      <p className="text-center text-xs mt-3" style={{ color: '#b5b0a8' }}>Click nodes or edges for details &bull; Drag nodes to rearrange</p>
    </div>
  );
}
