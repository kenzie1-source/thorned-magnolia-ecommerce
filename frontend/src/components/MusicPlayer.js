import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);

  // R&B playlist - using royalty-free alternatives for demo
  const playlist = [
    {
      title: "Smooth Vibes",
      artist: "R&B Style",
      src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Demo track
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      
      // Auto-play on component mount
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log('Auto-play prevented by browser:', e);
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.log('Playback failed:', e);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackEnd = () => {
    // Loop the current track or move to next
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div className="music-player fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-warm-sage/20">
        <Button
          onClick={togglePlayPause}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-warm-sage/10"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-warm-sage" />
          ) : (
            <Play className="h-4 w-4 text-warm-sage" />
          )}
        </Button>
        
        <audio
          ref={audioRef}
          loop
          onEnded={handleTrackEnd}
        >
          {/* For demo purposes - in production, use actual licensed music */}
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBr+D" type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
        <div className="bg-charcoal text-cream-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {isPlaying ? 'Pause music' : 'Play music'}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;