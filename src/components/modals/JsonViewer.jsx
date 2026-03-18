import { motion } from 'framer-motion';

export default function JsonViewer({ data, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        style={{ background: '#fff', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 flex-shrink-0" style={{ borderBottom: '1px solid #e8e6e1' }}>
          <h2 className="text-lg font-bold" style={{ color: '#1a1816' }}>Causal Map JSON</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: '#9b9590' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f4f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <pre className="p-5 overflow-auto text-xs flex-1" style={{ color: '#3a3632', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </motion.div>
    </div>
  );
}
