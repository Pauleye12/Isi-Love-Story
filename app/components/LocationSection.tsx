// import { motion } from "framer-motion";
import { motion, AnimatePresence, type Variants } from "motion/react";

export function LocationSection() {
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="min-h-screen w-full py-14 px-4 flex flex-col items-center justify-center relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl w-full flex flex-col items-center"
      >
        {/* Section Header */}
        <motion.p
          variants={itemVariants}
          className="text-[#50C878] font-sans text-xs uppercase tracking-[0.25em] mb-3"
        >
          The Celebration Venue
        </motion.p>

        <motion.h2
          variants={itemVariants}
          className="font-serif-romantic text-4xl sm:text-5xl text-[#FFE5B4] mb-16 text-center"
        >
          Where & When
        </motion.h2>

        {/* Venue Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-stretch">
          {/* SVG Illustration Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-5 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center bg-stone-900/40 relative overflow-hidden"
          >
            {/* SVG Venue Illustration */}
            <img
              src="/Bravo.jpeg"
              alt=""
              className="w-full h-full object-cover rounded-3xl "
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-3xl" />
            {/* Subtle soft lighting in background */}
            <div className="absolute inset-0 bg-radial-gradient from-[#50C878]/10 to-transparent pointer-events-none" />
          </motion.div>

          {/* Details Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-7 glass-panel rounded-3xl p-8 sm:p-10 flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Map pin icon + Venue details */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#2a362d]/50 border border-[#50C878]/30 flex items-center justify-center text-[#FFE5B4] shrink-0 mt-1">
                  {/* Pin SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif-romantic text-2xl text-[#FFE5B4] mb-2">
                    Brava Event Center
                  </h3>
                  <p className="text-stone-300 text-sm leading-relaxed font-light">
                    📍 Industries Road, Plot 8, Guinness Road, Ogba, Lagos.
                  </p>
                </div>
              </div>

              {/* Time card */}
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-[#2a362d]/50 border border-[#50C878]/30 flex items-center justify-center text-[#FFE5B4] shrink-0 mt-1">
                  {/* Calendar SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="font-serif-romantic text-2xl text-[#FFE5B4] ">
                  Saturday, November 28th, 2026
                </h3>
              </div>
            </div>

            {/* Actions button */}
            <div className="mt-8 pt-6 border-t border-stone-800">
              <motion.a
                href="https://maps.app.goo.gl/N3nCPA6bf52Wd87i9?g_st=ac"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-linear-to-r from-[#50C878] to-[#3da863] hover:from-[#5dd889] hover:to-[#50C878] text-stone-950 font-sans text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md font-medium cursor-pointer transition-colors duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Directions
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
