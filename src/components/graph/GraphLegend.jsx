import { LEGEND_ITEMS } from '../../constants/prompt';

export default function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs" style={{ color: '#7a756e' }}>
      {/* Line style legend */}
      <span className="flex items-center gap-1.5">
        <svg width="24" height="8" viewBox="0 0 24 8">
          <line x1="0" y1="4" x2="24" y2="4" stroke="#94a3b8" strokeWidth="2" />
        </svg>
        Reinforcing
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="24" height="8" viewBox="0 0 24 8">
          <line x1="0" y1="4" x2="24" y2="4" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
        Balancing
      </span>
      <span style={{ color: '#d5d0c8' }}>|</span>
      {LEGEND_ITEMS.map(x => (
        <span key={x.l} className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: x.c }} />
          {x.l}
        </span>
      ))}
    </div>
  );
}
