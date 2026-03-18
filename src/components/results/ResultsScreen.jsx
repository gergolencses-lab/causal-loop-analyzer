import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CausalGraph from '../graph/CausalGraph';
import InterventionPanel from '../intervention/InterventionPanel';
import NodeDetail from '../modals/NodeDetail';
import ConnectionDetail from '../modals/ConnectionDetail';
import JsonViewer from '../modals/JsonViewer';

export default function ResultsScreen({ data, onNewAnalysis }) {
  const [activeTab, setActiveTab] = useState('diagram');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="px-4 py-6 fade-up">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <button onClick={onNewAnalysis} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#fff', color: '#6b6560', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#faf9f7'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            New Analysis
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowJson(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#fff', color: '#6b6560', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#faf9f7'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              {'{ }'} JSON
            </button>
            <button onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: copied ? '#7ED321' : '#1a1816', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.background = '#2d2a26'; }}
              onMouseLeave={e => { if (!copied) e.currentTarget.style.background = copied ? '#7ED321' : '#1a1816'; }}>
              {copied ? '\u2713 Copied!' : '\u2398 Copy'}
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#1a1816', letterSpacing: '-0.02em' }}>{data.title}</h1>
        <p className="text-center text-sm mx-auto max-w-2xl mb-6" style={{ color: '#7a756e' }}>{data.description}</p>

        {/* Tabs */}
        <div className="flex justify-center gap-1 p-1 rounded-xl mx-auto" style={{ background: '#e8e6e1', width: 'fit-content' }}>
          {['diagram', 'intervention'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#1a1816' : '#7a756e',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {tab === 'diagram' ? 'System Map' : 'Intervention Strategy'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'diagram' && (
        <CausalGraph
          data={data}
          onSelectNode={setSelectedNode}
          onSelectConnection={setSelectedConnection}
        />
      )}
      {activeTab === 'intervention' && (
        <InterventionPanel intervention={data.intervention} nodes={data.nodes} />
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetail
            node={selectedNode}
            connections={data.connections}
            nodes={data.nodes}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedConnection && (
          <ConnectionDetail
            connection={selectedConnection}
            nodes={data.nodes}
            onClose={() => setSelectedConnection(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showJson && (
          <JsonViewer data={data} onClose={() => setShowJson(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
