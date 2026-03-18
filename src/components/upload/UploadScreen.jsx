import { useState, useRef, useCallback } from 'react';
import { LANGUAGES } from '../../constants/prompt';
import { isAcceptedFile } from '../../utils/fileHelpers';
import FileList from './FileList';

export default function UploadScreen({ error, onAnalyze }) {
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const hasInput = files.length > 0 || textInput.trim().length > 0;

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(isAcceptedFile);
    if (dropped.length > 0) setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleFileInput = (e) => {
    const selected = Array.from(e.target.files).filter(isAcceptedFile);
    if (selected.length > 0) setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 fade-up">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5" style={{ background: '#e8e6e1', color: '#6b6560' }}>
          Systems Thinking &bull; Powered by Claude AI
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#1a1816', letterSpacing: '-0.02em' }}>
          Causal Loop Analyzer
        </h1>
        <p className="text-lg" style={{ color: '#7a756e' }}>
          Upload transcripts or describe a business problem to generate an interactive systems map
        </p>
      </div>

      <div className="rounded-2xl p-8 fade-up fade-up-d1" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)' }}>
        {/* Drop zone */}
        <div
          className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'drop-zone-active' : ''}`}
          style={{ borderColor: isDragging ? '#4A90E2' : '#d5d0c8', background: isDragging ? '#eef6ff' : '#faf9f7' }}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.md,.docx,.doc" onChange={handleFileInput} className="hidden" />
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="8" width="40" height="32" rx="4" stroke="#9B9590" strokeWidth="2" fill="none" />
            <path d="M24 18v12M18 24l6-6 6 6" stroke="#9B9590" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-base font-semibold mb-1" style={{ color: '#3a3632' }}>
            Drop files here or click to browse
          </p>
          <p className="text-sm" style={{ color: '#9b9590' }}>
            PDF, DOCX, TXT &mdash; coaching sessions, meeting notes, interviews
          </p>
        </div>

        <FileList files={files} onRemove={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))} />

        {/* OR divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ background: '#e5e0d8' }} />
          <span className="text-xs font-medium" style={{ color: '#b5b0a8' }}>OR DESCRIBE THE PROBLEM</span>
          <div className="flex-1 h-px" style={{ background: '#e5e0d8' }} />
        </div>

        {/* Text area */}
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Describe the business problem, organizational challenge, or paste meeting notes here&hellip;"
          className="w-full h-36 p-4 rounded-xl border-2 resize-none text-sm transition-colors focus:outline-none"
          style={{ borderColor: '#e5e0d8', color: '#3a3632', background: '#faf9f7' }}
          onFocus={e => e.target.style.borderColor = '#4A90E2'}
          onBlur={e => e.target.style.borderColor = '#e5e0d8'}
        />

        {/* Language selector */}
        <div className="mt-5">
          <p className="text-xs font-medium mb-2" style={{ color: '#9b9590' }}>Output language</p>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: language === lang.code ? '#1a1816' : '#faf9f7',
                  color: language === lang.code ? '#fff' : '#6b6560',
                  border: `1.5px solid ${language === lang.code ? '#1a1816' : '#e5e0d8'}`,
                }}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          onClick={() => onAnalyze(files, textInput, language)}
          disabled={!hasInput}
          className="mt-6 w-full py-4 rounded-xl font-semibold text-base transition-all duration-200"
          style={{
            background: hasInput ? '#1a1816' : '#d5d0c8',
            color: hasInput ? '#fff' : '#9b9590',
            cursor: hasInput ? 'pointer' : 'not-allowed',
            boxShadow: hasInput ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
          }}
          onMouseEnter={e => { if (hasInput) e.currentTarget.style.background = '#2d2a26'; }}
          onMouseLeave={e => { if (hasInput) e.currentTarget.style.background = '#1a1816'; }}
        >
          Analyze System Dynamics
        </button>

        <p className="text-center text-xs mt-4" style={{ color: '#b5b0a8' }}>
          Transcripts are processed securely via Claude AI
        </p>
      </div>
    </div>
  );
}
