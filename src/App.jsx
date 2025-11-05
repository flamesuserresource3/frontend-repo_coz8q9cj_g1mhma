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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Local Music Player</h1>
          <p className="text-slate-600">A modern, private player that runs entirely in your browser.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Playlist */}
          <div className="lg:col-span-2 space-y-4">
            <FilePicker onFilesSelected={onFilesSelected} />
            <Playlist
              tracks={tracks}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
              onRemove={handleRemove}
            />
          </div>

          {/* Right: Player */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <NowPlaying title={currentTrack?.name} isPlaying={isPlaying} />

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
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
                <audio ref={audioRef} hidden />
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4">
                <p className="text-sm opacity-90">Tips</p>
                <ul className="mt-1 text-sm list-disc pl-5 space-y-1 opacity-95">
                  <li>Press Space to play/pause.</li>
                  <li>Use Left/Right arrows to seek 5s.</li>
                  <li>Your files never leave your device.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
