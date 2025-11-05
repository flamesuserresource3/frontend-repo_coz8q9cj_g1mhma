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
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <Music2 className="h-8 w-8 mb-2" />
        <p>No tracks yet. Add some audio files to start listening.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-xl overflow-hidden border border-slate-200 bg-white/60">
      {tracks.map((t, i) => (
        <li
          key={t.id}
          className={`flex items-center justify-between p-3 transition cursor-pointer hover:bg-white ${i === currentIndex ? 'bg-blue-50/60' : ''}`}
          onClick={() => onSelect(i)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-semibold ${i === currentIndex ? 'bg-blue-500' : 'bg-slate-400'}`}>{i + 1}</div>
            <div className="min-w-0">
              <p className={`truncate font-medium ${i === currentIndex ? 'text-blue-700' : 'text-slate-800'}`}>{t.name}</p>
              <p className="text-xs text-slate-500">{formatTime(t.duration)}</p>
            </div>
          </div>
          <button
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"
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
