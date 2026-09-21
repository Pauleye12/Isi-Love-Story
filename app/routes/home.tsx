import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Isi & Victor — #TheIVLeague Wedding" },
    {
      name: "description",
      content:
        "Celebrate the wedding of Isi & Victor (#TheIVLeague). Slide up to unveil our story, promises, venue, and registry.",
    },
  ];
}

/* ─────────────────── WEDDING TARGET DATE ─────────────────── */
const WEDDING_TARGET_DATE = new Date("2026-11-28T16:30:00");

/* ─────────────────── COUNTDOWN HOOK ─────────────────── */
function useLiveCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, targetDate.getTime() - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / (1000 * 60)) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, mins, secs });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

/* ─────────────────── SCROLL REVEAL OBSERVER HOOK ─────────────────── */
function useIntersectionReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" },
    );

    const elements = root.querySelectorAll(
      ".reveal, .reveal-scale, .reveal-left, .reveal-right",
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

/* ─────────────────── SVG DECOR ICONS ─────────────────── */
function BotanicalBranchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`inline-block ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22C12 14 7 10 3 9" />
      <path d="M12 18C15 15 20 14 21 11" />
      <path d="M12 13C9 10 7 7 8 3" />
      <path d="M12 8C14 6 18 5 19 2" />
      <path d="M12 22V2" />
    </svg>
  );
}

function SectionFlourish() {
  return (
    <div className="flex items-center justify-center gap-3 my-3 mb-9 reveal reveal-delay-1">
      <span className="w-11 h-px bg-linear-to-r from-transparent to-wedding-gold" />
      <svg
        className="w-4.5 h-4.5 text-wedding-gold"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L14.4 8.6L21 9.4L16 14L17.5 20.6L12 17.2L6.5 20.6L8 14L3 9.4L9.6 8.6L12 2Z" />
      </svg>
      <span className="w-11 h-px bg-linear-to-l from-transparent to-wedding-gold" />
    </div>
  );
}

/* ─────────────────── ENVELOPE DECORATIVE WEDDING ICONS ─────────────────── */
function EnvelopeHeart({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={`text-rose-400/80 drop-shadow-[0_2px_6px_rgba(224,120,140,0.3)] ${className}`}
    >
      <path d="M16 28.5l-2.1-1.9C6.4 19.8 1.5 15.3 1.5 9.8 1.5 5.3 5 1.8 9.5 1.8c2.5 0 5 1.2 6.5 3.1 1.5-1.9 4-3.1 6.5-3.1 4.5 0 8 3.5 8 8 0 5.5-4.9 10-12.4 16.8L16 28.5z" />
    </svg>
  );
}

function EnvelopeRings({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      className={`text-amber-500/85 drop-shadow-[0_2px_6px_rgba(212,160,23,0.3)] ${className}`}
    >
      <circle cx="18" cy="26" r="13" strokeWidth="2.8" />
      <circle
        cx="18"
        cy="26"
        r="10.5"
        strokeWidth="1"
        strokeDasharray="1.5 3"
        opacity="0.65"
      />
      <circle cx="30" cy="22" r="13" strokeWidth="2.8" />
      <circle
        cx="30"
        cy="22"
        r="10.5"
        strokeWidth="1"
        strokeDasharray="1.5 3"
        opacity="0.65"
      />
      {/* Diamond Gem on Ring */}
      <path
        d="M30 6 L33.5 9.5 L30 13 L26.5 9.5 Z"
        fill="#FEF3C7"
        stroke="#D97706"
        strokeWidth="1.6"
      />
      <line
        x1="30"
        y1="3"
        x2="30"
        y2="5"
        stroke="#FBBF24"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="9.5"
        x2="26"
        y2="9.5"
        stroke="#FBBF24"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="34"
        y1="9.5"
        x2="36"
        y2="9.5"
        stroke="#FBBF24"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EnvelopeFlower({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="currentColor"
      className={`text-rose-300/85 drop-shadow-[0_2px_6px_rgba(230,140,160,0.25)] ${className}`}
    >
      {/* Delicate outer petals */}
      <ellipse cx="24" cy="13" rx="8.5" ry="10.5" opacity="0.85" />
      <ellipse
        cx="35"
        cy="21"
        rx="10.5"
        ry="8.5"
        opacity="0.8"
        transform="rotate(25 35 21)"
      />
      <ellipse
        cx="31"
        cy="34"
        rx="8.5"
        ry="10.5"
        opacity="0.85"
        transform="rotate(72 31 34)"
      />
      <ellipse
        cx="17"
        cy="34"
        rx="8.5"
        ry="10.5"
        opacity="0.85"
        transform="rotate(-72 17 34)"
      />
      <ellipse
        cx="13"
        cy="21"
        rx="10.5"
        ry="8.5"
        opacity="0.8"
        transform="rotate(-25 13 21)"
      />
      {/* Inner petal layer */}
      <ellipse cx="24" cy="16" rx="5.5" ry="6.5" fill="#FECDD3" opacity="0.9" />
      <ellipse
        cx="30"
        cy="22"
        rx="6.5"
        ry="5.5"
        fill="#FECDD3"
        opacity="0.85"
        transform="rotate(25 30 22)"
      />
      <ellipse
        cx="28"
        cy="30"
        rx="5.5"
        ry="6.5"
        fill="#FECDD3"
        opacity="0.9"
        transform="rotate(72 28 30)"
      />
      <ellipse
        cx="20"
        cy="30"
        rx="5.5"
        ry="6.5"
        fill="#FECDD3"
        opacity="0.9"
        transform="rotate(-72 20 30)"
      />
      <ellipse
        cx="18"
        cy="22"
        rx="6.5"
        ry="5.5"
        fill="#FECDD3"
        opacity="0.85"
        transform="rotate(-25 18 22)"
      />
      {/* Golden pistil & stamen core */}
      <circle cx="24" cy="24" r="4.5" fill="#F59E0B" />
      <circle cx="24" cy="24" r="2.5" fill="#FEF08A" />
    </svg>
  );
}

function EnvelopeRose({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      className={`text-rose-500/80 drop-shadow-[0_2px_6px_rgba(220,50,80,0.3)] ${className}`}
    >
      {/* Botanical leaves */}
      <path
        d="M13 36 C8 32, 7 25, 14 23 C18 27, 18 33, 13 36 Z"
        fill="#8B9D83"
        opacity="0.85"
      />
      <path
        d="M39 36 C44 32, 45 25, 38 23 C34 27, 34 33, 39 36 Z"
        fill="#8B9D83"
        opacity="0.85"
      />
      {/* Rose outer petals */}
      <path
        d="M26 6 C37 6, 45 14, 45 25 C45 35, 37 43, 26 43 C15 43, 7 35, 7 25 C7 14, 15 6, 26 6 Z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d="M26 10 C34 10, 41 16, 41 25 C41 33, 34 40, 26 40 C18 40, 11 33, 11 25 C11 16, 18 10, 26 10 Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Spiral swirl petals */}
      <path
        d="M26 13 C32 13, 37 18, 37 24 C37 29, 33 33, 27 34 C21 35, 16 30, 16 25 C16 20, 20 16, 25 16 C29 16, 32 19, 32 23 C32 26, 30 28, 27 28 C24 28, 22 26, 22 24 C22 22, 23.5 21, 25 21 C26.5 21, 27 22, 27 23"
        stroke="#FFE4E6"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="26" cy="24" r="3.2" fill="#FDA4AF" />
    </svg>
  );
}

function EnvelopeTree({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={`drop-shadow-[0_4px_12px_rgba(93,110,102,0.22)] ${className}`}
    >
      {/* Ground Mound / Roots */}
      <ellipse cx="40" cy="74" rx="24" ry="4.5" fill="#5D7263" opacity="0.22" />
      <path
        d="M36 73 C33 73, 29 75, 25 75 M44 73 C47 73, 51 75, 55 75"
        stroke="#5D7263"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Graceful Tree Trunk & Branches */}
      <path
        d="M40 73 C39 59, 36 49, 34 41 C32 34, 26 27, 19 24 M36 43 C41 36, 49 31, 60 27 M38 51 C43 45, 47 43, 53 41 M35 37 C35 31, 38 26, 40 19"
        stroke="#655543"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Canopy Clusters (Lush Olive/Sage Foliage) */}
      <circle cx="22" cy="21" r="14" fill="#8B9D83" opacity="0.55" />
      <circle cx="34" cy="16" r="15" fill="#5D7263" opacity="0.6" />
      <circle cx="48" cy="17" r="15" fill="#8B9D83" opacity="0.55" />
      <circle cx="59" cy="25" r="13" fill="#5D7263" opacity="0.6" />
      <circle cx="39" cy="27" r="13" fill="#7A8D74" opacity="0.5" />
      <circle cx="28" cy="29" r="11" fill="#8B9D83" opacity="0.5" />
      <circle cx="49" cy="32" r="11" fill="#5D7263" opacity="0.45" />

      {/* Tiny Blossoms & Hearts on the Tree */}
      <circle cx="20" cy="15" r="2.5" fill="#FDA4AF" />
      <circle cx="32" cy="11" r="2" fill="#FECDD3" />
      <circle cx="42" cy="11" r="2.5" fill="#F43F5E" opacity="0.85" />
      <circle cx="55" cy="19" r="2.2" fill="#FDA4AF" />
      <circle cx="36" cy="23" r="2.5" fill="#FBCFE8" />
      <circle cx="49" cy="25" r="2.2" fill="#F43F5E" opacity="0.85" />
      <circle cx="26" cy="25" r="2" fill="#FDA4AF" />
      {/* Little Heart Fruit on the Tree */}
      <path
        d="M40 16 C40 14, 42 13, 43 14 C44 13, 46 14, 46 16 C46 18, 43 20, 43 20 C43 20, 40 18, 40 16 Z"
        fill="#F43F5E"
        opacity="0.9"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENVELOPE OPENER WITH MELTED RED WAX SEAL
   ═══════════════════════════════════════════════════════════ */
interface EnvelopeIntroProps {
  isOpen: boolean;
  onOpen: () => void;
}

function EnvelopeIntro({ isOpen, onOpen }: EnvelopeIntroProps) {
  const [openingPhase, setOpeningPhase] = useState<
    "idle" | "opening" | "opened"
  >("idle");
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const SLIDE_THRESHOLD = 55;

  const triggerOpen = useCallback(() => {
    if (openingPhase !== "idle") return;
    setOpeningPhase("opening");

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([40, 60, 80]);
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      setOpeningPhase("opened");
      onOpen();
    }, 900);
  }, [openingPhase, onOpen]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !isDragging.current ||
      startY.current === null ||
      openingPhase !== "idle"
    )
      return;
    const deltaY = startY.current - e.touches[0].clientY;
    if (deltaY > 0) {
      setDragOffset(Math.min(deltaY, 110));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startY.current = null;

    if (dragOffset >= SLIDE_THRESHOLD) {
      triggerOpen();
    } else {
      setDragOffset(0);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    startY.current = e.clientY;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (
      !isDragging.current ||
      startY.current === null ||
      openingPhase !== "idle"
    )
      return;
    const deltaY = startY.current - e.clientY;
    if (deltaY > 0) {
      setDragOffset(Math.min(deltaY, 110));
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startY.current = null;

    if (dragOffset >= SLIDE_THRESHOLD) {
      triggerOpen();
    } else {
      setDragOffset(0);
    }
  };

  if (isOpen && openingPhase === "opened") {
    return null;
  }

  const sealTransformStyle = {
    transform: `translate(-50%, -50%) translateY(-${dragOffset}px) scale(${dragOffset > 0 ? 1.05 : 1})`,
    transition: isDragging.current
      ? "none"
      : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  return (
    <aside
      aria-label="Wedding Invitation Envelope"
      className={`fixed inset-0 w-screen h-screen z-9999 bg-[#FCFBFA] overflow-hidden flex flex-col justify-between select-none transition-all duration-950ms ease-[cubic-bezier(0.7,0,0.2,1)] ${
        openingPhase === "opened"
          ? "-translate-y-full opacity-0 pointer-events-none"
          : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background Decorative Elements AROUND the Envelope (Trees, Rings, Roses, Hearts, Flowers) ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-[1]"
        aria-hidden="true"
      >
        {/* Bottom-Left Wedding Tree with Rose & Heart */}
        <div className="absolute -bottom-3 -left-5 sm:bottom-1 sm:left-4 flex items-end opacity-85 sm:opacity-95">
          <EnvelopeTree className="w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 animate-[envelopeSway_8s_ease-in-out_infinite]" />
          <div className="flex flex-col gap-1.5 -ml-5 sm:-ml-7 mb-2">
            <EnvelopeRose className="w-9 h-9 sm:w-12 sm:h-12 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
            <EnvelopeHeart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-400/80 animate-[envelopeFloatRev_5s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Bottom-Right Wedding Tree with Rings & Flower */}
        <div className="absolute -bottom-3 -right-5 sm:bottom-1 sm:right-4 flex items-end flex-row-reverse opacity-85 sm:opacity-95">
          <EnvelopeTree className="w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 scale-x-[-1] animate-[envelopeSway_9s_ease-in-out_infinite]" />
          <div className="flex flex-col gap-1.5 -mr-5 sm:-mr-7 mb-2">
            <EnvelopeRings className="w-10 h-10 sm:w-13 sm:h-13 animate-[envelopeFloatSlow_7s_ease-in-out_infinite]" />
            <EnvelopeFlower className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300/80 animate-[envelopeFloatRev_6s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      {/* ── Fullscreen Envelope Top Triangular Flap with Couple Names Written on It ── */}
      <div
        className={`absolute top-0 inset-x-0 h-[58%] bg-linear-to-b from-white via-[#FBF9F6] to-[#F4EDE4] [clip-path:polygon(0_0,100%_0,100%_64%,50%_100%,0_64%)] drop-shadow-[0_10px_24px_rgba(45,35,25,0.08)] flex flex-col items-center justify-start pt-32 sm:pt-16 z-10 origin-top transition-transform duration-850 ease-in-out ${
          openingPhase === "opening" ? "transform-[rotateX(180deg)]" : ""
        }`}
      >
        {/* Flap Top Accent: Flower & Heart Flourish */}
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
          <EnvelopeFlower className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300/75" />
          <EnvelopeHeart className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400/85 animate-[envelopeFloatSlow_5s_ease-in-out_infinite]" />
          <EnvelopeFlower className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300/75" />
        </div>

        <p className="font-editorial italic text-3xl sm:text-5xl mb-3 sm:mb-4 text-[#5D6E66] tracking-wide">
          #TheIVLeague
        </p>

        {/* Couple Names Flanked by Roses, Rings, Flowers & Hearts */}
        <div className="relative flex items-center justify-center mt-3 sm:mt-5 px-3">
          {/* Left Decorative Wing: Rose + Flower */}
          <div className="flex flex-col items-center mr-14 sm:mr-6 pointer-events-none">
            <EnvelopeRose className="w-9 h-9 sm:w-13 sm:h-13 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
            <EnvelopeFlower className="w-7 h-7 sm:w-9 sm:h-9 text-rose-300/80 -mt-1" />
          </div>

          <div className="flex flex-col items-center text-center text-[#5D6E66]">
            <span className="font-script italic text-5xl sm:text-7xl font-normal leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
              Isy
            </span>
            <span className="font-editorial italic text-2xl sm:text-3xl text-[#85988F] my-0.5 leading-none">
              &
            </span>
            <span className="font-script italic text-5xl sm:text-7xl font-normal leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
              Victor
            </span>
          </div>

          {/* Right Decorative Wing: Rings + Heart */}
          <div className="flex flex-col items-center ml-14 sm:ml-6 pointer-events-none">
            <EnvelopeRings className="w-9 h-9 sm:w-13 sm:h-13 animate-[envelopeFloatRev_6s_ease-in-out_infinite]" />
            <EnvelopeHeart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-400/80 -mt-1" />
          </div>
        </div>

        {/* Flap Tip Embellishment (just above the seal point) */}
        <div className="mt-3 sm:mt-5 flex items-center gap-2 pointer-events-none">
          <EnvelopeRose className="w-7 h-7 sm:w-9 sm:h-9 text-rose-400/75" />
          <EnvelopeHeart className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400/85" />
          <EnvelopeFlower className="w-7 h-7 sm:w-9 sm:h-9 text-rose-300/75" />
        </div>
      </div>

      {/* Crease fold lines matching the physical envelope structure */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Top flap edges */}
          <line
            x1="0"
            y1="37"
            x2="50"
            y2="58"
            stroke="#E6E0D5"
            strokeWidth="0.5"
          />
          <line
            x1="100"
            y1="37"
            x2="50"
            y2="58"
            stroke="#E6E0D5"
            strokeWidth="0.5"
          />
          {/* Bottom diagonal creases */}
          <line
            x1="0"
            y1="78"
            x2="50"
            y2="58"
            stroke="#ECE7DC"
            strokeWidth="0.5"
          />
          <line
            x1="100"
            y1="78"
            x2="50"
            y2="58"
            stroke="#ECE7DC"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* ── Melted Red Wax Seal with Drips & Monogram at (50%, 58%) ── */}
      <div
        className="absolute top-[62%] left-[60%] -translate-x-1/2 -translate-y-1/2 z-25 cursor-grab active:cursor-grabbing touch-none select-none flex flex-col items-center"
        style={sealTransformStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={triggerOpen}
        role="button"
        tabIndex={0}
        aria-label="Slide up on the red wax seal to open wedding invitation"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") triggerOpen();
        }}
      >
        {/* Melted Wax Puddle & Droplets */}
        <div className="absolute w-26 h-26 rounded-[54%_46%_51%_49%/48%_53%_47%_52%] bg-[radial-gradient(circle_at_40%_40%,#A51429_0%,#720917_70%,#4E040E_100%)] shadow-[0_8px_28px_rgba(68,6,16,0.45),0_2px_6px_rgba(0,0,0,0.25)] pointer-events-none animate-[waxWobble_6s_ease-in-out_infinite_alternate]" />
        <div className="absolute w-3.5 h-6 -bottom-4 left-7 rounded-[40%_40%_60%_60%/30%_30%_70%_70%] bg-[radial-gradient(circle_at_45%_35%,#9E1327_0%,#680715_80%)] shadow-[0_4px_10px_rgba(78,4,14,0.4)] pointer-events-none" />
        <div className="absolute w-5 h-8.5 -bottom-6 left-12 rounded-[35%_35%_65%_65%/30%_30%_70%_70%] bg-[radial-gradient(circle_at_45%_35%,#9E1327_0%,#680715_80%)] shadow-[0_4px_10px_rgba(78,4,14,0.4)] pointer-events-none" />
        <div className="absolute w-3 h-5 -bottom-3.5 right-6 rounded-[45%_45%_55%_55%/35%_35%_65%_65%] bg-[radial-gradient(circle_at_45%_35%,#9E1327_0%,#680715_80%)] shadow-[0_4px_10px_rgba(78,4,14,0.4)] pointer-events-none" />
        <div className="absolute w-2 h-2.5 -bottom-8 left-13.5 rounded-full bg-[#840C1D] shadow-[0_2px_4px_rgba(78,4,14,0.5)] animate-[dripDrop_3s_ease-in-out_infinite] pointer-events-none" />

        {/* Glowing pulse ring */}
        <div className="absolute -inset-3.5 rounded-full bg-[radial-gradient(circle,rgba(230,57,86,0.35)_0%,transparent_70%)] animate-[sealPulse_2s_ease-in-out_infinite] pointer-events-none" />

        {/* Convex Wax Seal Disc */}
        <div className="relative w-21.5 h-21.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#D62842_0%,#B3182F_30%,#880F21_70%,#5E0715_100%)] shadow-[inset_0_3px_6px_rgba(255,140,160,0.4),inset_0_-4px_8px_rgba(35,2,7,0.6),0_4px_15px_rgba(0,0,0,0.3)] flex items-center justify-center z-[2]">
          <div className="w-16 h-16 rounded-full border-[1.5px] border-dashed border-[#F5BE78]/50 shadow-[inset_0_2px_4px_rgba(40,2,8,0.8),0_1px_2px_rgba(255,180,190,0.25)] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_45%_45%,#7C0D1E_0%,#540612_100%)]">
            <span className="font-display text-lg font-bold tracking-wider text-[#F8D595] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-none">
              IV
            </span>
            <BotanicalBranchIcon className="w-5.5 h-5.5 text-[#ECC77A] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mt-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom CTA Text: "We have some news..." & "TAP HERE & SLIDE ›" */}
      <div className="absolute bottom-20 sm:bottom-14 inset-x-0 text-center z-15 flex flex-col items-center gap-2 pointer-events-none">
        <div className="flex items-center justify-center gap-3">
          <EnvelopeHeart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300/70 animate-[envelopeFloatSlow_5s_ease-in-out_infinite]" />
          <p className="font-editorial italic text-lg sm:text-xl text-[#727A75] m-0">
            We have some news...
          </p>
          <EnvelopeFlower className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300/70 animate-[envelopeFloatRev_5s_ease-in-out_infinite]" />
        </div>
        <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-[#88928D] m-0 flex items-center gap-1.5 animate-[slideHintPulse_2s_ease-in-out_infinite]">
          <span>TAP HERE & SLIDE</span>
          <span>›</span>
        </p>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING PETALS & STARDUST BACKGROUND DECOR
   ═══════════════════════════════════════════════════════════ */
function FloatingPetalsDecor() {
  const petals = [
    { id: 1, left: "10%", size: 14, duration: 11, delay: 0 },
    { id: 2, left: "25%", size: 18, duration: 14, delay: 2 },
    { id: 3, left: "45%", size: 12, duration: 12, delay: 4 },
    { id: 4, left: "68%", size: 16, duration: 15, delay: 1 },
    { id: 5, left: "85%", size: 15, duration: 13, delay: 3 },
    { id: 6, left: "92%", size: 12, duration: 16, delay: 5 },
  ];

  const sparkles = [
    { id: 1, top: "20%", left: "18%", delay: 0 },
    { id: 2, top: "35%", left: "82%", delay: 1.2 },
    { id: 3, top: "60%", left: "12%", delay: 2.1 },
    { id: 4, top: "78%", left: "75%", delay: 0.8 },
    { id: 5, top: "90%", left: "30%", delay: 1.8 },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute -top-10 rounded-[60%_40%_70%_30%/50%_60%_40%_50%] bg-gradient-to-br from-wedding-blush/75 to-wedding-rose/45 drop-shadow-[0_2px_4px_rgba(217,160,152,0.2)] animate-[fallPetal_linear_infinite]"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 1.3}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute w-1 h-1 bg-wedding-gold-light rounded-full drop-shadow-[0_0_6px_rgba(224,200,126,0.8)] animate-[sparkleTwinkle_ease-in-out_infinite]"
          style={{
            top: s.top,
            left: s.left,
            animationDuration: "3s",
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP NAVIGATION BAR
   ═══════════════════════════════════════════════════════════ */
function TopBar({ onReplayIntro }: { onReplayIntro: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-wedding-cream/90 backdrop-blur-md border-b border-wedding-gold/20 flex items-center justify-between px-6 z-50 transition-all duration-300">
      <a
        href="#hero"
        className="font-display text-sm sm:text-base tracking-widest text-wedding-sage-deep font-semibold no-underline hover:text-wedding-sage transition-colors"
      >
        #TheIVLeague
      </a>
      <div className="flex items-center gap-4">
        <button
          className="w-9 h-9 rounded-full border border-wedding-gold/40 bg-white flex items-center justify-center cursor-pointer text-wedding-sage-deep hover:bg-wedding-blush hover:rotate-12 transition-all duration-300"
          onClick={toggleMusic}
          title={isPlaying ? "Mute ambient melody" : "Play ambient melody"}
          type="button"
          aria-label="Toggle ambient sound"
        >
          {isPlaying ? "🎵" : "✨"}
        </button>
        <a
          href="/rsvp"
          className="font-sans text-xs font-semibold tracking-wider uppercase bg-wedding-sage text-white px-4.5 py-1.5 rounded-full no-underline transition-all duration-300 shadow-[0_2px_8px_rgba(93,114,99,0.25)] hover:bg-wedding-sage-deep hover:-translate-y-0.5"
        >
          RSVP
        </a>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════ */
function HeroSection() {
  const scrollToExplore = () => {
    const el = document.getElementById("promises");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-12 overflow-hidden"
      id="hero"
    >
      <div className="relative w-[min(88vw,420px)] aspect-[1/1.18] flex flex-col items-center justify-center mx-auto reveal-scale">
        <div className="relative z-2 p-6 flex flex-col items-center">
          {/* <span className="font-sans text-xs font-medium tracking-[0.3em] uppercase text-wedding-sage mb-2">
            Together with their families
          </span> */}
          {/* Typographic Lockup: First name top-left, elevated ampersand, second name tucked below on the right in italic */}
          <div className="relative inline-flex flex-col items-start select-none my-3">
            {/* Line 1: First name + elevated & */}
            <div className="flex items-baseline leading-none">
              <h2 className="font-editorial text-7xl md:text-8xl font-bold tracking-tight leading-none text-wedding-sage-deep drop-shadow-sm">
                Isi
              </h2>
              <span className="font-editorial  italic text-3xl sm:text-4xl md:text-5xl font-light text-wedding-sage-deep/85 leading-none ml-2 sm:ml-3 self-center -translate-y-2 sm:-translate-y-3.5 select-none">
                &
              </span>
            </div>

            {/* Line 2: Second name staggered and indented right in italic serif */}
            <div className="flex justify-end w-full -mt-2 sm:-mt-4 pl-10 sm:pl-16 md:pl-20 leading-none">
              <h2 className="font-editorial italic text-7xl md:text-8xl font-bold tracking-tight leading-none text-wedding-sage-deep drop-shadow-sm">
                Victor
              </h2>
            </div>
          </div>
          <p className="font-semibold">November 28th, 2026</p>

          <button
            type="button"
            className="mt-7 inline-flex items-center gap-2 px-9 py-3 font-display text-xs font-semibold tracking-[0.25em] uppercase text-wedding-sage-deep bg-transparent border-1.5 border-wedding-sage-deep rounded cursor-pointer transition-all duration-300 hover:bg-wedding-sage-deep hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(56,72,59,0.25)]"
            onClick={scrollToExplore}
          >
            Explore
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   OUR PROMISES SECTION
   ═══════════════════════════════════════════════════════════ */
function OurPromises() {
  return (
    <section
      className="relative py-16 sm:py-20 px-6 max-w-162.5 mx-auto"
      id="promises"
    >
      {/* Decorative Floating Accents Around Section */}
      <div className="absolute top-8 -left-4 sm:-left-12 pointer-events-none opacity-45 sm:opacity-75">
        <EnvelopeRose className="w-10 h-10 sm:w-14 sm:h-14 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
        <EnvelopeHeart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-400/80 -mt-1 ml-4 animate-[envelopeFloatRev_5s_ease-in-out_infinite]" />
      </div>
      <div className="absolute top-10 -right-4 sm:-right-12 pointer-events-none opacity-45 sm:opacity-75">
        <EnvelopeRings className="w-10 h-10 sm:w-14 sm:h-14 animate-[envelopeFloatSlow_7s_ease-in-out_infinite]" />
        <EnvelopeFlower className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300/80 -mt-1 mr-3 animate-[envelopeFloatRev_6s_ease-in-out_infinite]" />
      </div>

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-wedding-charcoal tracking-tight reveal">
          Our Promises
        </h2>
        <SectionFlourish />
      </div>

      {/* Bride Vow Card */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-8 mb-6 border border-wedding-gold/25 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-linear-to-b before:from-wedding-gold before:to-wedding-rose reveal reveal-left">
        {/* Floating Rose & Heart inside card */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none flex items-center gap-1.5 opacity-60 sm:opacity-85">
          <EnvelopeRose className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400/70" />
          <EnvelopeHeart className="w-6 h-6 sm:w-7 sm:h-7 text-rose-300/70" />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-13 h-13 rounded-full bg-linear-to-br from-wedding-blush to-[#F0D5CD] flex items-center justify-center font-script text-2xl text-wedding-sage-deep border-2 border-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
              I
            </div>
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-wedding-charcoal leading-tight">
              Isi
            </h3>
            <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-wedding-gold-dark">
              The Bride
            </span>
          </div>
        </div>
        <p className="font-editorial italic text-lg leading-relaxed text-wedding-text relative">
          <span className="font-serif text-4xl leading-none -align-[0.4rem] text-wedding-gold-light mr-1">
            “
          </span>
          I promise to cultivate a life filled with quiet mornings, slow
          laughter, and constant curiosity. Standing by you, I find my greatest
          peace and endless joy.
        </p>
      </div>

      {/* Groom Vow Card */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-8 mb-6 border border-wedding-gold/25 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-linear-to-b before:from-wedding-sage before:to-wedding-sage-deep reveal reveal-right">
        {/* Floating Rings & Flower inside card */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none flex items-center gap-1.5 opacity-60 sm:opacity-85">
          <EnvelopeRings className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500/75" />
          <EnvelopeFlower className="w-6 h-6 sm:w-7 sm:h-7 text-rose-300/70" />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-13 h-13 rounded-full bg-linear-to-br from-wedding-sage-light to-wedding-sage-deep flex items-center justify-center font-script text-2xl text-white border-2 border-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
              V
            </div>
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-wedding-charcoal leading-tight">
              Victor
            </h3>
            <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-wedding-gold-dark">
              The Groom
            </span>
          </div>
        </div>
        <p className="font-editorial italic text-lg leading-relaxed text-wedding-text relative">
          <span className="font-serif text-4xl leading-none -align-[0.4rem] text-wedding-gold-light mr-1">
            “
          </span>
          I promise to honor your dreams as if they were my own, to listen with
          devotion, and to love you more deeply through every unfolding season
          of our journey together.
        </p>
      </div>

      {/* Tree Anchor at Bottom Corner */}
      <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-14 pointer-events-none opacity-30 sm:opacity-50">
        <EnvelopeTree className="w-24 h-24 sm:w-36 sm:h-36 animate-[envelopeSway_8s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   GARDEN ROMANCE (THEME & ATTIRE GUIDE)
   ═══════════════════════════════════════════════════════════ */
const WEDDING_PALETTE = [
  { name: "Emerald Green", hex: "#50C878" },
  { name: "Olive Green", hex: "#808000" },
  { name: "Peach", hex: "#FFE5B4" },
];

function GardenRomance() {
  const [activeSwatch, setActiveSwatch] = useState<string | null>(null);

  return (
    <section
      className="relative py-16 sm:py-20 px-6 max-w-170 mx-auto"
      id="garden"
    >
      {/* Decorative Tree & Floral Accents */}
      <div className="absolute -top-4 -left-4 sm:-left-12 pointer-events-none opacity-40 sm:opacity-65">
        <EnvelopeTree className="w-24 h-24 sm:w-36 sm:h-36 animate-[envelopeSway_8s_ease-in-out_infinite]" />
      </div>
      <div className="absolute top-8 -right-4 sm:-right-10 pointer-events-none opacity-40 sm:opacity-75">
        <EnvelopeFlower className="w-9 h-9 sm:w-12 sm:h-12 text-rose-300/80 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
        <EnvelopeRose className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400/70 -mt-1 ml-2 animate-[envelopeFloatRev_5s_ease-in-out_infinite]" />
      </div>

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-wedding-charcoal tracking-tight reveal reveal-delay-1">
          Theme & Attire Guide
        </h2>
        <SectionFlourish />
      </div>

      <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-wedding-text max-w-130 mx-auto mb-9 reveal reveal-delay-2">
        We invite you to celebrate with us in elegant pastel tones, flowing
        materials, and midsummer romance. Our ceremony and celebration will take
        place outdoors amidst lush vineyard groves and sunset grassy slopes.
      </p>

      {/* Wedding Palette */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-wedding-gold/30 shadow-[0_4px_15px_rgba(0,0,0,0.03)] text-center reveal reveal-scale overflow-hidden">
        {/* Subtle corner decorations in palette card */}
        <div className="absolute top-3 left-3 pointer-events-none opacity-50">
          <EnvelopeFlower className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500/60" />
        </div>
        <div className="absolute top-3 right-3 pointer-events-none opacity-50">
          <EnvelopeHeart className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400/60" />
        </div>

        <div className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-wedding-text-muted mb-5">
          Our Wedding Palette
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {WEDDING_PALETTE.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-1.5 cursor-pointer"
              onClick={() => setActiveSwatch(item.name)}
            >
              <div
                className="w-9 h-9 rounded-full border-2 border-white shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-115"
                style={{
                  backgroundColor: item.hex,
                  transform:
                    activeSwatch === item.name ? "scale(1.25)" : undefined,
                }}
                title={`${item.name} (${item.hex})`}
              />
              <span className="font-sans text-xs text-wedding-text-muted font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   THE VENUE SECTION
   ═══════════════════════════════════════════════════════════ */
function TheVenue() {
  return (
    <section
      className="relative py-16 sm:py-20 px-6 bg-linear-to-b from-transparent to-wedding-cream-warm/60 overflow-hidden"
      id="venue"
    >
      {/* Decorative Side Accents */}
      <div className="absolute top-12 left-3 sm:left-10 pointer-events-none opacity-40 sm:opacity-75">
        <EnvelopeRings className="w-10 h-10 sm:w-14 sm:h-14 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
        <EnvelopeHeart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-400/80 -mt-1 ml-3" />
      </div>
      <div className="absolute top-12 right-3 sm:right-10 pointer-events-none opacity-40 sm:opacity-75">
        <EnvelopeRose className="w-10 h-10 sm:w-13 sm:h-13 animate-[envelopeFloatRev_7s_ease-in-out_infinite]" />
        <EnvelopeFlower className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300/80 -mt-1 mr-3" />
      </div>

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-wedding-charcoal tracking-tight reveal">
          The Venue
        </h2>
        <SectionFlourish />
      </div>

      <div className="relative max-w-162.5 mx-auto bg-white rounded-3xl overflow-hidden border border-wedding-gold/30 shadow-[0_8px_30px_rgba(0,0,0,0.05)] reveal reveal-scale">
        <div className="relative w-full h-60 overflow-hidden">
          <img
            src="/Bravo.jpeg"
            alt="Brava Event Center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60" />
          <h3 className="absolute bottom-4 left-6 text-white font-serif text-2xl drop-shadow-md">
            Brava Event Center
          </h3>
          {/* Subtle image overlay flower */}
          <div className="absolute top-4 right-4 pointer-events-none opacity-80">
            <EnvelopeFlower className="w-8 h-8 text-white/80 drop-shadow-md" />
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center gap-2 font-sans text-sm text-wedding-text mb-8">
            <span>📍 Industries Road, Plot 8, Guinness Road, Ogba, Lagos.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="relative bg-wedding-cream rounded-xl p-5 sm:p-6 border border-wedding-gold/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] reveal reveal-left overflow-hidden">
              <div className="absolute top-3 right-3 pointer-events-none opacity-50">
                <EnvelopeRings className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500/70" />
              </div>
              <div className="font-sans text-[11px] font-semibold tracking-wider uppercase text-wedding-gold-dark mb-1">
                Date
              </div>
              <div className="font-serif text-2xl font-semibold text-wedding-charcoal leading-tight mb-1">
                Saturday, November 28th, 2026
              </div>
            </div>

            <div className="relative bg-wedding-cream rounded-xl p-5 sm:p-6 border border-wedding-gold/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] reveal reveal-right overflow-hidden">
              <div className="absolute top-3 right-3 pointer-events-none opacity-50">
                <EnvelopeHeart className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400/70" />
              </div>
              <div className="font-sans text-[11px] font-semibold tracking-wider uppercase text-wedding-gold-dark mb-1">
                Time
              </div>
              <div className="font-serif text-2xl font-semibold text-wedding-charcoal leading-tight mb-1">
                2:30 PM
              </div>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/N3nCPA6bf52Wd87i9?g_st=ac"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 py-3 px-8 font-sans text-xs font-semibold tracking-[0.18em] uppercase text-white bg-wedding-sage-deep rounded-full no-underline transition-all duration-300 shadow-[0_4px_15px_rgba(56,72,59,0.25)] hover:bg-wedding-sage hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(56,72,59,0.35)]"
          >
            <span>➔</span>
            <span>Open in Maps</span>
          </a>
        </div>
      </div>

      {/* Tree Anchor at Bottom Corner */}
      <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:left-6 pointer-events-none opacity-30 sm:opacity-50">
        <EnvelopeTree className="w-28 h-28 sm:w-40 sm:h-40 animate-[envelopeSway_8s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGISTRY SECTION
   ═══════════════════════════════════════════════════════════ */
function Registry() {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText("1100597135");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <section
      className="relative py-16 sm:py-20 px-6 max-w-162.5 mx-auto"
      id="registry"
    >
      {/* Decorative Floating Accents */}
      <div className="absolute top-8 -left-4 sm:-left-12 pointer-events-none opacity-45 sm:opacity-75">
        <EnvelopeHeart className="w-9 h-9 sm:w-12 sm:h-12 text-rose-400/80 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
        <EnvelopeFlower className="w-7 h-7 sm:w-9 sm:h-9 text-rose-300/80 -mt-1 ml-3" />
      </div>
      <div className="absolute top-8 -right-4 sm:-right-12 pointer-events-none opacity-45 sm:opacity-75">
        <EnvelopeRose className="w-10 h-10 sm:w-13 sm:h-13 animate-[envelopeFloatRev_7s_ease-in-out_infinite]" />
        <EnvelopeRings className="w-8 h-8 sm:w-11 sm:h-11 -mt-1 mr-3" />
      </div>

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-wedding-charcoal tracking-tight reveal">
          Registry
        </h2>
        <SectionFlourish />
      </div>

      <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-wedding-text max-w-120 mx-auto mb-9 reveal reveal-delay-1">
        Your presence at our celebration is the greatest gift of all. If you
        would like to honor us with a gift, we have registered with the options
        below.
      </p>

      {/* Honeymoon Fund */}
      <div className="relative flex flex-col items-start justify-between bg-white rounded-2xl p-5 sm:p-6 mb-4 border border-wedding-gold/25 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 reveal reveal-left overflow-hidden">
        <div className="absolute top-4 right-4 pointer-events-none opacity-50 sm:opacity-75">
          <EnvelopeRings className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500/70" />
        </div>

        <div className="flex w-full items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-wedding-blush flex items-center justify-center text-xl text-wax-red-main  scale-70">
            ✈️
          </div>
          <span className="font-serif text-lg font-medium text-wedding-charcoal">
            Account Details
          </span>
        </div>
        <div className="flex flex-col gap-1 mt-3">
          <p className="font-serif text-wedding-charcoal">Kuda MFB</p>
          <div className="flex items-center gap-3">
            <p className="font-serif text-wedding-charcoal font-medium">
              1100597135
            </p>
            <button
              type="button"
              onClick={handleCopyAccount}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all duration-200 cursor-pointer ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
                  : "bg-wedding-cream text-wedding-sage-deep border border-wedding-gold/40 hover:bg-wedding-gold/15 hover:border-wedding-gold"
              }`}
              title="Copy account number"
              aria-label="Copy account number"
            >
              {copied ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium">Copied</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-wedding-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="font-serif text-wedding-charcoal">
            Adeleye Oreoluwa Paul
          </p>
        </div>
      </div>

      {/* Gift Registry */}
      <div className="relative flex items-center justify-between bg-white rounded-2xl p-5 sm:p-6 mb-4 border border-wedding-gold/25 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 reveal reveal-right overflow-hidden">
        <div className="absolute top-4 right-20 sm:right-28 pointer-events-none opacity-50 sm:opacity-75">
          <EnvelopeFlower className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300/70" />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-wedding-blush flex items-center justify-center text-xl text-wax-red-main">
            🎁
          </div>
          <span className="font-serif text-lg font-medium text-wedding-charcoal">
            Gift Registry
          </span>
        </div>
        <a
          href="/rsvp"
          className="font-sans text-xs font-semibold tracking-wider uppercase py-2.5 px-6 rounded-full no-underline transition-all duration-300 border-1.5 border-wedding-charcoal text-wedding-charcoal hover:bg-wedding-charcoal hover:text-white"
        >
          View
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN & FOOTER SECTION
   ═══════════════════════════════════════════════════════════ */
function CountdownFooter({ onReplayIntro }: { onReplayIntro: () => void }) {
  const { days, hours, mins, secs } = useLiveCountdown(WEDDING_TARGET_DATE);

  return (
    <footer
      className="relative bg-linear-to-b from-wedding-sage-deep to-[#243026] text-white py-20 px-6 text-center overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_20%,rgba(224,200,126,0.15)_0%,transparent_60%)] before:pointer-events-none"
      id="countdown"
    >
      {/* Decorative Wedding Trees in Footer Corners */}
      <div className="absolute -bottom-4 -left-6 sm:bottom-0 sm:left-4 pointer-events-none opacity-25 sm:opacity-40">
        <EnvelopeTree className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 animate-[envelopeSway_8s_ease-in-out_infinite]" />
      </div>
      <div className="absolute -bottom-4 -right-6 sm:bottom-0 sm:right-4 pointer-events-none opacity-25 sm:opacity-40">
        <EnvelopeTree className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 scale-x-[-1] animate-[envelopeSway_9s_ease-in-out_infinite]" />
      </div>

      {/* Top Floating Rings, Hearts, Roses & Flowers */}
      <div className="absolute top-8 left-6 sm:top-12 sm:left-16 pointer-events-none opacity-45 sm:opacity-70">
        <EnvelopeRings className="w-9 h-9 sm:w-12 sm:h-12 text-amber-300/80 animate-[envelopeFloatSlow_6s_ease-in-out_infinite]" />
        <EnvelopeHeart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-300/70 -mt-1 ml-2" />
      </div>
      <div className="absolute top-8 right-6 sm:top-12 sm:right-16 pointer-events-none opacity-45 sm:opacity-70">
        <EnvelopeRose className="w-9 h-9 sm:w-12 sm:h-12 text-rose-300/80 animate-[envelopeFloatRev_7s_ease-in-out_infinite]" />
        <EnvelopeFlower className="w-7 h-7 sm:w-9 sm:h-9 text-rose-200/70 -mt-1 mr-2" />
      </div>

      <div className="reveal">
        <div className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-wedding-gold-light mb-8 flex items-center justify-center gap-3">
          <EnvelopeHeart className="w-4 h-4 text-rose-300/70" />
          <span>Counting Down To Forever</span>
          <EnvelopeHeart className="w-4 h-4 text-rose-300/70" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-white mb-10">
          November 28th, 2026
        </h1>

        {/* 4 Dials */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[1.5px] border-wedding-gold/45 bg-white/6 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-105 hover:border-wedding-gold-light transition-all duration-300 mb-2">
              <span className="font-serif text-xl sm:text-3xl font-semibold text-white">
                {days}
              </span>
            </div>
            <span className="font-sans text-[10px] sm:text-xs tracking-wider uppercase text-white/65">
              Days
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[1.5px] border-wedding-gold/45 bg-white/6 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-105 hover:border-wedding-gold-light transition-all duration-300 mb-2">
              <span className="font-serif text-xl sm:text-3xl font-semibold text-white">
                {hours}
              </span>
            </div>
            <span className="font-sans text-[10px] sm:text-xs tracking-wider uppercase text-white/65">
              Hours
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[1.5px] border-wedding-gold/45 bg-white/6 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-105 hover:border-wedding-gold-light transition-all duration-300 mb-2">
              <span className="font-serif text-xl sm:text-3xl font-semibold text-white">
                {mins}
              </span>
            </div>
            <span className="font-sans text-[10px] sm:text-xs tracking-wider uppercase text-white/65">
              Mins
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[1.5px] border-wedding-gold/45 bg-white/6 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-105 hover:border-wedding-gold-light transition-all duration-300 mb-2">
              <span className="font-serif text-xl sm:text-3xl font-semibold text-white">
                {secs}
              </span>
            </div>
            <span className="font-sans text-[10px] sm:text-xs tracking-wider uppercase text-white/65">
              Secs
            </span>
          </div>
        </div>
      </div>

      <div className="reveal reveal-delay-1">
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
          <EnvelopeRose className="w-7 h-7 sm:w-10 sm:h-10 text-rose-300/80" />
          <h3 className="font-serif text-3xl sm:text-5xl font-normal text-white">
            Isi & Victor
          </h3>
          <EnvelopeRings className="w-7 h-7 sm:w-10 sm:h-10 text-amber-300/80" />
        </div>
        <p className="font-editorial italic text-lg sm:text-xl leading-relaxed text-white/85 max-w-110 mx-auto mb-9">
          Thank you for being part of our story. We cannot wait to share this
          magical day with our favorite people.
        </p>
      </div>

      {/* <div className="reveal reveal-delay-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 font-sans text-xs font-medium tracking-wider uppercase text-wedding-gold-light bg-white/8 border border-wedding-gold/35 py-2 px-5 rounded-full cursor-pointer transition-all duration-300 hover:bg-wedding-gold/20 hover:-translate-y-0.5 mb-8"
          onClick={onReplayIntro}
        >
          <span>✉️</span>
          <span>Replay Invitation Opener</span>
        </button>
      </div> */}

      <div className="flex items-center justify-center gap-4 mb-8 reveal reveal-delay-3">
        <a
          href="#"
          className="w-9.5 h-9.5 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white hover:border-wedding-gold-light hover:scale-110 transition-all duration-300 no-underline"
          aria-label="Instagram"
        >
          📷
        </a>
        <a
          href="#"
          className="w-9.5 h-9.5 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white hover:border-wedding-gold-light hover:scale-110 transition-all duration-300 no-underline"
          aria-label="Wedding Photos"
        >
          💍
        </a>
        <a
          href="#"
          className="w-9.5 h-9.5 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white hover:border-wedding-gold-light hover:scale-110 transition-all duration-300 no-underline"
          aria-label="Share"
        >
          💌
        </a>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN WEDDING HOME COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const contentRef = useIntersectionReveal();

  const handleOpenEnvelope = useCallback(() => {
    setEnvelopeOpened(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  const handleReplayIntro = useCallback(() => {
    setEnvelopeOpened(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-wedding-cream text-wedding-charcoal font-editorial overflow-x-hidden antialiased">
      {/* Floating Blossom Petals and Stardust in Background */}
      <FloatingPetalsDecor />

      {/* Envelope Opener with Melted Red Wax Seal */}
      <EnvelopeIntro isOpen={envelopeOpened} onOpen={handleOpenEnvelope} />

      {/* Top Floating App Bar */}
      {envelopeOpened && <TopBar onReplayIntro={handleReplayIntro} />}

      {/* Main Wedding Story & Event Details */}
      <div
        ref={contentRef}
        className={`pt-16 transition-all duration-1000 ase-in-out delay-200 ${
          envelopeOpened
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <HeroSection />
        <OurPromises />
        <GardenRomance />
        <TheVenue />
        <Registry />
        <CountdownFooter onReplayIntro={handleReplayIntro} />
      </div>
    </main>
  );
}
