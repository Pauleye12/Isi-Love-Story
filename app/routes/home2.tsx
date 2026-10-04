import { useState, useEffect, useRef, useCallback } from "react";
// import type { Route } from "./+types/home";
import type { Route } from "./+types/home2";
import { ZipReveal } from "../components/ZipReveal";
import { HeroSection } from "../components/HeroSection";
import { CoupleSection } from "../components/CoupleSection";
import { PaletteSection } from "../components/PaletteSection";
import { LocationSection } from "../components/LocationSection";
import { ClosingSection } from "../components/ClosingSection";
import { AudioPlayer, type AudioPlayerRef } from "../components/AudioPlayer";
import { ContactMe } from "~/components/ContactMe";
import Gift from "~/components/Gift";
import EventContact from "~/components/EventContact";

const BG_IMAGES = ["/couple1.jpg"];

const SLIDE_INTERVAL = 6000; // ms between slides

export function meta({}: Route.MetaArgs) {
  const title = "Save the Date | Isioma & Victor";
  const description =
    "Celebrate the wedding of Isioma & Victor. Zip down to unveil our story, promises, venue, and registry.";
  const image = "/logo.png";

  return [
    { title },
    { name: "description", content: description },

    // Open Graph / Facebook / WhatsApp
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

export default function Home() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);

  // Lock scroll while bow is locked/unrevealed
  useEffect(() => {
    if (!isAnimationComplete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnimationComplete]);

  // Background carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BG_IMAGES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleRevealStart = () => {
    // Start music playback on the user click event
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
    }
    setIsRevealed(true);
  };

  const handleRevealComplete = () => {
    // Allow scroll once curtains are fully opened
    setIsAnimationComplete(true);
  };

  return (
    <main className="relative min-h-screen w-full  text-stone-100 overflow-x-hidden selection:bg-[#50C878]/30 selection:text-[#FFE5B4]">
      {/* 1. Fixed Background Carousel */}
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
        {BG_IMAGES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-1800 ease-in-out"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              filter: "brightness(0.35) contrast(1.05)",
            }}
          />
        ))}
      </div>
      {/* 2. Fixed Gradient Overlay for Readability */}
      <div className="fixed inset-0 w-full h-full bg-linear-to-b from-stone-950/70 via-[#1a2e1a]/60 to-[#2a362d]/50 -z-10 pointer-events-none" />
      {/* 3. Zipper Reveal Overlay (unmounts after open animation completes) */}
      {!isAnimationComplete && (
        <ZipReveal
          onRevealStart={handleRevealStart}
          onRevealComplete={handleRevealComplete}
        />
      )}
      {/* 4. Main Scroll Sections (Hero, Couple, Palette, Location, Closing) */}
      <div
        className={`transition-opacity duration-1000 ${isRevealed ? "opacity-100" : "opacity-0"}`}
      >
        {/* Pass isRevealed to HeroSection to stagger entrance immediately when clicked */}
        <HeroSection isActive={isRevealed} />
        {/* <p>hey you</p> */}

        {isAnimationComplete && (
          <>
            <CoupleSection />
            <PaletteSection />
            <LocationSection />
            <EventContact />
            <Gift />
            <ClosingSection />
            {/* <ContactMe /> */}
          </>
        )}
      </div>
      {/* 5. Music player controls — always mounted so ref is available for mobile autoplay */}
      <AudioPlayer ref={audioPlayerRef} visible={isRevealed} />
    </main>
  );
}
