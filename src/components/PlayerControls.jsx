import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';

const formatTime = (sec) => {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PlayerControls = ({
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  muted,
  onToggleMute,
  shuffle,
  onToggleShuffle,
  repeat,
  onToggleRepeat,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Seek Bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums text-slate-300 w-10 text-right">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={isFinite(duration) && duration > 0 ? duration : 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <span className="text-xs tabular-nums text-slate-300 w-10">{formatTime(duration)}</span>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-md hover:bg-white/10 ${shuffle ? 'text-indigo-400' : 'text-slate-300'}`}
            onClick={onToggleShuffle}
            title="Shuffle"
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button
            className={`p-2 rounded-md hover:bg-white/10 ${repeat ? 'text-indigo-400' : 'text-slate-300'}`}
            onClick={onToggleRepeat}
            title="Repeat"
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-white"
            onClick={onPrev}
            title="Previous"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            className="p-3 rounded-full bg-white text-slate-900 shadow-lg hover:shadow-xl"
            onClick={onPlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          </button>
          <button
            className="p-2 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-white"
            onClick={onNext}
            title="Next"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md hover:bg-white/10 text-slate-200"
            onClick={onToggleMute}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-28 accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
