import React, { useState, useRef, useEffect } from 'react';
import '../styles/Player.css';

const Player = ({ currentSong, onNext, onPrevious, shouldPause = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0); // 0: no repeat, 1: repeat all, 2: repeat one
  const audioRef = useRef(null);
  const fastForwardRef = useRef(null);
  const nextPressTimerRef = useRef(null);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      // Try to play, but handle the promise rejection
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.log('Autoplay prevented:', error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong]);

  useEffect(() => {
    return () => {
      stopFastForward();
      if (nextPressTimerRef.current) {
        clearTimeout(nextPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shouldPause && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [shouldPause]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current?.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.log('Play prevented:', error);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleError = (e) => {
    console.error('Audio playback error:', e);
    setIsPlaying(false);
    // You could show a toast here or handle the error
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const handleNext = () => {
    // If shuffle is on, let the parent component handle shuffle logic
    onNext(shuffle);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
    } else {
      onPrevious();
    }
  };

  const handleEnded = () => {
    if (repeat === 2) {
      // Repeat one song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Move to next song
      handleNext();
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleRepeat = () => {
    setRepeat((repeat + 1) % 3);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const startFastForward = () => {
    if (audioRef.current) {
      fastForwardRef.current = setInterval(() => {
        if (audioRef.current.currentTime < audioRef.current.duration - 5) {
          audioRef.current.currentTime += 5; // Skip forward 5 seconds
        }
      }, 200); // Every 200ms
    }
  };

  const stopFastForward = () => {
    if (fastForwardRef.current) {
      clearInterval(fastForwardRef.current);
      fastForwardRef.current = null;
    }
  };

  const handleNextMouseDown = () => {
    nextPressTimerRef.current = setTimeout(() => {
      startFastForward();
      nextPressTimerRef.current = null;
    }, 500); // 500ms delay
  };

  const handleNextMouseUp = () => {
    if (nextPressTimerRef.current) {
      // Short press - go to next song
      clearTimeout(nextPressTimerRef.current);
      nextPressTimerRef.current = null;
      handleNext();
    } else {
      // Long press - stop fast-forward
      stopFastForward();
    }
  };

  const handleNextMouseLeave = () => {
    if (nextPressTimerRef.current) {
      clearTimeout(nextPressTimerRef.current);
      nextPressTimerRef.current = null;
    }
    stopFastForward();
  };

  return (
    <div className="player-container">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Left Side - Song Info */}
      <div className="player-song-info">
        <div className="player-album-art">
          {currentSong?.cover ? (
            <img src={currentSong.cover} alt="album" style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
          ) : (
            '♪'
          )}
        </div>
        {currentSong && (
          <div className="player-song-details">
            <h4>{currentSong.title}</h4>
            <p>{currentSong.artist}</p>
          </div>
        )}
      </div>

      {/* Center - Controls and Progress */}
      <div className="player-controls">
        <div className="player-buttons">
          <button
            className={`control-btn shuffle ${shuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            🔀
          </button>

          <button
            className="control-btn"
            onClick={handlePrevious}
            title="Previous"
          >
            ⏮️
          </button>

          <button
            className={`control-btn play-btn`}
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <button
            className="control-btn"
            onMouseDown={handleNextMouseDown}
            onMouseUp={handleNextMouseUp}
            onMouseLeave={handleNextMouseLeave}
            title="Next (hold for fast-forward)"
          >
            ⏭️
          </button>

          <button
            className={`control-btn repeat ${repeat > 0 ? 'active' : ''}`}
            onClick={toggleRepeat}
            title={repeat === 0 ? 'Repeat Off' : repeat === 1 ? 'Repeat All' : 'Repeat One'}
          >
            {repeat === 2 ? '🔁¹' : '🔁'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="progress-bar"
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Side - Volume Control */}
      <div className="player-volume">
        <button className="volume-btn" title="Mute">
          {volume === 0 ? '🔇' : volume <= 0.5 ? '🔉' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
};

export default Player;
