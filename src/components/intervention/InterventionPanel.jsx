export default function InterventionPanel({ intervention, nodes }) {
  if (!intervention) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: '#f5f4f0' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9b9590" strokeWidth="2"/><path d="M12 8v4l3 3" stroke="#9b9590" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1816' }}>Intervention Strategy</h3>
        <p className="text-sm max-w-md mx-auto" style={{ color: '#9b9590' }}>
          The intervention strategy was not generated. Try running a new analysis.
        </p>
      </div>
    );
  }

  const phaseColors = ['#4A90E2', '#F5A623', '#7ED321'];

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-up">
      {/* Executive Summary */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9b9590' }}>Executive Summary</h3>
        <p className="text-base leading-relaxed" style={{ color: '#3a3632' }}>{intervention.executive_summary}</p>
      </div>

      {/* Leverage Points */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9b9590' }}>Leverage Points</h3>
        <div className="space-y-3">
          {intervention.leverage_points?.map((lp, i) => {
            const node = nodes.find(n => n.id === lp.node_id);
            return (
              <div key={i} className="rounded-xl p-4" style={{ background: '#faf9f7', border: '1px solid #e8e6e1' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {node && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: node.color }} />}
                    <h4 className="font-semibold text-sm" style={{ color: '#1a1816' }}>{lp.name}</h4>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                      background: lp.impact === 'High' ? '#fef2f2' : lp.impact === 'Medium' ? '#fffbeb' : '#f0fdf4',
                      color: lp.impact === 'High' ? '#b91c1c' : lp.impact === 'Medium' ? '#a16207' : '#15803d'
                    }}>Impact: {lp.impact}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                      background: lp.feasibility === 'High' ? '#f0fdf4' : lp.feasibility === 'Medium' ? '#fffbeb' : '#fef2f2',
                      color: lp.feasibility === 'High' ? '#15803d' : lp.feasibility === 'Medium' ? '#a16207' : '#b91c1c'
                    }}>Feasibility: {lp.feasibility}</span>
                  </div>
                </div>
                <p className="text-xs mb-1" style={{ color: '#9b9590' }}>Type: {lp.type}</p>
                <p className="text-sm" style={{ color: '#6b6560' }}>{lp.rationale}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phases */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9b9590' }}>Implementation Phases</h3>
        <div className="space-y-4">
          {intervention.phases?.map((phase, i) => (
            <div key={i} className="pl-4" style={{ borderLeft: `3px solid ${phaseColors[i] || '#9B9B9B'}` }}>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-sm" style={{ color: '#1a1816' }}>{phase.name}</h4>
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#eef6ff', color: '#4A90E2' }}>{phase.timeframe}</span>
              </div>
              <p className="text-xs mb-2" style={{ color: '#9b9590' }}>Target: {phase.target}</p>
              <div className="mb-2">
                {phase.actions?.map((action, j) => (
                  <p key={j} className="text-sm ml-2" style={{ color: '#6b6560' }}>&bull; {action}</p>
                ))}
              </div>
              <p className="text-sm" style={{ color: '#6b6560' }}><strong>Expected impact:</strong> {phase.expected_impact}</p>
              {phase.success_indicators?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {phase.success_indicators.map((si, k) => (
                    <span key={k} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#f5f4f0', color: '#7a756e' }}>{si}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      {intervention.risks?.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9b9590' }}>Risks & Mitigation</h3>
          <div className="space-y-3">
            {intervention.risks.map((r, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: '#fffbeb', border: '1px solid #fef3c7' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#92400e' }}>{'\u26A0'} {r.risk}</p>
                <p className="text-sm" style={{ color: '#a16207' }}>&rarr; {r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {(intervention.key_metrics?.length > 0 || intervention.review_cadence) && (
        <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9b9590' }}>Key Metrics</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {intervention.key_metrics?.map((m, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ background: '#f5f4f0', color: '#3a3632' }}>{m}</span>
            ))}
          </div>
          {intervention.review_cadence && (
            <p className="text-sm" style={{ color: '#9b9590' }}>Review cadence: <strong style={{ color: '#6b6560' }}>{intervention.review_cadence}</strong></p>
          )}
        </div>
      )}
    </div>
  );
}
