import { useState, useEffect } from "react";
import { Link, useFetcher } from "react-router";
import { motion, type Variants } from "motion/react";

interface DisplayTexts {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  monitization_text?: string;
  gifting_guide?: string;
  jumia_pickup?: string;
}

interface GiftItem {
  id: string | number;
  gift_name: string;
  purchase_link: string;
  chosen_by: string;
}

interface GiftProps {
  displayTexts: DisplayTexts | null;
  gifts?: GiftItem[];
}

export default function Gift({ displayTexts, gifts = [] }: GiftProps) {
  const [copied, setCopied] = useState(false);
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<Set<string>>(new Set());
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);
  const [giftSubmitted, setGiftSubmitted] = useState(false);

  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  // Read confirmed name from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("confirmedGuestName");
      if (saved) setConfirmedName(saved);
    } catch (e) {
      console.error("Could not read confirmedGuestName from localStorage", e);
    }
  }, []);

  // Sync submission state from fetcher response
  useEffect(() => {
    if (fetcher.data?.giftSuccess && !giftSubmitted) {
      setGiftSubmitted(true);
      setSelectedGifts(new Set());
    }
  }, [fetcher.data, giftSubmitted]);

  function toggleGift(giftId: string) {
    setSelectedGifts((prev) => {
      const next = new Set(prev);
      if (next.has(giftId)) {
        next.delete(giftId);
      } else {
        next.add(giftId);
      }
      return next;
    });
  }

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

  const availableGifts = (gifts ?? []).filter((g) => g.chosen_by === "none");
  const hasAvailableGifts = availableGifts.length > 0;

  return (
    <section className="min-h-[80dvh] w-full py-14 px-4 flex flex-col items-center justify-center relative z-10">
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
          className="glass-panel rounded-3xl p-6 sm:p-10 w-full max-w-2xl"
        >
          {/* Couple's Note / Wishing Well */}
          <div className="text-center space-y-4 mb-6">
            <p className="text-stone-300 text-sm leading-relaxed max-w-lg mx-auto">
              {displayTexts?.monitization_text ??
                "Due to logistics constraints, a monetary gift would be greatly appreciated. However, if you prefer traditional gifting, please see gifting options below."}
            </p>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            {/* Bank Details */}
            <div className="bg-stone-900/40 rounded-2xl p-5 border border-stone-800 flex items-center justify-center flex-col">
              <h4 className="font-sans text-xs text-[#FFE5B4] uppercase tracking-wider mb-2">
                Bank Transfer
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center items-center justify-center gap-3">
                <div>
                  <p className="text-[#FFE5B4] text-sm font-mono font-semibold text-center">
                    {accountNumber}
                  </p>
                  <p className="text-stone-400 text-xs font-light text-center">
                    {bankName}
                    {accountName ? ` • ${accountName}` : ""}
                  </p>
                </div>
                <button
                  type="button"
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

            {/* Jumia Pickup Guide */}
            {displayTexts?.jumia_pickup && (
              <div className="rounded-2xl border border-amber-500/30 bg-stone-900/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">📦</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FFE5B4]">
                    Gifting Order Guide
                  </span>
                </div>
                {displayTexts.gifting_guide && (
                  <p className="text-xs text-stone-300 leading-relaxed mb-1.5">
                    {displayTexts.gifting_guide}
                  </p>
                )}
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong className="text-[#FFE5B4]">
                    Jumia Pickup Details:{" "}
                  </strong>
                  {displayTexts.jumia_pickup}
                </p>
              </div>
            )}

            {/* Divider for Physical Gift Registry */}
            <div className="my-6 flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-stone-800" />
              <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#50C878] flex items-center gap-1.5 font-semibold">
                <span>🎁</span> Physical Gift Registry
              </span>
              <span className="h-px flex-1 bg-stone-800" />
            </div>

            {/* Guest Gifting Status Card */}
            {confirmedName ? (
              <div className="rounded-2xl border border-[#50C878]/30 bg-stone-900/60 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-sans uppercase tracking-widest text-[#50C878]">
                  <span>✓</span> Gifting as
                </div>
                <p className="font-serif-romantic text-2xl sm:text-3xl text-[#FFE5B4] mt-1 font-semibold">
                  {confirmedName}
                </p>
                <p className="text-xs text-stone-400 mt-2">
                  Want to gift as someone else?{" "}
                  <Link
                    to="/rsvp"
                    className="text-[#50C878] underline hover:text-[#5dd889] font-medium transition-colors"
                  >
                    Go back to RSVP page to change the name →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/30 bg-stone-900/60 p-5 text-center">
                <div className="mb-1 text-2xl">✍️</div>
                <h4 className="font-serif-romantic text-xl text-[#FFE5B4]">
                  Confirm Your RSVP First
                </h4>
                <p className="text-xs text-stone-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Please confirm your attendance on our RSVP page first so we
                  know who is gifting.
                </p>
                <Link
                  to="/rsvp"
                  className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-[#50C878] to-[#3da863] hover:from-[#5dd889] hover:to-[#50C878] text-stone-950 font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md font-semibold cursor-pointer transition-colors"
                >
                  Go to RSVP Page →
                </Link>
              </div>
            )}

            {/* Gifts Selection / Submission Flow */}
            {giftSubmitted ? (
              <div className="rounded-2xl border border-[#50C878]/40 bg-[#50C878]/10 p-6 text-center my-4">
                <div className="mb-2 text-3xl">🎁</div>
                <h3 className="font-serif-romantic text-2xl text-[#FFE5B4]">
                  Gift Selection Received!
                </h3>
                <p className="mt-2 text-sm text-stone-200">
                  Thank you for your generous gift selection, {confirmedName}!
                  The couple will be delighted!
                </p>
              </div>
            ) : !hasAvailableGifts ? (
              <div className="py-6 text-center text-sm text-stone-400">
                <div className="mb-2 text-2xl">🎁</div>
                <p>All gifts have been claimed. Thank you!</p>
              </div>
            ) : (
              <div>
                {fetcher.data?.intent === "selectGifts" &&
                  fetcher.data?.error && (
                    <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200 text-center">
                      {fetcher.data.error}
                    </div>
                  )}

                <div className="space-y-2.5 mb-5">
                  {availableGifts.map((gift) => {
                    const giftIdStr = String(gift.id);
                    const isSelected = selectedGifts.has(giftIdStr);
                    return (
                      <label
                        key={gift.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
                          isSelected
                            ? "border-[#50C878] bg-[#50C878]/15 shadow-sm"
                            : "border-stone-800 bg-stone-900/40 hover:border-[#50C878]/40 hover:bg-stone-900/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="giftId"
                          value={gift.id}
                          checked={isSelected}
                          disabled={!confirmedName}
                          onChange={() => toggleGift(giftIdStr)}
                          className="h-4 w-4 rounded border-stone-600 accent-[#50C878] focus:ring-[#50C878]"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-stone-200">
                            {gift.gift_name}
                          </span>
                        </div>
                        {gift.purchase_link && (
                          <a
                            href={gift.purchase_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#50C878] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View ↗
                          </a>
                        )}
                      </label>
                    );
                  })}
                </div>

                {confirmedName ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedGifts.size > 0) {
                        setShowGiftConfirm(true);
                      }
                    }}
                    disabled={isSubmitting || selectedGifts.size === 0}
                    className="w-full bg-gradient-to-r from-[#50C878] to-[#3da863] hover:from-[#5dd889] hover:to-[#50C878] text-stone-950 font-sans text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md font-semibold cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting
                      ? "Submitting…"
                      : `Submit Gift Selection (${selectedGifts.size})`}
                  </button>
                ) : (
                  <Link
                    to="/rsvp"
                    className="block text-center w-full bg-stone-800 hover:bg-stone-700 text-[#FFE5B4] font-sans text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all font-semibold"
                  >
                    Confirm RSVP to Pick Gifts →
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Gift Confirmation Modal */}
      {showGiftConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl text-center text-stone-100">
            <div className="mb-3 text-4xl">🎁</div>
            <h3 className="font-serif-romantic text-2xl text-[#FFE5B4] mb-2">
              Confirm Gift Selection
            </h3>
            <p className="text-sm text-stone-300 mb-2">
              Are you sure you want to gift the couple{" "}
              <span className="text-[#50C878] font-semibold">
                {selectedGifts.size > 1 ? "these items" : "this item"}
              </span>
              ?
            </p>
            <p className="text-xs text-stone-400 mb-6">
              Gifting as:{" "}
              <strong className="text-[#FFE5B4]">{confirmedName}</strong>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowGiftConfirm(false)}
                className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs uppercase font-sans font-semibold text-stone-300 transition-colors hover:bg-stone-700 cursor-pointer"
              >
                No, go back
              </button>
              <button
                type="button"
                onClick={() => {
                  const formData = new FormData();
                  formData.append("_action", "selectGifts");
                  formData.append("guestName", confirmedName ?? "");
                  selectedGifts.forEach((id) => formData.append("giftId", id));
                  fetcher.submit(formData, { method: "post" });
                  setShowGiftConfirm(false);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#50C878] to-[#3da863] hover:from-[#5dd889] hover:to-[#50C878] px-4 py-2.5 text-xs uppercase font-sans font-semibold text-stone-950 transition-colors cursor-pointer"
              >
                Yes, confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
