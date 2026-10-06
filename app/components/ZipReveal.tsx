import { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type TargetAndTransition,
} from "motion/react";

interface ZipRevealProps {
  onRevealStart: () => void; // Triggered immediately on click (plays music)
  onRevealComplete: () => void; // Triggered after unzipping completes (allows scroll)
}

// Floating animations helper
const floatAnimation = (delay: number): TargetAndTransition => ({
  y: [0, -12, 0],
  rotate: [0, 4, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
    delay: delay,
  },
});

export function ZipReveal({ onRevealStart, onRevealComplete }: ZipRevealProps) {
  const [vh, setVh] = useState(800);
  const dragY = useMotionValue(0);
  const hasStarted = useRef(false);
  const isAnimating = useRef(false);

  useEffect(() => {
    setVh(window.innerHeight);
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragStart = () => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      onRevealStart();
    }
  };

  const handleDragEnd = () => {
    if (isAnimating.current) return;
    const currentY = dragY.get();
    const threshold = vh * 0.4; // Dragging past 40% height snaps open

    if (currentY >= threshold) {
      isAnimating.current = true;
      animate(dragY, vh, {
        type: "spring",
        stiffness: 85,
        damping: 17,
        onComplete: () => {
          onRevealComplete();
        },
      });
    } else {
      animate(dragY, 0, {
        type: "spring",
        stiffness: 110,
        damping: 18,
      });
    }
  };

  // Transform bindings for curtains
  const leftX = useTransform(dragY, [0, vh], ["0%", "-100%"]);
  const leftClip = useTransform(
    dragY,
    [0, vh],
    [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(0% 0%, 0% 0%, 100% 100%, 0% 100%)",
    ],
  );

  const rightX = useTransform(dragY, [0, vh], ["0%", "100%"]);
  const rightClip = useTransform(
    dragY,
    [0, vh],
    [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%)",
    ],
  );

  // Text and decorative glow opacity transforms
  const textOpacity = useTransform(dragY, [0, vh * 0.35], [1, 0]);
  const glowOpacity = useTransform(dragY, [0, vh * 0.35], [0.4, 0]);

  return (
    <motion.div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center select-none">
      {/* Left Curtain Panel */}
      <motion.div
        style={{ x: leftX, clipPath: leftClip }}
        className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-stone-950 via-[#1a2e1a] to-stone-950 border-r border-[#50C878]/20 flex items-center justify-end overflow-hidden"
      >
        {/* Ornate Gold Border Line */}
        <div className="absolute right-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#808000]/15 to-transparent flex flex-col items-center justify-around py-24 pointer-events-none">
          <div className="w-2 h-2 rotate-45 border border-[#808000]/35 bg-stone-950" />
          <div className="w-1 h-1 rotate-45 bg-[#808000]/20" />
          <div className="w-2 h-2 rotate-45 border border-[#808000]/35 bg-stone-950" />
          <div className="w-1 h-1 rotate-45 bg-[#808000]/20" />
          <div className="w-2 h-2 rotate-45 border border-[#808000]/35 bg-stone-950" />
        </div>

        {/* Scattered floating icons */}
        <motion.div
          animate={floatAnimation(0)}
          className="absolute left-[15%] top-[22%] text-[#808000]/15 pointer-events-none"
        >
          <RoseIcon className="w-16 h-16 sm:w-20 sm:h-20" />
        </motion.div>

        <motion.div
          animate={floatAnimation(1.5)}
          className="absolute left-[35%] top-[55%] text-[#50C878]/25 pointer-events-none"
        >
          <HeartIcon className="w-7 h-7 sm:w-9 sm:h-9" />
        </motion.div>

        <motion.div
          animate={floatAnimation(0.8)}
          className="absolute left-[20%] bottom-[22%] text-[#50C878]/20 pointer-events-none"
        >
          <SparkleIcon className="w-6 h-6" />
        </motion.div>

        {/* Left zipper tape & teeth */}
        <div className="absolute right-0 top-0 w-3 h-full bg-stone-900 shadow-inner flex items-center justify-end">
          <div
            className="w-1.5 h-full opacity-80"
            style={{
              background:
                "repeating-linear-gradient(to bottom, #FFE5B4 0px, #FFE5B4 6px, transparent 6px, transparent 12px)",
            }}
          />
        </div>
      </motion.div>

      {/* Right Curtain Panel */}
      <motion.div
        style={{ x: rightX, clipPath: rightClip }}
        className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-stone-950 via-[#1a2e1a] to-stone-950 border-l border-[#50C878]/20 flex items-center justify-start overflow-hidden"
      >
        {/* Ornate Gold Border Line */}
        <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#808000]/15 to-transparent flex flex-col items-center justify-around py-24 pointer-events-none">
          <div className="w-2 h-2 rotate-45 border border-[#808000]/35 bg-stone-950" />
          <div className="w-1 h-1 rotate-45 bg-[#808000]/20" />
          <div className="w-2 h-2 rotate-45 border border-[#808000]/35 bg-stone-950" />
          <div className="w-1 h-1 rotate-45 bg-[#808000]/20" />
          <div className="w-2 h-2 rotate-45 border border-[#808000]/35 bg-stone-950" />
        </div>

        {/* Scattered floating icons */}
        <motion.div
          animate={floatAnimation(2.2)}
          className="absolute right-[35%] top-[25%] text-[#50C878]/25 pointer-events-none"
        >
          <HeartIcon className="w-7 h-7 sm:w-9 sm:h-9" />
        </motion.div>

        <motion.div
          animate={floatAnimation(0.5)}
          className="absolute right-[15%] top-[50%] text-[#808000]/15 pointer-events-none"
        >
          <RoseIcon className="w-16 h-16 sm:w-20 sm:h-20" />
        </motion.div>

        <motion.div
          animate={floatAnimation(1.2)}
          className="absolute right-[20%] bottom-[25%] text-[#50C878]/20 pointer-events-none"
        >
          <SparkleIcon className="w-6 h-6" />
        </motion.div>

        {/* Right zipper tape & teeth */}
        <div className="absolute left-0 top-0 w-3 h-full bg-stone-900 shadow-inner flex items-center justify-start">
          <div
            className="w-1.5 h-full opacity-80"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, #FFE5B4 6px, #FFE5B4 12px)",
            }}
          />
        </div>
      </motion.div>

      {/* Interactive Zipper Column and Puller */}
      <div className="absolute inset-y-0 w-12 flex flex-col items-center justify-start pointer-events-none z-20">
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: vh }}
          dragElastic={0}
          dragMomentum={false}
          style={{ y: dragY }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="absolute top-0 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          {/* Golden metallic zipper pull assembly */}
          <svg
            width="60"
            height="100"
            viewBox="-30 -20 60 80"
            className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
          >
            <defs>
              {/* Premium Gold Gradients */}
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF5E0" />
                <stop offset="30%" stopColor="#FFE5B4" />
                <stop offset="70%" stopColor="#D4B07A" />
                <stop offset="100%" stopColor="#808000" />
              </linearGradient>
              <radialGradient id="ringGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFF5E0" />
                <stop offset="50%" stopColor="#FFE5B4" />
                <stop offset="100%" stopColor="#5a6600" />
              </radialGradient>
              <filter
                id="zipperShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="4"
                  floodOpacity="0.5"
                />
              </filter>
            </defs>

            <path
              d="M -16 -12 L 16 -12 L 11 12 L -11 12 Z"
              fill="url(#goldGrad)"
              stroke="#5a6600"
              strokeWidth="1.5"
              filter="url(#zipperShadow)"
            />
            <rect
              x="-8"
              y="-17"
              width="16"
              height="6"
              rx="1.5"
              fill="url(#goldGrad)"
              stroke="#5a6600"
              strokeWidth="1"
            />
            <rect
              x="-4"
              y="-6"
              width="8"
              height="14"
              rx="2.5"
              fill="url(#goldGrad)"
              stroke="#5a6600"
              strokeWidth="1"
            />

            <g>
              <rect
                x="-3"
                y="5"
                width="6"
                height="10"
                rx="1"
                fill="url(#goldGrad)"
                stroke="#5a6600"
                strokeWidth="1"
              />
              <rect
                x="-8"
                y="12"
                width="16"
                height="38"
                rx="4"
                fill="url(#goldGrad)"
                stroke="#5a6600"
                strokeWidth="1.5"
                filter="url(#zipperShadow)"
              />
              <line
                x1="-4"
                y1="20"
                x2="4"
                y2="20"
                stroke="#5a6600"
                strokeWidth="1"
              />
              <line
                x1="-4"
                y1="24"
                x2="4"
                y2="24"
                stroke="#5a6600"
                strokeWidth="1"
              />
              <line
                x1="-4"
                y1="28"
                x2="4"
                y2="28"
                stroke="#5a6600"
                strokeWidth="1"
              />
              <circle
                cx="0"
                cy="38"
                r="4.5"
                fill="#1c1917"
                stroke="#5a6600"
                strokeWidth="1"
              />
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Floating text & call to action */}
      <motion.div
        style={{ opacity: textOpacity, top: "32%" }}
        className="absolute text-center z-30 w-80 px-4 pointer-events-none"
      >
        <h2 className="text-[#FFE5B4] font-serif-romantic text-3xl sm:text-4xl tracking-wide leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          #TheIVLeague#
        </h2>
        <p className="text-[#50C878]/80 font-sans text-xs uppercase tracking-[0.25em] mt-3 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Drag down to reveal
        </p>
      </motion.div>

      {/* Glowing aura behind the zipper pull */}
      <motion.div
        style={{ opacity: glowOpacity, top: "10%" }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-32 h-32 rounded-full bg-[#50C878]/10 blur-2xl z-10 pointer-events-none"
      />
    </motion.div>
  );
}

// Decorative SVGs

const RoseIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
  >
    {/* Rose Center spiral */}
    <path
      d="M 32 32 C 30 30, 28 32, 28 34 C 28 37, 33 37, 34 34 C 36 29, 29 26, 26 29 C 22 34, 27 41, 34 40 C 42 39, 44 29, 38 23 C 31 16, 19 22, 20 33 C 21 45, 38 48, 44 38 C 50 28, 42 14, 29 16 C 16 18, 10 35, 20 46 C 30 57, 51 51, 52 35 C 53 19, 35 6, 17 15"
      strokeLinecap="round"
    />
    {/* Leaves */}
    <path
      d="M 17 48 C 10 52, 12 58, 20 54 C 25 51, 22 46, 17 48 Z"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M 47 16 C 54 12, 52 6, 44 10 C 39 13, 42 18, 47 16 Z"
      fill="currentColor"
      fillOpacity="0.08"
    />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
  </svg>
);
