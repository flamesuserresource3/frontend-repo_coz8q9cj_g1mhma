import React from 'react';
import { Music2, Trash2 } from 'lucide-react';

const formatTime = (sec) => {
  if (!isFinite(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const Playlist = ({ tracks, currentIndex, onSelect, onRemove }) => {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
        <Music2 className="h-8 w-8 mb-2" />
        <p>No tracks yet. Add some audio files to start listening.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5 rounded-xl overflow-hidden border border-white/10 bg-white/5">
      {tracks.map((t, i) => (
        <li
          key={t.id}
          className={`flex items-center justify-between p-3 transition cursor-pointer hover:bg-white/10 ${i === currentIndex ? 'bg-white/10' : ''}`}
          onClick={() => onSelect(i)}
        >
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className={`h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-semibold ${i === currentIndex ? 'bg-indigo-600' : 'bg-white/10 ring-1 ring-white/10'}`}>{i + 1}</div>
            <div className="min-w-0">
              <p className={`truncate font-medium ${i === currentIndex ? 'text-white' : 'text-slate-100/90'}`}>{t.name}</p>
              <p className="text-xs text-slate-400">{formatTime(t.duration)}</p>
            </div>
          </div>
          <button
            className="p-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white"
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            title="Remove from playlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Playlist;
