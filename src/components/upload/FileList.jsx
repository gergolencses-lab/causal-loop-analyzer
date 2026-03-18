import { getFileIcon } from '../../utils/fileHelpers';

export default function FileList({ files, onRemove }) {
  if (files.length === 0) return null;

  return (
    <div className="mt-5 space-y-2 fade-up">
      {files.map((file, i) => {
        const icon = getFileIcon(file.name);
        return (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: '#faf9f7' }}>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded text-xs font-bold text-white" style={{ background: icon.color }}>
                {icon.label}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: '#3a3632' }}>{file.name}</p>
                <p className="text-xs" style={{ color: '#9b9590' }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ color: '#9b9590' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
