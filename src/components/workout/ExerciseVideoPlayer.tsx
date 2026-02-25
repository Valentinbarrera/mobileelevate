import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Maximize2, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ExerciseVideoPlayerProps {
  videoUrl: string;
  exerciseName: string;
  compact?: boolean;
  onClose?: () => void;
}

const ExerciseVideoPlayer = ({ 
  videoUrl, 
  exerciseName, 
  compact = false,
  onClose 
}: ExerciseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  if (compact) {
    return (
      <motion.div 
        className="relative rounded-xl overflow-hidden bg-black/50 border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AspectRatio ratio={16 / 9}>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            muted={isMuted}
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onClick={togglePlay}
          />
          
          {/* Play/Pause Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
            onClick={togglePlay}
          >
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                >
                  <Play className="w-6 h-6 text-primary-foreground ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 cursor-pointer"
            onClick={handleProgressClick}
          >
            <motion.div 
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mini Controls */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </AspectRatio>
      </motion.div>
    );
  }

  // Full video player (modal style)
  return (
    <motion.div 
      className="relative rounded-2xl overflow-hidden bg-black border border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <AspectRatio ratio={16 / 9}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain bg-black"
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onClick={togglePlay}
        />

        {/* Center Play Button */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePlay}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl glow-primary"
              >
                <Play className="w-10 h-10 text-primary-foreground ml-1" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              {/* Progress Bar */}
              <div 
                className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3"
                onClick={handleProgressClick}
              >
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-medium truncate max-w-[150px]">
                    {exerciseName}
                  </span>
                  <button
                    onClick={handleFullscreen}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AspectRatio>
    </motion.div>
  );
};

export default ExerciseVideoPlayer;
