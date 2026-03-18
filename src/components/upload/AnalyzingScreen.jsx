import { useState, useEffect } from 'react';
import { PROGRESS_STEPS } from '../../constants/prompt';

export default function AnalyzingScreen({ progress }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center fade-up">
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full pulse-ring" style={{ border: '3px solid #4A90E2' }} />
          <div className="absolute inset-3 rounded-full pulse-ring" style={{ border: '2px solid #F5A623', animationDelay: '0.5s' }} />
          <div className="absolute inset-6 rounded-full pulse-ring" style={{ border: '2px solid #7ED321', animationDelay: '1s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="spin-slow" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="4" r="3" fill="#4A90E2" />
              <circle cx="36" cy="20" r="3" fill="#F5A623" />
              <circle cx="20" cy="36" r="3" fill="#D0021B" />
              <circle cx="4" cy="20" r="3" fill="#7ED321" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1816' }}>{progress || PROGRESS_STEPS[0]}</h2>
        <p className="text-sm" style={{ color: '#9b9590' }}>This may take a moment</p>
      </div>
    </div>
  );
}
