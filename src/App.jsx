import React, { useEffect, useMemo, useRef, useState } from 'react';
import FilePicker from './components/FilePicker.jsx';
import Playlist from './components/Playlist.jsx';
import PlayerControls from './components/PlayerControls.jsx';
import NowPlaying from './components/NowPlaying.jsx';

function App() {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState([]); // {id, name, url, duration}
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      tracks.forEach(t => URL.revokeObjectURL(t.url));
    };
  }, [tracks]);

  // Keep audio element volume/mute in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  // When track changes, load and optionally autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentIndex < 0 || currentIndex >= tracks.length) return;
    audio.src = tracks[currentIndex].url;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(NaN);
    const play = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };
    play();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const onFilesSelected = (files) => {
    const newTracks = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      duration: NaN,
    }));
    setTracks(prev => [...prev, ...newTracks]);
    if (currentIndex === -1 && newTracks.length > 0) {
      setCurrentIndex(0);
    }
  };

  const handleRemove = (index) => {
    setTracks(prev => {
      const toRemove = prev[index];
      if (toRemove) URL.revokeObjectURL(toRemove.url);
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setCurrentIndex(-1);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(NaN);
      } else if (index < currentIndex) {
        setCurrentIndex(ci => Math.max(0, ci - 1));
      } else if (index === currentIndex) {
        setCurrentIndex((ci) => Math.min(ci, next.length - 1));
      }
      return next;
    });
  };

  const nextIndex = useMemo(() => {
    if (tracks.length === 0) return -1;
    if (shuffle) {
      if (tracks.length === 1) return currentIndex;
      let rand = currentIndex;
      while (rand === currentIndex) {
        rand = Math.floor(Math.random() * tracks.length);
      }
      return rand;
    }
    return (currentIndex + 1) % tracks.length;
  }, [tracks.length, currentIndex, shuffle]);

  const prevIndex = useMemo(() => {
    if (tracks.length === 0) return -1;
    if (shuffle) return nextIndex; // simple behavior in shuffle mode
    return (currentIndex - 1 + tracks.length) % tracks.length;
  }, [tracks.length, currentIndex, shuffle, nextIndex]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {}
    }
  };

  const handleSeek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    if (repeat) {
      // restart current track
      handleSeek(0);
      if (!isPlaying) handlePlayPause();
      return;
    }
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      handleSeek(0);
      return;
    }
    setCurrentIndex(prevIndex);
  };

  // Audio element event bindings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onLoaded = () => {
      setDuration(audio.duration || NaN);
      // save known duration to track list
      setTracks(prev => prev.map((t, i) => i === currentIndex ? { ...t, duration: audio.duration || t.duration } : t));
    };
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setCurrentIndex(nextIndex);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [currentIndex, nextIndex, repeat]);

  const currentTrack = tracks[currentIndex] || null;

  // Keyboard shortcuts: space play/pause, arrows seek
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }
      if (e.code === 'ArrowRight') {
        handleSeek(Math.min((audioRef.current?.currentTime || 0) + 5, duration || 0));
      }
      if (e.code === 'ArrowLeft') {
        handleSeek(Math.max((audioRef.current?.currentTime || 0) - 5, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="min-h-screen bg-[rgb(10,10,12)] text-slate-100 selection:bg-indigo-600/30">
      {/* Main layout */}
      <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_360px]">
          {/* Sidebar */}
          <aside className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wide text-slate-400">Library</h2>
            </div>
            <FilePicker onFilesSelected={onFilesSelected} />
            <div className="mt-6 rounded-xl bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/10 p-4">
              <p className="text-xs text-slate-300">Shortcuts</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300/90">
                <li>Space — Play/Pause</li>
                <li>←/→ — Seek ±5s</li>
                <li>Files stay on your device</li>
              </ul>
            </div>
          </aside>

          {/* Now Playing panel */}
          <main className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 lg:p-6 backdrop-blur">
            <NowPlaying title={currentTrack?.name} isPlaying={isPlaying} />
          </main>

          {/* Playlist */}
          <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 backdrop-blur min-h-[360px]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wide text-slate-400">Playlist</h2>
              <span className="text-xs text-slate-400">{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
            </div>
            <div className="max-h-[60vh] overflow-auto pr-1">
              <Playlist
                tracks={tracks}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
                onRemove={handleRemove}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Bottom player bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[rgb(17,17,20)]/95 backdrop-blur supports-[backdrop-filter]:bg-[rgb(17,17,20)]/80">
        <div className="mx-auto max-w-[1200px] px-4 py-3">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_minmax(480px,1fr)_1fr]">
            {/* Left: track meta */}
            <div className="min-w-0 hidden md:flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-600 ring-1 ring-white/10" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/90">{currentTrack?.name || 'Nothing playing'}</p>
                <p className="truncate text-xs text-slate-400">Local file</p>
              </div>
            </div>

            {/* Middle: controls */}
            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onPrev={handlePrev}
              onNext={handleNext}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              volume={volume}
              onVolumeChange={setVolume}
              muted={muted}
              onToggleMute={() => setMuted(m => !m)}
              shuffle={shuffle}
              onToggleShuffle={() => setShuffle(s => !s)}
              repeat={repeat}
              onToggleRepeat={() => setRepeat(r => !r)}
            />

            {/* Right: spacer */}
            <div className="hidden md:block" />
          </div>
        </div>
        <audio ref={audioRef} hidden />
      </div>
    </div>
  );
}

export default App;
