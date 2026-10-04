import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
// import { motion } from "framer-motion";
import { motion, AnimatePresence } from "motion/react";

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  isPlaying: boolean;
}

interface AudioPlayerProps {
  // Option to override the default romantic background track
  src?: string;
  // Controls whether the player button is visible (audio element is always mounted)
  visible?: boolean;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ src = "/bgAudio.mp3", visible = true }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Eagerly try to autoplay; if blocked by browser, start on first user interaction
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const startPlayback = () => {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {});
      };

      // Attempt immediate autoplay
      audio
        .play()
        .then(() => {
          // Autoplay succeeded (rare — desktop Chrome with engagement score, etc.)
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {
          // Blocked by browser — listen for the very first user gesture to start
          const events = ["click", "touchstart", "keydown"] as const;
          const handler = () => {
            startPlayback();
            events.forEach((e) => document.removeEventListener(e, handler));
          };
          events.forEach((e) =>
            document.addEventListener(e, handler, { once: true }),
          );
        });
    }, []);

    // Expose control functions to parent
    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              setHasInteracted(true);
            })
            .catch((err) => {
              console.warn("Playback prevented or failed:", err);
            });
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      toggle: () => {
        togglePlay();
      },
      get isPlaying() {
        return isPlaying;
      },
    }));

    const togglePlay = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((err) => {
            console.error("Audio playback error:", err);
          });
      }
    };

    // Watch for visibility changes to pause audio if user switches tabs
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden && audioRef.current && isPlaying) {
          audioRef.current.pause();
          // Keep state showing playing so we can resume when returning
        } else if (
          !document.hidden &&
          audioRef.current &&
          isPlaying &&
          hasInteracted
        ) {
          audioRef.current.play().catch(() => {});
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }, [isPlaying, hasInteracted]);

    return (
      <>
        {/* Audio element is always mounted so the ref is available for play() during user gestures */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          ref={(el) => {
            audioRef.current = el;
            if (el) el.volume = 0.1;
          }}
          src={src}
          loop
          preload="auto"
        />

        {/* Button UI only renders when visible */}
        {visible && (
          <div className="fixed bottom-6 right-6 z-40">
            <motion.button
              onClick={togglePlay}
              className="relative flex items-center justify-center w-14 h-14 rounded-full glass-panel shadow-lg focus:outline-none focus:ring-2 focus:ring-[#50C878]/50 hover:bg-stone-850/65 group cursor-pointer transition-colors duration-300"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title={isPlaying ? "Mute Music" : "Play Music"}
            >
              {/* Pulsing ring visualizer when playing */}
              {isPlaying && (
                <>
                  <span className="absolute inset-0 rounded-full bg-[#50C878]/20 animate-ping opacity-75" />
                  <span className="absolute -inset-2 rounded-full border border-[#50C878]/10 animate-pulse" />
                </>
              )}

              {/* Equalizer animation vs Mute indicator */}
              <div className="flex items-end justify-center gap-[3px] h-5 w-6">
                {isPlaying ? (
                  // Bouncing equalizer bars
                  [0, 1, 2, 3].map((bar) => {
                    const heights = ["h-2", "h-4", "h-3", "h-5"];
                    const animationDelays = [0, 0.15, 0.3, 0.45];
                    return (
                      <motion.span
                        key={bar}
                        className={`w-[3px] bg-[#50C878] rounded-full ${heights[bar]}`}
                        animate={{
                          scaleY: [1, 2.2, 1],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: animationDelays[bar],
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })
                ) : (
                  // Muted Icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-stone-400 group-hover:text-[#50C878] transition-colors"
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="22" y1="9" x2="16" y2="15" />
                    <line x1="16" y1="9" x2="22" y2="15" />
                  </svg>
                )}
              </div>
            </motion.button>
          </div>
        )}
      </>
    );
  },
);

AudioPlayer.displayName = "AudioPlayer";
