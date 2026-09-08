import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Scissors, 
  RotateCcw,
  Maximize2
} from 'lucide-react';

interface PostVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  startTime?: number; // trim in (seconds)
  endTime?: number;   // trim out (seconds)
  isMutedDefault?: boolean; // whether sound is removed/muted
  defaultVolume?: number; // 0 to 1
  autoPlayInline?: boolean;
  onExpand?: () => void;
  isCompact?: boolean; // for gallery card vs lightbox
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PostVideoPlayer: React.FC<PostVideoPlayerProps> = ({
  videoUrl,
  posterUrl,
  title,
  startTime = 0,
  endTime = 0,
  isMutedDefault = true,
  defaultVolume = 0.8,
  autoPlayInline = false,
  onExpand,
  isCompact = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(isMutedDefault);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(defaultVolume);
  const [hasStarted, setHasStarted] = useState(autoPlayInline);

  const youtubeId = extractYouTubeId(videoUrl);

  // Sync mute state when prop changes
  useEffect(() => {
    setIsMuted(isMutedDefault);
  }, [isMutedDefault]);

  // Handle native video time update with trim boundary enforcement
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // If reached trim out point, loop back to trim in or pause
    if (endTime > 0 && current >= endTime) {
      videoRef.current.currentTime = startTime;
      if (!isCompact) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    if (startTime > 0) {
      videoRef.current.currentTime = startTime;
    }
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;

    if (autoPlayInline) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      // If before trim in or past trim out, reset to startTime
      if (videoRef.current.currentTime < startTime || (endTime > 0 && videoRef.current.currentTime >= endTime)) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch(err => console.log('Autoplay prevented:', err));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const restartTrim = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const hasTrim = startTime > 0 || (endTime > 0 && duration > 0 && endTime < duration);

  // YouTube Embed rendering
  if (youtubeId) {
    const ytParams = new URLSearchParams();
    if (startTime > 0) ytParams.append('start', Math.floor(startTime).toString());
    if (endTime > 0) ytParams.append('end', Math.floor(endTime).toString());
    if (isMuted) ytParams.append('mute', '1');
    ytParams.append('autoplay', autoPlayInline || hasStarted ? '1' : '0');
    ytParams.append('rel', '0');

    return (
      <div className="relative w-full h-full aspect-video bg-black overflow-hidden select-none">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${ytParams.toString()}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
        {hasTrim && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 border border-[#55ffff]/50 text-[#55ffff] text-[10px] font-mono flex items-center gap-1 z-10 pointer-events-none">
            <Scissors className="w-3 h-3" />
            <span>{formatTime(startTime)} - {endTime > 0 ? formatTime(endTime) : 'Fim'}</span>
          </div>
        )}
      </div>
    );
  }

  // HTML5 Direct Video player
  return (
    <div 
      className="relative w-full h-full aspect-video bg-black overflow-hidden group select-none"
      onClick={isCompact ? togglePlay : undefined}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (videoRef.current) videoRef.current.currentTime = startTime;
        }}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Play overlay button if paused */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/20 transition-all cursor-pointer z-10"
        >
          <div className="w-12 h-12 rounded-full bg-[#55ffff]/90 hover:bg-[#55ffff] text-black flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110 active:scale-95">
            <Play className="w-6 h-6 ml-0.5 fill-black" />
          </div>
        </div>
      )}

      {/* Badges Overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20 pointer-events-auto">
        {hasTrim && (
          <div 
            className="px-2 py-0.5 bg-black/85 border border-[#55ffff]/60 text-[#55ffff] text-[10px] font-mono flex items-center gap-1"
            title={`Trecho cortado: de ${formatTime(startTime)} até ${endTime > 0 ? formatTime(endTime) : 'Fim'}`}
          >
            <Scissors className="w-3 h-3 text-[#55ffff]" />
            <span>{formatTime(startTime)} - {endTime > 0 ? formatTime(endTime) : formatTime(duration)}</span>
          </div>
        )}

        {/* Audio status / toggle button */}
        <button
          type="button"
          onClick={toggleMute}
          className={`px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
            isMuted 
              ? 'bg-black/85 text-[#ff8888] border border-[#ff8888]/40 hover:bg-[#ff8888]/20' 
              : 'bg-black/85 text-[#55ff55] border border-[#55ff55]/60 hover:bg-[#55ff55]/20'
          }`}
          title={isMuted ? 'Vídeo sem som (clique para ativar áudio)' : 'Vídeo com som (clique para silenciar)'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3 h-3" />
              <span>Sem Som</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3" />
              <span>Com Som</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Bottom Controls Bar (shown on hover or when playing in non-compact mode) */}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 mc-btn text-white hover:text-[#55ffff] cursor-pointer"
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={restartTrim}
            className="p-1.5 mc-btn text-[#8e8999] hover:text-white cursor-pointer"
            title="Reiniciar a partir do início do corte (Trim)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <span className="text-[10px] font-mono text-white/90">
            {formatTime(currentTime)} / {endTime > 0 ? formatTime(endTime) : formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio volume slider if unmuted and not compact */}
          {!isCompact && !isMuted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-[#55ffff] cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          )}

          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 mc-btn text-white hover:text-[#55ffff] cursor-pointer"
            title={isMuted ? 'Ativar som' : 'Silenciar som'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ff8888]" /> : <Volume2 className="w-3.5 h-3.5 text-[#55ff55]" />}
          </button>

          {onExpand && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="p-1.5 mc-btn text-white hover:text-[#55ffff] cursor-pointer"
              title="Expandir em tela cheia"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
