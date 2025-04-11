"use client";

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  timestamp?: number;
}

export default function VideoPlayer({ videoId, timestamp = 0 }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  
  // Jump to timestamp when it changes
  useEffect(() => {
    if (playerRef.current && timestamp !== undefined) {
      playerRef.current.seekTo(timestamp, 'seconds');
      setPlaying(true);
    }
  }, [timestamp]);
  
  return (
    <div className="bg-gray-800 shadow rounded-lg p-4">      
      <div className="relative w-full pt-[50.25%]">
        <div className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden">
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${videoId}`}
            width="100%"
            height="100%"
            playing={playing}
            controls={true}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            config={{
                playerVars: {
                  start: Math.floor(timestamp),
                },
            }}
          />
        </div>
      </div>
    </div>
  );
}