// import { motion } from "framer-motion";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface HeroSectionProps {
  isActive: boolean;
}

export function HeroSection({ isActive }: HeroSectionProps) {
  // Cinematic transition settings
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.35,
        delayChildren: 0.2,
      },
    },
  };

  const fadeScaleVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "80px",
      opacity: 0.6,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  };

  return (
    <section className="min-h-screen w-full flex flex-col justify-between items-center text-center px-4 pt-24 pb-12 relative overflow-hidden select-none">
      {/* Spacer to balance bottom section */}
      <div className="h-6" />

      {/* Main content container */}
      {isActive && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Small elegant teaser */}
          <motion.p
            variants={fadeScaleVariants}
            className="text-[#FFE5B4]/80 font-sans text-xs sm:text-sm tracking-[0.3em] mb-4 flex flex-col gap-2 items-center "
          >
            <span className="capitalize font-semibold font-serif-romantic lg:text-5xl text-3xl ">
              Mark Your Calendar
            </span>
            Because something beautiful is about to begin
          </motion.p>

          {/* Large calligraphic/romantic heading */}
          <motion.h1
            variants={fadeScaleVariants}
            className="font-serif-romantic text-6xl sm:text-8xl md:text-9xl text-[#FFE5B4] font-light tracking-wide leading-[1.1] mb-6 drop-shadow-md"
          >
            Isioma{" "}
            <span className="font-script text-[#50C878] text-5xl sm:text-7xl md:text-8xl block sm:inline sm:-mx-2">
              &
            </span>{" "}
            Victor
          </motion.h1>

          {/* Delicate horizontal divider */}
          <motion.div
            variants={lineVariants}
            className="h-px bg-[#FFE5B4]/50 my-6"
          />

          {/* Big display date */}
          <motion.p
            variants={fadeScaleVariants}
            className="font-serif-romantic text-3xl sm:text-4xl text-[#FFE5B4]/90 tracking-widest mt-2"
          >
            ** . ** . 2026
          </motion.p>

          {/* Location teaser */}
          <motion.p
            variants={fadeScaleVariants}
            className="text-stone-300 font-sans text-xs sm:text-sm tracking-[0.2em] uppercase mt-4"
          >
            Lagos, Nigeria
          </motion.p>
        </motion.div>
      )}

      {/* Floating scroll indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: "smooth",
            });
          }}
        >
          <span className="text-[10px] text-[#50C878]/60 uppercase tracking-[0.25em]">
            Scroll Down
          </span>
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-5 h-8 rounded-full border border-[#50C878]/30 flex justify-center pt-1"
          >
            <motion.div className="w-[3px] h-[6px] bg-[#50C878] rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
