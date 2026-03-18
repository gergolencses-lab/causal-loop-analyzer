import { motion } from 'framer-motion';
import { getTextColor, getRoleName } from '../../utils/colors';

export default function NodeDetail({ node, connections, nodes, onClose }) {
  const relatedConns = connections.filter(c => c.from === node.id || c.to === node.id);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl max-w-lg w-full p-6"
        style={{ background: '#fff', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: node.color }}>
              <span className="font-bold text-lg" style={{ color: getTextColor(node.color) }}>
                {node.label.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#1a1816' }}>{node.label}</h2>
              <span className="text-xs" style={{ color: '#9b9590' }}>{getRoleName(node.color)}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: '#9b9590' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f4f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b6560' }}>{node.description}</p>
        <div className="pt-4" style={{ borderTop: '1px solid #e8e6e1' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9b9590' }}>Connections</h3>
          <div className="space-y-1.5">
            {relatedConns.map((conn, i) => {
              const isOutgoing = conn.from === node.id;
              const otherNode = nodes.find(n => n.id === (isOutgoing ? conn.to : conn.from));
              return (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#6b6560' }}>
                  <span className="font-bold text-base" style={{ color: conn.type === '+' ? '#10b981' : '#ef4444' }}>
                    {conn.type === '+' ? '+' : '\u2212'}
                  </span>
                  <span>{isOutgoing ? '\u2192' : '\u2190'}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: otherNode?.color }} />
                  <span className="font-medium">{otherNode?.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
