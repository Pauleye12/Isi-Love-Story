import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function ClosingSection() {
  // Target date: October 16, 2026 at 4:00 PM
  const targetDate = new Date("2026-11-28T13:00:00").getTime();

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(
    calculateTimeRemaining(),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const padZero = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  return (
    <section className="min-h-screen w-full py-14 px-4 flex flex-col items-center justify-center relative z-10 text-center select-none">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-3xl w-full flex flex-col items-center"
      >
        {/* Decorative Ring Emblem */}
        <motion.div
          variants={itemVariants}
          className="w-16 h-16 rounded-full border border-[#50C878]/30 flex items-center justify-center text-[#50C878] mb-8"
        >
          {/* Linked Rings SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-8 h-8"
          >
            <circle cx="9" cy="12" r="5" />
            <circle cx="15" cy="12" r="5" />
          </svg>
        </motion.div>

        {/* Romantic quote */}
        <motion.p
          variants={itemVariants}
          className="font-serif-romantic text-3xl sm:text-4xl text-[#FFE5B4] italic font-light tracking-wide max-w-xl leading-relaxed mb-8"
        >
          "We can't wait to share our special day, our love, and our future with
          you."
        </motion.p>

        <motion.p
          // variants={fadeScaleVariants}
          className="font-serif-romantic text-3xl sm:text-4xl text-[#FFE5B4]/90 tracking-widest mt-2"
        >
          28 . 11 . 2026
        </motion.p>

        {/* Countdown Header */}
        <motion.p
          variants={itemVariants}
          className="text-[#50C878] font-sans text-xs uppercase tracking-[0.3em] mb-8 mt-8 "
        >
          Counting Down to November 28, 2026
        </motion.p>

        {/* Timer Blocks */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg w-full mb-16"
        >
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Mins", value: timeLeft.minutes },
            { label: "Secs", value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="glass-panel rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-md relative overflow-hidden"
            >
              {/* Value display */}
              <span className="font-serif-romantic text-3xl sm:text-5xl text-[#FFE5B4] font-light mb-1">
                {padZero(item.value)}
              </span>

              {/* Label */}
              <span className="text-[10px] sm:text-xs text-[#FFE5B4]/50 uppercase tracking-widest font-medium">
                {item.label}
              </span>

              {/* Top sheen */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#50C878]/20 to-transparent" />
            </div>
          ))}
        </motion.div>

        {/* Official Invite disclaimer */}
        {/* <motion.p
          variants={itemVariants}
          className="text-stone-400 font-sans text-xs uppercase tracking-[0.2em] max-w-xs sm:max-w-md leading-relaxed border-t border-stone-800/80 pt-8"
        >
          Official invitation & RSVP details to follow
        </motion.p> */}
      </motion.div>
    </section>
  );
}
