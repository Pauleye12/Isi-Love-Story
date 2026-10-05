import { useState } from "react";
import { motion, type Variants } from "motion/react";

interface DisplayTexts {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  monitization_text?: string;
}

interface GiftProps {
  displayTexts: DisplayTexts | null;
}

export default function Gift({ displayTexts }: GiftProps) {
  const [copied, setCopied] = useState(false);
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

  const accountNumber = displayTexts?.account_number ?? "";
  const bankName = displayTexts?.bank_name ?? "";
  const accountName = displayTexts?.account_name ?? "";

  return (
    <section className="min-h-[80dvh]  w-full py-14 px-4 flex flex-col items-center justify-center relative z-10">
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
          Gift Registry
        </motion.p>

        <motion.h2
          variants={itemVariants}
          className="font-serif-romantic text-4xl sm:text-5xl text-[#FFE5B4] mb-1 text-center"
        >
          RSVP and Gifting
        </motion.h2>

        {/* Gift Section Content */}
        <motion.div
          variants={itemVariants}
          className="glass-panel rounded-3xl p-8 sm:p-10 w-full max-w-2xl"
        >
          {/* Icon */}
          {/* <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M12 6v6l4 2" />
                <path d="M20 12A8 8 0 1 1 4 12a8 8 0 0 1 16 0z" />
              </svg>
            </div>
          </div> */}

          {/* Text Content */}
          <div className="text-center space-y-4 mb-6">
            {/* <h3 className="font-serif-romantic text-3xl text-amber-100">
              Wishing Well
            </h3> */}
            <p className="text-stone-300 text-sm leading-relaxed max-w-lg mx-auto">
              {displayTexts?.monitization_text ??
                "Due to logistics constraints, a monetary gift would be greatly appreciated. However, if you prefer the traditional gifting, please see gifting options in the RSVP and Gift Registry below"}
            </p>
          </div>
          {/* <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-wedding-text max-w-120 mx-auto mb-9 reveal reveal-delay-1">
            Due to logistics constraints, a monetary gift would be greatly
            appreciated. However, if you prefer the traditional gifting, please
            see gifting options in the RSVP and Gift Registry below
          </p> */}

          {/* Account Details */}
          <div className="space-y-4">
            {/* Bank Details */}
            <div className="bg-stone-900/30 rounded-xl p-5 border border-stone-800">
              <h4 className="font-sans text-xs text-[#FFE5B4] uppercase tracking-wider mb-2">
                Bank Transfer
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[#FFE5B4] text-sm font-mono font-semibold">
                    {accountNumber}
                  </p>
                  <p className="text-stone-400 text-xs font-light">
                    {bankName}
                    {accountName ? ` • ${accountName}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(accountNumber).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#50C878] to-[#3da863] hover:from-[#5dd889] hover:to-[#50C878] text-stone-950 font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md font-medium cursor-pointer transition-colors w-fit justify-center"
                >
                  {copied ? "Copied!" : "Copy Number"}
                </button>
              </div>
            </div>

            <div className="bg-stone-900/30 rounded-xl p-5 border border-stone-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl  flex items-center justify-center text-xl ">
                  🎁
                </div>
                <span className="font-serif text-lg font-medium text-[#FFE5B4]">
                  RSVP and Gift Registry
                </span>
              </div>
              <a
                href="/rsvp"
                className="inline-flex items-center gap-2 bg-linear-to-r from-[#50C878] to-[#3da863] hover:from-[#5dd889] hover:to-[#50C878] text-stone-950 font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md font-medium cursor-pointer transition-colors w-fit justify-center"
              >
                View
              </a>
            </div>

            {/* Payment Link */}
            {/* <div className="bg-stone-900/30 rounded-xl p-5 border border-rose-500/30">
              <h4 className="font-sans text-xs text-rose-200 uppercase tracking-wider mb-2">
                Online Payment
              </h4>
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-amber-100 font-sans text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md font-medium cursor-pointer transition-colors w-full justify-center">
                Pay via Paystack
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M10 10l2 2 4-4" />
                </svg>
              </button>
            </div> */}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
