"use client";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

export type RadioTrack = {
  id: number;
  title: string;
  artist_name: string;
  artist_slug: string;
  mp3_url: string;
  cover_image?: string;
  duration?: string;
  featuring?: string;
};

type RadioContextType = {
  tracks: RadioTrack[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  loading: boolean;
  currentTrack: RadioTrack | null;
  play: (index?: number) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (pct: number) => void;
  setVolume: (v: number) => void;
  shuffle: () => void;
  shuffled: boolean;
};

const RadioContext = createContext<RadioContextType | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/artist-tracks')
      .then(r => r.json())
      .then(data => setTracks(data.tracks || []));
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    const audio = audioRef.current;
    const onTime = () => setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => next();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWait = () => setLoading(true);
    const onCan = () => setLoading(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWait);
    audio.addEventListener('canplay', onCan);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWait);
      audio.removeEventListener('canplay', onCan);
    };
  }, []);

  const loadTrack = useCallback((index: number, autoplay = true) => {
    const track = tracks[index];
    if (!track?.mp3_url || !audioRef.current) return;
    audioRef.current.src = track.mp3_url;
    audioRef.current.load();
    if (autoplay) audioRef.current.play().catch(() => {});
    // Increment play count
    fetch(`/api/artist-tracks/${track.id}`, { method: 'PUT' }).catch(() => {});
  }, [tracks]);

  const play = useCallback((index?: number) => {
    const idx = index ?? currentIndex;
    if (index !== undefined && index !== currentIndex) {
      setCurrentIndex(idx);
      loadTrack(idx, true);
    } else {
      audioRef.current?.play().catch(() => {});
    }
  }, [currentIndex, loadTrack]);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const toggle = useCallback(() => { isPlaying ? pause() : play(); }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    const idx = shuffled
      ? Math.floor(Math.random() * tracks.length)
      : (currentIndex + 1) % tracks.length;
    setCurrentIndex(idx);
    loadTrack(idx, true);
  }, [tracks, currentIndex, shuffled, loadTrack]);

  const prev = useCallback(() => {
    if (!tracks.length) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const idx = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentIndex(idx);
    loadTrack(idx, true);
  }, [tracks, currentIndex, loadTrack]);

  const seek = useCallback((pct: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const shuffle = useCallback(() => setShuffled(s => !s), []);

  useEffect(() => {
    if (tracks.length && !audioRef.current?.src) loadTrack(0, false);
  }, [tracks, loadTrack]);

  const currentTrack = tracks[currentIndex] || null;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <RadioContext.Provider value={{ tracks, currentIndex, isPlaying, progress, duration, volume, loading, currentTrack, play, pause, toggle, next, prev, seek, setVolume, shuffle, shuffled }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
}
