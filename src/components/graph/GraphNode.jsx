import { motion } from 'framer-motion';
import { wrapLabel } from '../../utils/graphMath';

export default function GraphNode({ node, x, y, radius, degree, index, isHovered, dimmed, onMouseEnter, onMouseLeave, onMouseDown, onClick }) {
  const lines = wrapLabel(node.label);
  const isHub = degree >= 4;
  const lineH = radius > 50 ? 18 : 16;
  const startDy = -(lines.length - 1) * lineH / 2;
  const fontSize = isHub ? 15 : (radius > 50 ? 14 : 13);
  const fontWeight = isHub ? 700 : 600;
  const r = isHovered ? radius + 3 : radius;
  const gradientId = `nodeGrad-${node.color.slice(1)}`;

  // Highlight arc path (top crescent for 3D illusion)
  const arcPath = `M ${x - r * 0.45} ${y - r * 0.65} A ${r * 0.75} ${r * 0.75} 0 0 1 ${x + r * 0.45} ${y - r * 0.6}`;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: dimmed ? 0.2 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.45,
        type: 'spring',
        stiffness: 200,
        damping: 20,
        opacity: { duration: 0.2, delay: 0 },
      }}
      style={{ transformOrigin: `${x}px ${y}px`, cursor: 'grab' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Hover glow */}
      {isHovered && (
        <circle cx={x} cy={y} r={r + 10} fill={node.color} opacity="0.06" />
      )}

      {/* Hub node outer dashed ring */}
      {isHub && (
        <circle cx={x} cy={y} r={r + 6} fill="none" stroke={node.color}
          strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      )}

      {/* Main circle with gradient fill */}
      <circle cx={x} cy={y} r={r}
        fill={`url(#${gradientId})`}
        filter={isHovered ? 'url(#nodeHoverGlow)' : 'url(#nodeDepth)'}
      />

      {/* Stroke ring */}
      <circle cx={x} cy={y} r={r - 1} fill="none" stroke={node.color}
        strokeWidth="2" opacity="0.5" />

      {/* Highlight arc (3D crescent) */}
      <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5" strokeLinecap="round" />

      {/* Label */}
      <text
        x={x}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#2d2a26"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="3"
        paintOrder="stroke"
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          fontFamily: 'DM Sans, sans-serif',
          pointerEvents: 'none',
          userSelect: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x} y={y + startDy + i * lineH}>
            {line}
          </tspan>
        ))}
      </text>
    </motion.g>
  );
}
