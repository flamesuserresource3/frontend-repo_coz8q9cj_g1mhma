import React from 'react';

const NowPlaying = ({ title, isPlaying }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 p-4">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">Now Playing</p>
        <h3 className="truncate font-semibold text-slate-800">{title || '—'}</h3>
      </div>
      {/* Simple visualizer bars for vibe */}
      <div className="flex items-end gap-1 h-6">
        {[0,1,2,3,4].map((i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 transition-all duration-300 ${isPlaying ? 'animate-[pulse_0.9s_ease-in-out_infinite] origin-bottom' : 'opacity-40'}`}
            style={{ height: isPlaying ? `${6 + (i%3)*6}px` : '8px', animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default NowPlaying;
