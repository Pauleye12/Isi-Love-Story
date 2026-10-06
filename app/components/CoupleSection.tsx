// import { motion } from "framer-motion";
import { motion, AnimatePresence, type Variants } from "motion/react";

export function CoupleSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
    },
  };

  return (
    <section className="min-h-[80dvh] w-full py-14 px-4 flex flex-col items-center justify-center relative z-10">
      {/* Background radial highlight for readability */}
      <div className="absolute inset-0 bg-radial-gradient from-[#50C878]/10 via-transparent to-transparent pointer-events-none hidden " />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl w-full flex flex-col items-center"
      >
        {/* Section Header */}
        {/* <motion.p
          variants={cardVariants}
          className="text-rose-300 font-sans text-xs uppercase tracking-[0.25em] mb-3  "
        >
          Meet the Bride & Groom
        </motion.p> */}

        <motion.h2
          variants={cardVariants}
          className="font-serif-romantic text-4xl sm:text-5xl text-[#FFE5B4] mb-1 text-center"
        >
          Meet the Couple
        </motion.h2>

        {/* Bios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 items-center w-full">
          {/* Groom Card */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5 }}
            className="md:col-span-5 glass-panel rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300"
          >
            <div className="w-24 h-24 rounded-full border-2 border-[#50C878]/30 overflow-hidden mb-6 flex items-center justify-center bg-stone-900/50">
              {/* Decorative Placeholder Initials */}
              <img src="logo.png" alt="" />
            </div>

            {/* <h3 className="font-serif-romantic text-3xl text-amber-100 mb-2">
              Oluwagbemiga Ariyoleye
            </h3>
            <p className="text-rose-200/60 font-sans text-xs uppercase tracking-wider mb-4">
              The Groom
            </p> */}
            <p className="font-editorial italic text-lg leading-relaxed text-stone-300 relative">
              <span className="font-serif text-4xl leading-none -align-[0.4rem] text-stone-300 mr-1">
                “
              </span>
              What started as a casual exchange at a mutual friend's wedding has
              grown into a love we're excited to share with the people who
              matter most to us. On 28 November, we take off on a forever
              journey and invite you to join us as we bring together our
              families and traditions. Thank you for your love, prayers and
              support; we can't wait to celebrate with you!
            </p>
            <p className="mt-3">With Love,</p>
            <p className="font-serif text-lg font-semibold ">Isioma & Victor</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
