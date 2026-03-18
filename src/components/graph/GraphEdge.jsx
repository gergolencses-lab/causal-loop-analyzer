import { motion } from 'framer-motion';
import { getPolarityDash, getBidirectionalDash } from '../../utils/graphMath';

export default function GraphEdge({
  index, type,
  // Single edge props
  path, labelPos, conn,
  // Bidirectional props
  biPath, biLabelPos, forwardConn, reverseConn, loopType,
  // Common
  isHovered, dimmed, onHover, onLeave, onClick,
}) {
  const edgeDelay = 0.4 + index * 0.05;

  if (type === 'bidirectional') {
    const dashPattern = getBidirectionalDash(forwardConn.type, reverseConn.type);
    const loopLabel = loopType === 'R' ? 'Reinforcing' : 'Balancing';

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: dimmed ? 0.1 : 1 }}
        transition={{ delay: edgeDelay, duration: 0.5, opacity: { duration: 0.2, delay: 0 } }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="cursor-pointer"
      >
        <motion.path
          d={biPath}
          stroke={isHovered ? '#475569' : '#78889a'}
          strokeWidth={isHovered ? 3.5 : 2.5}
          strokeLinecap="round"
          strokeDasharray={dashPattern}
          fill="none"
          markerStart="url(#arrowStart)"
          markerEnd="url(#arrowEnd)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: edgeDelay, duration: 0.6, ease: 'easeInOut' }}
          style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
        />
        {/* Hit area */}
        <path d={biPath} stroke="transparent" strokeWidth="18" fill="none" />

        {/* Hover tooltip */}
        {isHovered && biLabelPos && (
          <g>
            <rect
              x={biLabelPos.labelX - 46} y={biLabelPos.labelY - 13}
              width="92" height="26" rx="6"
              fill="#1e293b" fillOpacity="0.92"
            />
            <text
              x={biLabelPos.labelX} y={biLabelPos.labelY + 1}
              textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', fill: '#fff' }}
            >
              {loopLabel}
            </text>
          </g>
        )}
      </motion.g>
    );
  }

  // Single edge
  const dashPattern = getPolarityDash(conn.type);
  const hoverLabel = conn.type === '+' ? 'Reinforcing (+)' : 'Balancing (\u2212)';

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: dimmed ? 0.1 : 1 }}
      transition={{ delay: edgeDelay, duration: 0.5, opacity: { duration: 0.2, delay: 0 } }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="cursor-pointer"
    >
      <motion.path
        d={path}
        stroke={isHovered ? '#475569' : '#b0bec5'}
        strokeWidth={isHovered ? 2.5 : 1.8}
        strokeLinecap="round"
        strokeDasharray={dashPattern}
        fill="none"
        markerEnd="url(#arrowEnd)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: edgeDelay, duration: 0.6, ease: 'easeInOut' }}
        style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
      />
      {/* Hit area */}
      <path d={path} stroke="transparent" strokeWidth="18" fill="none" />

      {/* Hover tooltip */}
      {isHovered && labelPos && (
        <g>
          <rect
            x={labelPos.labelX - 50} y={labelPos.labelY - 13}
            width="100" height="26" rx="6"
            fill="#1e293b" fillOpacity="0.92"
          />
          <text
            x={labelPos.labelX} y={labelPos.labelY + 1}
            textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', fill: '#fff' }}
          >
            {hoverLabel}
          </text>
        </g>
      )}
    </motion.g>
  );
}
