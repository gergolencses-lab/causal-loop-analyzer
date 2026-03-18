import { useState, useEffect, useRef, useCallback } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { computeDegrees, getNodeRadius } from '../utils/graphMath';

export default function useForceGraph(nodes, connections, width = 800, height = 800) {
  const [positions, setPositions] = useState({});
  const [settled, setSettled] = useState(false);
  const simRef = useRef(null);
  const dragRef = useRef(null);

  const degrees = computeDegrees(nodes || [], connections || []);

  useEffect(() => {
    if (!nodes?.length || !connections?.length) return;

    setSettled(false);

    // Create simulation nodes with initial circular layout as starting positions
    const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.28;
    const simNodes = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: node.id,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: getNodeRadius(degrees[node.id] || 0),
      };
    });

    const simLinks = connections
      .filter(c => simNodes.find(n => n.id === c.from) && simNodes.find(n => n.id === c.to))
      .map(c => ({ source: c.from, target: c.to }));

    const sim = forceSimulation(simNodes)
      .force('link', forceLink(simLinks).id(d => d.id).distance(180).strength(0.6))
      .force('charge', forceManyBody().strength(-500))
      .force('center', forceCenter(cx, cy))
      .force('collide', forceCollide().radius(d => d.radius + 20).strength(0.8))
      .alphaDecay(0.03)
      .on('tick', () => {
        const pos = {};
        simNodes.forEach(n => {
          // Clamp within bounds with padding
          const pad = n.radius + 10;
          pos[n.id] = {
            x: Math.max(pad, Math.min(width - pad, n.x)),
            y: Math.max(pad, Math.min(height - pad, n.y)),
          };
        });
        setPositions({ ...pos });
      })
      .on('end', () => {
        setSettled(true);
      });

    simRef.current = { sim, simNodes };

    return () => {
      sim.stop();
    };
  }, [nodes, connections, width, height]);

  // Drag handlers for interactive node repositioning
  const onDragStart = useCallback((nodeId, event) => {
    const sim = simRef.current?.sim;
    const simNodes = simRef.current?.simNodes;
    if (!sim || !simNodes) return;

    const node = simNodes.find(n => n.id === nodeId);
    if (!node) return;

    sim.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
    dragRef.current = { nodeId, startX: event.clientX, startY: event.clientY, origX: node.x, origY: node.y };
  }, []);

  const onDrag = useCallback((event, svgRect, viewBox) => {
    if (!dragRef.current || !simRef.current) return;

    const { nodeId } = dragRef.current;
    const node = simRef.current.simNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Convert screen coords to SVG coords
    const scaleX = viewBox.width / svgRect.width;
    const scaleY = viewBox.height / svgRect.height;
    const dx = (event.clientX - dragRef.current.startX) * scaleX;
    const dy = (event.clientY - dragRef.current.startY) * scaleY;

    node.fx = dragRef.current.origX + dx;
    node.fy = dragRef.current.origY + dy;
  }, []);

  const onDragEnd = useCallback(() => {
    if (!dragRef.current || !simRef.current) return;

    const { nodeId } = dragRef.current;
    const node = simRef.current.simNodes.find(n => n.id === nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }

    simRef.current.sim.alphaTarget(0);
    dragRef.current = null;
  }, []);

  return { positions, degrees, settled, onDragStart, onDrag, onDragEnd };
}
