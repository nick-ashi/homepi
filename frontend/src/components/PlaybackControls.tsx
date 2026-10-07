interface PlaybackControlsProps {
  isPlaying: boolean;
  onSkipBack: () => void;
  onPlayPause: () => void;
  onSkipNext: () => void;
}

export function PlaybackControls({ isPlaying, onSkipBack, onPlayPause, onSkipNext }: PlaybackControlsProps) {
  return (
    <div className="playback-controls">
      <button className="playback-button" onClick={onSkipBack} aria-label="Skip back">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
        </svg>
      </button>

      <button className="playback-button playback-button-primary" onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button className="playback-button" onClick={onSkipNext} aria-label="Skip to next">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6h2v12h-2zM6 6v12l8.5-6z" />
        </svg>
      </button>
    </div>
  );
}
