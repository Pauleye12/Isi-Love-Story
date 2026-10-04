// import { motion } from "framer-motion";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface ColorItem {
  name: string;
  hex: string;
  img: string;
  textColor: string;
}

const WEDDING_COLORS: ColorItem[] = [
  {
    name: "Emerald Green",
    hex: "#50C878",
    img: "/emeraldGreen.jpeg",
    textColor: "text-[#50C878]",
  },
  {
    name: "Olive Green",
    hex: "#808000",
    img: "/oliveGreen.jpeg",
    textColor: "text-[#808000]",
  },
  {
    name: "Peach",
    hex: "#FFE5B4",
    img: "/peach.jpeg",
    textColor: "text-[#FFE5B4]",
  },
];

export function PaletteSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const swatchVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15,
      },
    },
  };

  return (
    <section className="min-h-screen w-full py-14 px-4 flex flex-col items-center justify-center relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl w-full flex flex-col items-center"
      >
        {/* Section Header */}
        <motion.p
          variants={swatchVariants}
          className="text-[#50C878] font-sans text-xs uppercase tracking-[0.25em] mb-3"
        >
          Theme Aesthetics
        </motion.p>

        <motion.h2
          variants={swatchVariants}
          className="font-serif-romantic text-4xl sm:text-5xl text-[#FFE5B4] mb-6 text-center"
        >
          Colours of the Day
        </motion.h2>

        {/* <motion.p
          variants={swatchVariants}
          className="text-stone-300 text-sm max-w-lg text-center font-light leading-relaxed mb-16"
        >
          To help us capture the visual theme of our celebration, we invite you
          to dress in shades inspired by our custom palette.
        </motion.p> */}

        {/* Color Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {WEDDING_COLORS.map((color, index) => (
            <motion.div
              key={index}
              variants={swatchVariants}
              whileHover={{ y: -8 }}
              className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 relative group overflow-hidden"
            >
              {/* Decorative Swatch circle */}
              <motion.div
                className="w-20 h-20 rounded-full shadow-lg mb-6 border border-white/10 relative"
                style={{ backgroundColor: color.hex }}
                whileHover={{ scale: 1.12, rotate: 12 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <img
                  src={color.img}
                  alt={color.name}
                  className="w-full h-full object-cover rounded-full "
                />
                {/* Gloss reflection overlay */}
                {/* <div className="absolute inset-0 rounded-full bg-linear-to-tr from-white/0 via-white/15 to-white/30" />
                <div className="absolute inset-0.75 rounded-full border border-white/10" /> */}
              </motion.div>

              {/* Swatch Label */}
              <h3
                className={`font-serif-romantic text-xl ${color.textColor} font-medium mb-1`}
              >
                {color.name}
              </h3>

              {/* <code className="text-xs text-stone-400 font-mono tracking-wider mb-3">
                {color.hex}
              </code> */}

              {/* <p className="text-stone-300 text-xs font-light leading-relaxed">
                {color.description}
              </p> */}

              {/* Subtle backlighting effect of the swatch color on hover */}
              <div
                className="absolute -bottom-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl pointer-events-none -z-10"
                style={{ backgroundColor: color.hex }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
