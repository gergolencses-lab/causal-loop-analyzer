import { motion } from 'framer-motion';

export default function ConnectionDetail({ connection, nodes, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl max-w-md w-full p-6"
        style={{ background: '#fff', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#1a1816' }}>
            {connection.isBidirectional ? 'Feedback Loop' : 'Connection'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: '#9b9590' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f4f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {connection.isBidirectional ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg" style={{ background: connection.loopType === 'R' ? '#ecfdf5' : '#fef2f2' }}>
              <span className="text-sm font-bold" style={{ color: connection.loopType === 'R' ? '#059669' : '#dc2626' }}>
                {connection.loopType === 'R' ? '\u27F2 Reinforcing Loop' : '\u27F3 Balancing Loop'}
              </span>
            </div>
            {[connection.forward, connection.reverse].map((conn, ci) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              return (
                <div key={ci} className="rounded-xl p-4" style={{ background: '#faf9f7' }}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="w-3 h-3 rounded-full" style={{ background: fromNode?.color }} />
                    <span className="font-semibold text-xs" style={{ color: '#1a1816' }}>{fromNode?.label}</span>
                    <span className="text-lg font-bold" style={{ color: conn.type === '+' ? '#10b981' : '#ef4444' }}>{conn.type === '+' ? '+' : '\u2212'}</span>
                    <span style={{ color: '#9b9590' }}>&rarr;</span>
                    <span className="w-3 h-3 rounded-full" style={{ background: toNode?.color }} />
                    <span className="font-semibold text-xs" style={{ color: '#1a1816' }}>{toNode?.label}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6b6560' }}>{conn.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: nodes.find(n => n.id === connection.conn.from)?.color }} />
                <span className="font-semibold text-sm" style={{ color: '#1a1816' }}>{nodes.find(n => n.id === connection.conn.from)?.label}</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: connection.conn.type === '+' ? '#10b981' : '#ef4444' }}>
                {connection.conn.type === '+' ? '+' : '\u2212'}
              </span>
              <span style={{ color: '#9b9590' }}>&rarr;</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: nodes.find(n => n.id === connection.conn.to)?.color }} />
                <span className="font-semibold text-sm" style={{ color: '#1a1816' }}>{nodes.find(n => n.id === connection.conn.to)?.label}</span>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#faf9f7' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#9b9590' }}>
                {connection.conn.type === '+' ? 'Reinforcing Relationship' : 'Balancing Relationship'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6560' }}>{connection.conn.description}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
