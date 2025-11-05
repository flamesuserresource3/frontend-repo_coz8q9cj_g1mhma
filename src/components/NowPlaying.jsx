import React from 'react';

const NowPlaying = ({ title, isPlaying }) => {
  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
        {/* Artwork placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-amber-400 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.08),transparent_45%)]" />
        {/* Simple visualizer bars overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-1">
          {[0,1,2,3,4,5,6,7].map((i) => (
            <span
              key={i}
              className={`flex-1 rounded-full bg-white/70 transition-all duration-300 ${isPlaying ? 'animate-[pulse_0.9s_ease-in-out_infinite] origin-bottom' : 'opacity-40'}`}
              style={{ height: isPlaying ? `${10 + (i%4)*10}px` : '8px', animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Now Playing</p>
        <h3 className="mt-1 truncate text-xl font-semibold text-white">{title || '—'}</h3>
      </div>
    </div>
  );
};

export default NowPlaying;
