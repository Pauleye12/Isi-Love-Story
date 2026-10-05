import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import { data } from "react-router";
import { createClient } from "~/utils/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Isi & Victor — #TheIVLeague Wedding" },
    {
      name: "description",
      content:
        "Celebrate the wedding of Isioma & Victor (#TheIVLeague). Slide up to unveil our story, promises, venue, and registry.",
    },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", href: "/couple1.jpg" },
  { rel: "preload", as: "image", href: "/watercolor-bg.jpg" },
];

/* ─────────────────── LOADER ─────────────────── */
export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createClient(request);

  const { data: displayTexts } = await supabase
    .from("DisplayTexts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data({ displayTexts: displayTexts ?? null }, { headers });
}

/* ─────────────────── WEDDING TARGET DATE ─────────────────── */
const WEDDING_TARGET_DATE = new Date("2026-11-28T16:30:00");

/* ─────────────────── IV CARD COLOR PALETTE ─────────────────── */
// Deep emerald for headings: #1B5E3B
// Gold/olive for accents: #8B7D3C / #9E8C45
// Peach rose text: #D4956A
// Card background wash: soft sage watercolor

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

/* ─────────────────── FLORAL CORNER DECORATOR ─────────────────── */
function FloralCorner({
  position,
  className = "",
}: {
  position: "top-right" | "bottom-left" | "top-left" | "bottom-right";
  className?: string;
}) {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "top-left": "top-0 left-0 scale-x-[-1]",
    "bottom-right": "bottom-0 right-0 scale-x-[-1]",
  };

  const imgSrc =
    position === "top-right" || position === "top-left"
      ? "/floral-corner-bg.png"
      : "/floral-corner-bl-bg.png";

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-[2] ${className}`}
      aria-hidden="true"
    >
      <img
        src={imgSrc}
        alt=""
        className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain opacity-85"
      />
    </div>
  );
}

/* ─────────────────── SECTION FLOURISH DIVIDER ─────────────────── */
function SectionFlourish() {
  return (
    <div className="flex items-center justify-center gap-3 my-3 mb-9 reveal reveal-delay-1">
      <span className="w-14 h-px bg-linear-to-r from-transparent to-[#9E8C45]" />
      <svg
        className="w-4 h-4 text-[#9E8C45]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L14.4 8.6L21 9.4L16 14L17.5 20.6L12 17.2L6.5 20.6L8 14L3 9.4L9.6 8.6L12 2Z" />
      </svg>
      <span className="w-14 h-px bg-linear-to-l from-transparent to-[#9E8C45]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENVELOPE OPENER — Watercolor green with IV monogram
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
      className={`fixed inset-0 w-screen h-screen z-9999 overflow-hidden flex flex-col justify-between select-none transition-all duration-950ms ease-[cubic-bezier(0.7,0,0.2,1)] ${
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
      {/* Watercolor green background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/watercolor-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floral corner accents matching IV card */}
      {/* <FloralCorner position="top-left" className="z-[3]" />
      <FloralCorner position="bottom-right" className="z-[3]" /> */}

      {/* ── Envelope Top Flap ── */}
      <div
        className={`absolute top-0 inset-x-0 h-[58%] [clip-path:polygon(0_0,100%_0,100%_64%,50%_100%,0_64%)] flex flex-col items-center justify-start pt-28 sm:pt-16 z-10 origin-top transition-transform duration-850 ease-in-out ${
          openingPhase === "opening" ? "transform-[rotateX(180deg)]" : ""
        }`}
      >
        {/* Watercolor texture on flap */}
        <div className="absolute inset-0 z-0">
          <img
            src="/watercolor-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent" />
        </div>

        {/* Floral corner on flap top-right */}
        {/* <FloralCorner position="top-right" className="z-[3]" /> */}

        <div className="relative z-10 flex flex-col items-center">
          {/* <p className="font-sans text-xs font-bold tracking-[0.4em] uppercase text-[#1B5E3B] mb-4">
            Access Card
          </p> */}

          {/* IV Monogram — matching the card's large decorative monogram */}
          {/* <div className="relative my-2">
            <img
              src="logo.png"
              alt="IV Monogram"
              className="w-24 h-24 sm:w-32 sm:h-32"
            />
          </div> */}

          <p className="font-display tracking-[0.2em] text-sm sm:text-base text-[#1B5E3B] uppercase mt-2">
            We have some news for you
          </p>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9E8C45] mt-1">
            #TheIVLeague
          </p>
        </div>
      </div>

      {/* Crease fold lines */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="37"
            x2="50"
            y2="58"
            stroke="#8B9D83"
            strokeWidth="0.3"
            opacity="0.4"
          />
          <line
            x1="100"
            y1="37"
            x2="50"
            y2="58"
            stroke="#8B9D83"
            strokeWidth="0.3"
            opacity="0.4"
          />
          <line
            x1="0"
            y1="78"
            x2="50"
            y2="58"
            stroke="#8B9D83"
            strokeWidth="0.3"
            opacity="0.4"
          />
          <line
            x1="100"
            y1="78"
            x2="50"
            y2="58"
            stroke="#8B9D83"
            strokeWidth="0.3"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* ── Wax Seal at (50%, 58%) ── */}
      <div
        className="absolute top-[60%] left-[60%] -translate-x-1/2 -translate-y-1/2 z-25 cursor-grab active:cursor-grabbing touch-none select-none flex flex-col items-center"
        style={sealTransformStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="button"
        tabIndex={0}
        aria-label="Slide up on the wax seal to open wedding invitation"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") triggerOpen();
        }}
      >
        {/* Wax Puddle */}
        <div className="absolute w-26 h-26 rounded-[54%_46%_51%_49%/48%_53%_47%_52%] bg-[radial-gradient(circle_at_40%_40%,#1B5E3B_0%,#14482D_70%,#0D3320_100%)] shadow-[0_8px_28px_rgba(13,51,32,0.45),0_2px_6px_rgba(0,0,0,0.25)] pointer-events-none animate-[waxWobble_6s_ease-in-out_infinite_alternate]" />
        <div className="absolute w-3.5 h-6 -bottom-4 left-7 rounded-[40%_40%_60%_60%/30%_30%_70%_70%] bg-[radial-gradient(circle_at_45%_35%,#1B5E3B_0%,#0D3320_80%)] shadow-[0_4px_10px_rgba(13,51,32,0.4)] pointer-events-none" />
        <div className="absolute w-5 h-8.5 -bottom-6 left-12 rounded-[35%_35%_65%_65%/30%_30%_70%_70%] bg-[radial-gradient(circle_at_45%_35%,#1B5E3B_0%,#0D3320_80%)] shadow-[0_4px_10px_rgba(13,51,32,0.4)] pointer-events-none" />
        <div className="absolute w-3 h-5 -bottom-3.5 right-6 rounded-[45%_45%_55%_55%/35%_35%_65%_65%] bg-[radial-gradient(circle_at_45%_35%,#1B5E3B_0%,#0D3320_80%)] shadow-[0_4px_10px_rgba(13,51,32,0.4)] pointer-events-none" />
        <div className="absolute w-2 h-2.5 -bottom-8 left-13.5 rounded-full bg-[#0D3320] shadow-[0_2px_4px_rgba(13,51,32,0.5)] animate-[dripDrop_3s_ease-in-out_infinite] pointer-events-none" />

        {/* Glow pulse */}
        <div className="absolute -inset-3.5 rounded-full bg-[radial-gradient(circle,rgba(80,200,120,0.3)_0%,transparent_70%)] animate-[sealPulse_2s_ease-in-out_infinite] pointer-events-none" />

        {/* Seal Disc */}
        <div
          className={`relative w-21.5 h-21.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#2D7A4F_0%,#1B5E3B_30%,#14482D_70%,#0D3320_100%)] shadow-[inset_0_3px_6px_rgba(80,200,120,0.3),inset_0_-4px_8px_rgba(0,20,10,0.6),0_4px_15px_rgba(0,0,0,0.3)] flex items-center justify-center z-[2] ${openingPhase === "idle" && dragOffset === 0 ? "" : ""}`}
        >
          <div className="w-16 h-16 rounded-full border-[1.5px] border-dashed border-[#9E8C45]/50 shadow-[inset_0_2px_4px_rgba(0,20,10,0.8),0_1px_2px_rgba(80,200,120,0.25)] flex flex-col items-center justify-center bg-white">
            <img src="logo.png" alt="IV" className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute w-full bottom-75 sm:bottom-14 inset-x-0 text-center z-15 flex flex-col items-center gap-2 pointer-events-none">
        {/* <p className="font-editorial italic text-lg sm:text-xl text-[#1B5E3B] m-0">
          We have some news...
        </p> */}
        <p className="font-sans text-xs tracking-wider text-[#1B5E3B]/60 uppercase animate-[slideHintPulse_2s_ease-in-out_infinite]">
          Slide Up ↑
        </p>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING PETALS & SPARKLE DECOR
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
          className="absolute -top-10 rounded-[60%_40%_70%_30%/50%_60%_40%_50%] bg-gradient-to-br from-[#FECDD3]/60 to-[#D4956A]/40 drop-shadow-[0_2px_4px_rgba(212,149,106,0.15)] animate-[fallPetal_linear_infinite]"
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
          className="absolute w-1 h-1 bg-[#9E8C45] rounded-full drop-shadow-[0_0_6px_rgba(158,140,69,0.6)] animate-[sparkleTwinkle_ease-in-out_infinite]"
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#E8F0DE]/90 backdrop-blur-md border-b border-[#1B5E3B]/15 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <a href="#hero" className="flex items-center justify-center no-underline">
        <img className="w-14" src="logo.png" alt="IV Logo" />
      </a>
      <div className="flex items-center gap-4">
        <a
          href="/rsvp"
          className="font-sans text-xs font-bold tracking-wider uppercase bg-[#1B5E3B] text-white px-5 py-2 rounded-full no-underline transition-all duration-300 shadow-[0_2px_8px_rgba(27,94,59,0.25)] hover:bg-[#14482D] hover:-translate-y-0.5"
        >
          RSVP
        </a>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION — IV Card Style with watercolor + florals
   ═══════════════════════════════════════════════════════════ */
function HeroSection() {
  const scrollToExplore = () => {
    const el = document.getElementById("promises");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 overflow-hidden"
      id="hero"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/couple1.jpg"
          alt="Isioma & Victor"
          className="w-full h-full object-cover object-top"
        />
        {/* Green-tinted overlay matching IV card palette */}
        <div className="absolute inset-0 bg-linear-to-b from-[#1B5E3B]/70 to-[#1B5E3B]/50 " />
      </div>

      {/* Floral corners */}
      <FloralCorner position="top-right" />
      <FloralCorner position="bottom-left" />

      <div className="relative z-10 flex flex-col items-center justify-center mx-auto reveal-scale">
        <div className="relative z-2 p-6 flex flex-col items-center">
          {/* IV Monogram */}
          <div className="my-4">
            <img
              src="logo.png"
              alt="IV"
              className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
            />
          </div>

          {/* Typographic Lockup */}
          <div className="relative inline-flex flex-col items-center select-none my-3">
            <h2 className="font-editorial text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              Isioma
            </h2>
            <span className="font-editorial italic text-3xl sm:text-4xl font-light text-[#E8F0DE]/90 my-1 leading-none select-none">
              &
            </span>
            <h2 className="font-editorial italic text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              Victor
            </h2>
          </div>

          <p className="font-editorial italic text-lg text-[#E8F0DE] mt-2">
            #TheIVLeague
          </p>
          <p className="font-semibold text-[#E8F0DE] text-sm mt-1">
            November 28th, 2026
          </p>

          <button
            type="button"
            className="mt-8 inline-flex items-center gap-2 px-10 py-3 font-sans text-xs font-bold tracking-[0.25em] uppercase text-white bg-transparent border-2 border-white/80 rounded-sm cursor-pointer transition-all duration-300 hover:bg-white hover:text-[#1B5E3B] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)]"
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
   MEET THE COUPLE — Our Promises Section
   ═══════════════════════════════════════════════════════════ */
function OurPromises() {
  return (
    <section
      className="relative py-16 sm:py-20 px-6 max-w-[650px] mx-auto"
      id="promises"
    >
      {/* Floral corner accents */}
      <FloralCorner position="top-right" className="opacity-30 sm:opacity-50" />

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1B5E3B] tracking-tight reveal">
          Meet The Couple
        </h2>
        <SectionFlourish />
      </div>

      {/* Couple Card */}
      <div className="relative rounded-2xl p-6 sm:p-8 mb-6 border border-[#1B5E3B]/15 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden reveal reveal-right bg-white/70 backdrop-blur-sm">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-[#1B5E3B] to-[#9E8C45] rounded-l-2xl" />

        {/* Small floral accent */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none opacity-40">
          <img
            src="/floral-corner.jpg"
            alt=""
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-13 h-13 rounded-full bg-[#E8F0DE] flex items-center justify-center border-2 border-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] overflow-hidden">
            <img src="logo.png" alt="IV" className="w-10 h-10" />
          </div>
        </div>
        <p className="font-editorial italic text-lg leading-relaxed text-[#4a4536] relative">
          <span className="font-serif text-4xl leading-none -align-[0.4rem] text-[#9E8C45] mr-1">
            "
          </span>
          What started as a contact exchange at a mutual friend's wedding has
          grown into a love we're excited to celebrate with the people who
          matter most to us. On Nov 28, we take off on a forever journey and
          invite you to share in our joy as we celebrate the blending of our
          families and traditions. Thank you for your love, prayers and support;
          we can't wait to celebrate with you!
        </p>
        <p className="mt-3 text-[#4a4536]">With Love,</p>
        <p className="font-serif text-lg font-semibold text-[#1B5E3B]">
          Isioma & Victor
        </p>
      </div>

      {/* Bottom floral */}
      <FloralCorner
        position="bottom-left"
        className="opacity-20 sm:opacity-35"
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COLORS OF THE DAY — Palette Cards (Emerald, Olive, Peach)
   ═══════════════════════════════════════════════════════════ */
const WEDDING_PALETTE = [
  { name: "Emerald Green", hex: "#50C878", img: "/emeraldGreen.jpeg" },
  { name: "Olive Green", hex: "#808000", img: "/oliveGreen.jpeg" },
  { name: "Peach", hex: "#FFE5B4", img: "/peach.jpeg" },
];

function GardenRomance() {
  return (
    <section
      className="relative py-16 sm:py-20 px-6 max-w-[680px] mx-auto"
      id="garden"
    >
      {/* Floral corner accents */}
      <FloralCorner position="top-right" className="opacity-25 sm:opacity-40" />

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1B5E3B] tracking-tight reveal reveal-delay-1">
          Colours of the Day
        </h2>
        <SectionFlourish />
      </div>

      {/* Palette Cards */}
      <div className="flex flex-col gap-5">
        {WEDDING_PALETTE.map((item, index) => (
          <div
            key={item.name}
            className={`relative rounded-2xl p-5 sm:p-6 border border-[#1B5E3B]/15 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden reveal bg-white/70 backdrop-blur-sm ${
              index % 2 === 0 ? "reveal-left" : "reveal-right"
            }`}
          >
            {/* Color accent bar */}
            <div
              className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl"
              style={{ backgroundColor: item.hex }}
            />

            <div className="flex flex-col items-center gap-5">
              {/* Color swatch image */}
              <div
                className="shrink-0 w-28 h-28 sm:w-24 sm:h-24 rounded-xl border-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden"
                style={{ borderColor: item.hex }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3
                className="font-serif text-xl sm:text-2xl font-semibold leading-tight"
                style={{ color: item.hex }}
              >
                {item.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   THE VENUE SECTION — Matching IV card bottom panel
   ═══════════════════════════════════════════════════════════ */
function TheVenue() {
  return (
    <section
      className="relative py-16 sm:py-20 px-6 overflow-hidden"
      id="venue"
    >
      {/* Floral corners */}
      <FloralCorner position="top-right" className="opacity-25 sm:opacity-45" />
      <FloralCorner
        position="bottom-left"
        className="opacity-25 sm:opacity-45"
      />

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1B5E3B] tracking-tight reveal">
          The Venue
        </h2>
        <SectionFlourish />
      </div>

      <div className="relative max-w-[650px] mx-auto rounded-3xl overflow-hidden border border-[#1B5E3B]/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)] reveal reveal-scale bg-white/80 backdrop-blur-sm">
        <div className="relative w-full h-60 overflow-hidden">
          <img
            src="/Bravo.jpeg"
            alt="Brava Event Center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#1B5E3B]/70" />
          <h3 className="absolute bottom-4 left-6 text-white font-serif text-2xl drop-shadow-md">
            Brava Event Center
          </h3>
        </div>

        <div className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center gap-2 font-sans text-sm text-[#4a4536] mb-8">
            <span>📍 Industries Road, Plot 8, Guinness Road, Ogba, Lagos.</span>
          </div>

          {/* Date & Time cards matching IV card typography */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="relative rounded-xl p-5 sm:p-6 border border-[#1B5E3B]/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] reveal reveal-left overflow-hidden bg-[#E8F0DE]/50">
              <div className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#1B5E3B] mb-1">
                Saturday
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-sans text-xs font-bold tracking-wider uppercase text-[#1B5E3B] border-t-2 border-b-2 border-[#1B5E3B] py-0.5">
                  NOV
                </span>
                <span className="font-serif text-5xl font-bold text-[#9E8C45]">
                  28
                </span>
                <span className="font-serif text-2xl font-semibold text-[#1B5E3B]">
                  2026
                </span>
              </div>
              <div className="font-sans text-xs font-bold tracking-wider uppercase text-[#1B5E3B] mt-1">
                1:00PM
              </div>
            </div>

            <div className="relative rounded-xl p-5 sm:p-6 border border-[#1B5E3B]/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] reveal reveal-right overflow-hidden bg-[#E8F0DE]/50 flex flex-col items-center justify-center">
              <p className="font-serif text-xl font-bold text-[#1B5E3B] leading-tight mb-1">
                Brava Event Center,
              </p>
              <p className="font-editorial text-sm text-[#4a4536] leading-relaxed text-center">
                Industries Road, Plot 8, Guinness Road, Ogba, Lagos
              </p>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/N3nCPA6bf52Wd87i9?g_st=ac"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 py-3 px-8 font-sans text-xs font-bold tracking-[0.18em] uppercase text-white bg-[#1B5E3B] rounded-full no-underline transition-all duration-300 shadow-[0_4px_15px_rgba(27,94,59,0.25)] hover:bg-[#14482D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(27,94,59,0.35)]"
          >
            <span>➔</span>
            <span>Open in Maps</span>
          </a>

          {/* Strictly by Invitation */}
          <p className="mt-6 font-sans text-xs font-bold tracking-[0.3em] uppercase text-[#1B5E3B]/60">
            Strictly by Invitation
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENT CONTACT SECTION
   ═══════════════════════════════════════════════════════════ */
function EventContact() {
  return (
    <section
      className="relative py-10 sm:py-16 px-6 max-w-[680px] mx-auto"
      id="rsvp"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1B5E3B] tracking-tight reveal reveal-delay-1">
          Event Contact
        </h2>
        <SectionFlourish />
      </div>

      <div className="relative flex flex-col items-center justify-center rounded-2xl p-5 sm:p-6 mb-4 border border-[#1B5E3B]/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 reveal reveal-left overflow-hidden bg-white/70 backdrop-blur-sm">
        {/* Floral accent */}
        <div className="absolute -top-2 -left-2 pointer-events-none opacity-30">
          <img
            src="/floral-corner-bl.jpg"
            alt=""
            className="w-24 h-24 object-contain"
          />
        </div>

        <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-[#4a4536] max-w-[520px] mx-auto mb-6 reveal reveal-delay-2">
          For enquiries, please reach out to:
        </p>
        <div className="space-y-2 text-center">
          <p className="text-[#1B5E3B] font-medium">
            <strong>Chinyem:</strong> +234 701 955 1876
          </p>
          <p className="text-[#1B5E3B] font-medium">
            <strong>Ijeoma:</strong> +234 803 205 4265
          </p>
        </div>

        <div className="absolute top-2 -right-2 pointer-events-none opacity-30">
          <img
            src="/floral-corner.jpg"
            alt=""
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGISTRY / GIFTING SECTION
   ═══════════════════════════════════════════════════════════ */
interface DisplayTexts {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  monitization_text?: string;
}

function Registry({ displayTexts }: { displayTexts: DisplayTexts | null }) {
  const [copied, setCopied] = useState(false);

  const accountNumber = displayTexts?.account_number ?? "";
  const bankName = displayTexts?.bank_name ?? "";
  const accountName = displayTexts?.account_name ?? "";
  const monetizationText =
    displayTexts?.monitization_text ??
    "Due to logistics constraints, a monetary gift would be greatly appreciated. However, if you prefer the traditional gifting, please see gifting options in the RSVP and Gift Registry below";

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <section
      className="relative py-16 sm:py-20 px-6 max-w-[650px] mx-auto"
      id="registry"
    >
      {/* Floral accents */}
      <FloralCorner position="top-right" className="opacity-20 sm:opacity-35" />

      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1B5E3B] tracking-tight reveal">
          RSVP and Gifting
        </h2>
        <SectionFlourish />
      </div>

      <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-[#4a4536] max-w-[480px] mx-auto mb-9 reveal reveal-delay-1">
        {monetizationText}
      </p>

      {/* Account Details Card */}
      {(accountNumber || bankName) && (
      <div className="relative flex flex-col items-start justify-between rounded-2xl p-5 sm:p-6 mb-4 border border-[#1B5E3B]/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 reveal reveal-left overflow-hidden bg-white/70 backdrop-blur-sm">
        <div className="flex w-full items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DE] flex items-center justify-center text-xl">
            ✈️
          </div>
          <span className="font-serif text-lg font-medium text-[#1B5E3B]">
            Account Details
          </span>
        </div>
        <div className="flex flex-col gap-1 mt-3">
          {bankName && <p className="font-serif text-[#4a4536]">{bankName}</p>}
          <div className="flex items-center gap-3">
            <p className="font-serif text-[#1B5E3B] font-medium font-mono tracking-wide">
              {accountNumber}
            </p>
            <button
              type="button"
              onClick={handleCopyAccount}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all duration-200 cursor-pointer ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
                  : "bg-[#E8F0DE] text-[#1B5E3B] border border-[#1B5E3B]/25 hover:bg-[#1B5E3B]/10 hover:border-[#1B5E3B]/50"
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
                    className="w-3.5 h-3.5 text-[#1B5E3B]"
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
          {accountName && <p className="font-serif text-[#4a4536]">{accountName}</p>}
        </div>
      </div>
      )}

      {/* Gift Registry Link */}
      <div className="relative flex items-center justify-between rounded-2xl p-5 sm:p-6 mb-4 border border-[#1B5E3B]/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 reveal reveal-right overflow-hidden bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DE] flex items-center justify-center text-xl">
            🎁
          </div>
          <span className="font-serif text-lg font-medium text-[#1B5E3B]">
            RSVP and Gift Registry
          </span>
        </div>
        <a
          href="/rsvp"
          className="font-sans text-xs font-bold tracking-wider uppercase py-2.5 px-6 rounded-full no-underline transition-all duration-300 border-2 border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-white"
        >
          View
        </a>
      </div>

      <FloralCorner
        position="bottom-left"
        className="opacity-20 sm:opacity-35"
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN & FOOTER — Deep emerald with gold accents
   ═══════════════════════════════════════════════════════════ */
function CountdownFooter({ onReplayIntro }: { onReplayIntro: () => void }) {
  const { days, hours, mins, secs } = useLiveCountdown(WEDDING_TARGET_DATE);

  return (
    <footer
      className="relative bg-linear-to-b from-[#1B5E3B] to-[#0D3320] text-white py-20 pb-8 px-6 text-center overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_20%,rgba(158,140,69,0.15)_0%,transparent_60%)] before:pointer-events-none"
      id="countdown"
    >
      {/* Floral corners with reduced opacity */}
      <FloralCorner
        position="bottom-left"
        className="opacity-20 sm:opacity-30"
      />
      <FloralCorner
        position="bottom-right"
        className="opacity-20 sm:opacity-30"
      />

      <div className="reveal">
        <div className="font-sans text-xs font-bold tracking-[0.3em] uppercase text-[#9E8C45] mb-8 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-[#9E8C45]/40" />
          <span>Counting Down To Forever</span>
          <span className="w-8 h-px bg-[#9E8C45]/40" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-white mb-10">
          November 28th, 2026
        </h1>

        {/* 4 Countdown Dials */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12">
          {[
            { value: days, label: "Days" },
            { value: hours, label: "Hours" },
            { value: mins, label: "Mins" },
            { value: secs, label: "Secs" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[1.5px] border-[#9E8C45]/45 bg-white/8 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-105 hover:border-[#9E8C45] transition-all duration-300 mb-2">
                <span className="font-serif text-xl sm:text-3xl font-semibold text-white">
                  {item.value}
                </span>
              </div>
              <span className="font-sans text-[10px] sm:text-xs tracking-wider uppercase text-white/65">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="reveal reveal-delay-1">
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
          <span className="w-8 h-px bg-[#9E8C45]/40" />
          <h3 className="font-serif text-3xl sm:text-5xl font-normal text-white">
            Isioma & Victor
          </h3>
          <span className="w-8 h-px bg-[#9E8C45]/40" />
        </div>
        <p className="font-editorial italic text-lg sm:text-xl leading-relaxed text-white/85 max-w-[440px] mx-auto">
          Thank you for being a part of our story. We cannot wait to share this
          magical day with our favorite people.
        </p>
      </div>

      <div className="w-full flex justify-center items-center mt-8">
        <img className="w-52 opacity-80" src="logo.png" alt="IV Logo" />
      </div>

      <p className="mt-6 font-sans text-xs text-white/30 tracking-wider">
        #TheIVLeague • November 28, 2026
      </p>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN WEDDING HOME COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Home({ loaderData }: Route.ComponentProps) {
  const { displayTexts } = loaderData;
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contentRef = useIntersectionReveal();

  const handleOpenEnvelope = useCallback(() => {
    setEnvelopeOpened(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    // Start background audio on envelope open
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          let vol = 0;
          const fadeIn = setInterval(() => {
            vol = Math.min(vol + 0.02, 0.2);
            audio.volume = vol;
            if (vol >= 0.2) clearInterval(fadeIn);
          }, 100);
        })
        .catch(() => {
          // Autoplay blocked — user can unmute via button
        });
    }
  }, []);

  const handleReplayIntro = useCallback(() => {
    setEnvelopeOpened(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      if (audio.paused && envelopeOpened) {
        audio.volume = 0.2;
        audio.play().catch(() => {});
      }
    } else {
      audio.muted = true;
    }
    setIsMuted(!isMuted);
  }, [isMuted, envelopeOpened]);

  return (
    <main className="relative w-full min-h-screen text-[#4a4536] font-editorial overflow-x-hidden antialiased">
      {/* Fixed watercolor background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/watercolor-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Background Audio */}
      <audio ref={audioRef} src="/bgAudio.mp3" loop preload="auto" />

      {/* Floating Blossom Petals */}
      <FloatingPetalsDecor />

      {/* Envelope Opener */}
      <EnvelopeIntro isOpen={envelopeOpened} onOpen={handleOpenEnvelope} />

      {/* Top Floating App Bar */}
      {envelopeOpened && <TopBar onReplayIntro={handleReplayIntro} />}

      {/* Floating Mute/Unmute Button */}
      {envelopeOpened && (
        <button
          type="button"
          onClick={toggleMute}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-[#1B5E3B]/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)]"
          aria-label={
            isMuted ? "Unmute background music" : "Mute background music"
          }
          title={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? (
            <svg
              className="w-5 h-5 text-[#1B5E3B]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-[#1B5E3B]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
      )}

      {/* Main Wedding Story & Event Details */}
      <div
        ref={contentRef}
        className={`transition-all duration-1000 ease-in-out delay-200 ${
          envelopeOpened
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <HeroSection />
        <OurPromises />
        <GardenRomance />
        <TheVenue />
        <EventContact />
        <Registry displayTexts={displayTexts} />
        <CountdownFooter onReplayIntro={handleReplayIntro} />
      </div>
    </main>
  );
}
