import { useState } from "react";
import { data, Form, useNavigation } from "react-router";
import type { Route } from "./+types/RSVP";
import { createClient } from "~/utils/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RSVP — #TheIVLeague" },
    {
      name: "description",
      content: "Confirm your attendance and browse the gift registry.",
    },
  ];
}

/* ═══════════════════════════════════════════════════════════
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function FloatingHeart({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-rose-300/40 ${className}`}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function FloatingRing({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`text-amber-400/35 ${className}`}
    >
      <circle cx="12" cy="16" r="8" />
      <circle cx="20" cy="16" r="8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function FloatingFlower({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={`text-emerald-300/30 ${className}`}
    >
      <circle cx="16" cy="10" r="5" opacity="0.6" />
      <circle cx="10" cy="16" r="5" opacity="0.5" />
      <circle cx="22" cy="16" r="5" opacity="0.5" />
      <circle cx="16" cy="22" r="5" opacity="0.6" />
      <circle cx="16" cy="16" r="3" className="text-amber-300" />
    </svg>
  );
}

function FloatingRibbon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`text-rose-300/25 ${className}`}
    >
      <path d="M10 5 C15 12, 25 12, 30 5" />
      <path d="M10 5 C12 15, 8 25, 15 35" />
      <path d="M30 5 C28 15, 32 25, 25 35" />
      <circle cx="20" cy="5" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function DecorativeDivider() {
  return (
    <div className="my-6 flex items-center justify-center gap-2">
      <span className="h-px w-10 bg-linear-to-r from-transparent to-emerald-300" />
      <FloatingHeart className="w-3.5 h-3.5 text-rose-400/50" />
      <FloatingFlower className="w-4 h-4 text-emerald-400/40" />
      <FloatingHeart className="w-3.5 h-3.5 text-rose-400/50" />
      <span className="h-px w-10 bg-linear-to-l from-transparent to-emerald-300" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COPY BUTTON COMPONENT
   ═══════════════════════════════════════════════════════════ */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
          : "bg-emerald-50/50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400"
      }`}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg
            className="w-3.5 h-3.5"
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
            className="w-3.5 h-3.5"
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
  );
}

// ---------- Loader ----------
export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createClient(request);

  const [giftsRes, displayTextsRes] = await Promise.all([
    supabase
      .from("gifts")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("DisplayTexts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return data(
    {
      gifts: giftsRes.data ?? [],
      displayTexts: displayTextsRes.data ?? null,
    },
    { headers },
  );
}

// ---------- Action ----------
export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createClient(request);
  const formData = await request.formData();
  const intent = formData.get("_action") as string;

  // --- Confirm Availability ---
  if (intent === "confirmAvailability") {
    const fullName = (formData.get("fullName") as string)?.trim();
    const availability = formData.get("availability") as string;

    if (!fullName) {
      return data(
        {
          intent,
          error: "Please enter your full name.",
          success: false,
          guestName: null,
        },
        { status: 400, headers },
      );
    }

    // Case-insensitive exact match
    const { data: guests } = await supabase
      .from("guests")
      .select("*")
      .ilike("full_name", fullName);

    const guest = guests && guests.length > 0 ? guests[0] : null;

    if (!guest) {
      return data(
        {
          intent,
          error:
            "Sorry, Couldn't find a name that match on our guest list, kindly reach out to the couples for further clarifications.",
          success: false,
          guestName: null,
        },
        { status: 404, headers },
      );
    }

    // Update availability
    await supabase.from("guests").update({ availability }).eq("id", guest.id);

    return data(
      {
        intent,
        error: null,
        success: true,
        guestName: guest.full_name,
      },
      { headers },
    );
  }

  // --- Select Gifts ---
  if (intent === "selectGifts") {
    const guestName = (formData.get("guestName") as string)?.trim();
    const giftIds = formData.getAll("giftId") as string[];

    if (!guestName || giftIds.length === 0) {
      return data(
        {
          intent,
          error: "Please select at least one gift.",
          success: false,
          guestName,
        },
        { status: 400, headers },
      );
    }

    // Update each selected gift
    for (const giftId of giftIds) {
      await supabase
        .from("gifts")
        .update({ chosen_by: guestName })
        .eq("id", giftId)
        .eq("chosen_by", "none"); // only update unclaimed gifts
    }

    return data(
      {
        intent,
        error: null,
        success: true,
        guestName,
        giftSuccess: true,
      },
      { headers },
    );
  }

  return data(
    { intent: null, error: "Unknown action.", success: false, guestName: null },
    { status: 400, headers },
  );
}

// ============================================================
// Component
// ============================================================
export default function RSVP({ loaderData, actionData }: Route.ComponentProps) {
  const { gifts, displayTexts } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Store confirmed guest name in state
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<Set<string>>(new Set());
  const [giftSubmitted, setGiftSubmitted] = useState(false);

  // Update confirmed name from action data
  if (
    actionData?.intent === "confirmAvailability" &&
    actionData.success &&
    actionData.guestName &&
    confirmedName !== actionData.guestName
  ) {
    setConfirmedName(actionData.guestName);
  }

  if (
    actionData?.intent === "selectGifts" &&
    (actionData as any).giftSuccess &&
    !giftSubmitted
  ) {
    setGiftSubmitted(true);
  }

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

  const availableGifts = gifts.filter((g: any) => g.chosen_by === "none");
  const hasAvailableGifts = availableGifts.length > 0;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-emerald-50 via-white to-orange-50 overflow-hidden">
      {/* ════════ FLOATING DECORATIVE ELEMENTS ════════ */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Hearts */}
        <FloatingHeart className="absolute top-[8%] left-[5%] w-6 h-6 animate-[pulse_4s_ease-in-out_infinite]" />
        <FloatingHeart className="absolute top-[22%] right-[8%] w-5 h-5 animate-[pulse_3.5s_ease-in-out_infinite_0.5s]" />
        <FloatingHeart className="absolute bottom-[30%] left-[3%] w-4 h-4 animate-[pulse_5s_ease-in-out_infinite_1s]" />
        <FloatingHeart className="absolute bottom-[15%] right-[6%] w-5 h-5 animate-[pulse_4s_ease-in-out_infinite_1.5s]" />

        {/* Rings */}
        <FloatingRing className="absolute top-[15%] right-[12%] w-10 h-10 animate-[pulse_6s_ease-in-out_infinite_0.8s]" />
        <FloatingRing className="absolute bottom-[25%] left-[8%] w-8 h-8 animate-[pulse_5s_ease-in-out_infinite_2s]" />

        {/* Flowers */}
        <FloatingFlower className="absolute top-[35%] left-[2%] w-8 h-8 animate-[pulse_5s_ease-in-out_infinite_0.3s]" />
        <FloatingFlower className="absolute top-[55%] right-[3%] w-7 h-7 animate-[pulse_4.5s_ease-in-out_infinite_1.2s]" />
        <FloatingFlower className="absolute bottom-[10%] left-[15%] w-6 h-6 animate-[pulse_5.5s_ease-in-out_infinite_0.7s]" />

        {/* Ribbons */}
        <FloatingRibbon className="absolute top-[45%] right-[5%] w-10 h-10 animate-[pulse_6s_ease-in-out_infinite_1s]" />
        <FloatingRibbon className="absolute top-[70%] left-[4%] w-9 h-9 animate-[pulse_5s_ease-in-out_infinite_2.5s]" />
      </div>

      {/* Decorative top border */}
      <div className="h-1.5 bg-linear-to-r from-emerald-600 via-olive-500 to-emerald-700 relative z-10" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <FloatingFlower className="w-5 h-5 text-emerald-400/60" />
            <FloatingHeart className="w-4 h-4 text-rose-400/60" />
            <FloatingFlower className="w-5 h-5 text-emerald-400/60" />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-700">
            You&apos;re Invited
          </p>
          <h1 className="font-serif text-4xl font-bold text-gray-900 sm:text-5xl">
            #TheIVLeague
          </h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-emerald-300" />
            <span className="text-lg text-emerald-600">💍</span>
            <span className="h-px w-12 bg-emerald-300" />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Please confirm your attendance below
          </p>
          <div className="mt-4 inline-flex flex-col items-center gap-1.5 rounded-xl border border-emerald-200/50 bg-white/70 backdrop-blur-sm px-6 py-3 shadow-xs">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>📍</span>
              <span className="font-semibold">Ikeja, Lagos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>📅</span>
              <span className="font-semibold">November 28th, 2026</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <FloatingHeart className="w-3 h-3 text-rose-300/50" />
            <FloatingRing className="w-5 h-5 text-amber-400/40" />
            <FloatingHeart className="w-3 h-3 text-rose-300/50" />
          </div>
        </header>

        {/* ======================== RSVP SECTION ======================== */}
        <section className="mb-8">
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-lg shadow-emerald-100/40">
            <div className="border-b border-emerald-50 bg-linear-to-r from-emerald-50 to-transparent px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  1
                </span>
                Confirm Attendance
                <FloatingFlower className="w-4 h-4 text-emerald-400/50 ml-1" />
              </h2>
            </div>

            <div className="px-6 py-6">
              {/* Success State */}
              {confirmedName ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-center">
                  <div className="mb-2 text-3xl">✅</div>
                  <h3 className="text-lg font-bold text-emerald-800">
                    Thank You, {confirmedName}!
                  </h3>
                  <p className="mt-1 text-sm text-emerald-600">
                    Your availability status has been received by the couple.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <FloatingHeart className="w-3 h-3 text-rose-400/60" />
                    <FloatingRing className="w-4 h-4 text-amber-400/50" />
                    <FloatingHeart className="w-3 h-3 text-rose-400/60" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Error from action */}
                  {actionData?.intent === "confirmAvailability" &&
                    actionData.error && (
                      <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionData.error}
                      </div>
                    )}

                  <Form method="post">
                    <input
                      type="hidden"
                      name="_action"
                      value="confirmAvailability"
                    />

                    <div className="mb-5">
                      <label
                        htmlFor="rsvp-name"
                        className="mb-1.5 block text-sm font-semibold text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        id="rsvp-name"
                        type="text"
                        name="fullName"
                        placeholder="Firstname Surname (e.g. Tunde Adeyemi)"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <p className="mt-1.5 text-xs text-gray-400">
                        Enter your name exactly as it was registered by the
                        couple.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        name="availability"
                        value="Available"
                        disabled={isSubmitting}
                        className="flex-1 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-60"
                      >
                        {isSubmitting ? "Submitting…" : "✓ I'll be there!"}
                      </button>
                      <button
                        type="submit"
                        name="availability"
                        value="Not Available"
                        disabled={isSubmitting}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-60"
                      >
                        {isSubmitting
                          ? "Submitting…"
                          : "Sorry, I can't make it"}
                      </button>
                    </div>
                  </Form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ======================== GIFT SECTION ======================== */}
        <section className="mb-8">
          <div
            className={`overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm shadow-lg transition-all ${
              confirmedName
                ? "border-emerald-100 shadow-emerald-100/40"
                : "pointer-events-none border-gray-200 opacity-50 shadow-gray-100/40"
            }`}
          >
            <div className="border-b border-emerald-50 bg-linear-to-r from-emerald-50 to-transparent px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                    confirmedName ? "bg-emerald-600" : "bg-gray-400"
                  }`}
                >
                  2
                </span>
                Gift Registry
                <span className="text-base ml-1">🎁</span>
                {!confirmedName && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (Confirm attendance first)
                  </span>
                )}
              </h2>
            </div>

            <div className="px-6 py-6">
              {/* Gift submitted success */}
              {giftSubmitted ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-center">
                  <div className="mb-2 text-3xl">🎁</div>
                  <h3 className="text-lg font-bold text-emerald-800">
                    Gift Selection Received!
                  </h3>
                  <p className="mt-1 text-sm text-emerald-600">
                    Thank you for your generous gift selection, {confirmedName}.
                    The couple will be delighted!
                  </p>
                </div>
              ) : !hasAvailableGifts ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  <div className="mb-2 text-2xl">🎁</div>
                  <p>All gifts have been claimed. Thank you!</p>
                </div>
              ) : (
                <>
                  {actionData?.intent === "selectGifts" && actionData.error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {actionData.error}
                    </div>
                  )}

                  {/* Monetization Text from DB */}
                  {displayTexts?.monitization_text && (
                    <div className="mb-5 rounded-xl border border-amber-200/60 bg-amber-50/50 px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FloatingHeart className="w-3.5 h-3.5 text-rose-400/70" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                          A Note from the Couple
                        </span>
                        <FloatingHeart className="w-3.5 h-3.5 text-rose-400/70" />
                      </div>
                      <p className="text-sm text-amber-800 italic leading-relaxed">
                        {displayTexts.monitization_text}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    {/* Bank Name */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Bank
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {displayTexts.bank_name}
                        </p>
                      </div>
                      <span className="text-xl">🏦</span>
                    </div>

                    <div className="h-px bg-emerald-200/40" />

                    {/* Account Number */}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Account Number
                      </span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-base font-semibold text-gray-900 tracking-wide font-mono">
                          {displayTexts.account_number}
                        </p>
                        {displayTexts.account_number && (
                          <CopyButton text={displayTexts.account_number} />
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-emerald-200/40" />

                    {/* Account Name */}
                    {displayTexts.account_name && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Account Name
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {displayTexts.account_name}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="my-4 font-medium text-gray-500 text-center ">
                    Or go ahead and Select the gift(s) you&apos;d like to give
                    the couple, then click submit.
                  </p>

                  <Form
                    method="post"
                    onSubmit={() => setSelectedGifts(new Set())}
                  >
                    <input type="hidden" name="_action" value="selectGifts" />
                    <input
                      type="hidden"
                      name="guestName"
                      value={confirmedName ?? ""}
                    />

                    <div className="mb-5 space-y-2.5">
                      {availableGifts.map((gift: any) => {
                        const isSelected = selectedGifts.has(gift.id);
                        return (
                          <label
                            key={gift.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="giftId"
                              value={gift.id}
                              checked={isSelected}
                              onChange={() => toggleGift(gift.id)}
                              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {gift.gift_name}
                              </span>
                            </div>
                            <a
                              href={gift.purchase_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-emerald-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View ↗
                            </a>
                          </label>
                        );
                      })}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || selectedGifts.size === 0}
                      className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Submitting…"
                        : `Submit Gift Selection (${selectedGifts.size})`}
                    </button>
                  </Form>

                  {/* Jumia Pickup Info */}
                  {displayTexts?.jumia_pickup && (
                    <>
                      <DecorativeDivider />
                      <div className="rounded-xl border border-orange-200/60 bg-orange-50/40 px-5 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">📦</span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                            Jumia Pickup Location
                          </span>
                        </div>
                        <p className="text-sm text-orange-800 leading-relaxed">
                          {displayTexts.jumia_pickup}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ======================== BANK DETAILS SECTION ======================== */}
        {/* {displayTexts?.bank_name && (
          <section className="mb-8">
            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-lg shadow-emerald-100/40">
              <div className="border-b border-emerald-50 bg-linear-to-r from-emerald-50 to-transparent px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    3
                  </span>
                  Bank Transfer
                  <FloatingHeart className="w-4 h-4 text-rose-400/50 ml-1" />
                </h2>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm text-gray-500 mb-5 text-center">
                  You can also send a gift via bank transfer to the account
                  below.
                </p>
              </div>
            </div>
          </section>
        )} */}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FloatingFlower className="w-4 h-4 text-emerald-400/50" />
            <FloatingRibbon className="w-5 h-5 text-rose-400/40" />
            <FloatingFlower className="w-4 h-4 text-emerald-400/50" />
          </div>
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-emerald-200" />
            <span className="text-sm text-emerald-400">♥</span>
            <span className="h-px w-8 bg-emerald-200" />
          </div>
          {/* <p className="mt-3 text-xs text-gray-400">With love, The Couple</p> */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <FloatingHeart className="w-2.5 h-2.5 text-rose-300/50" />
            <FloatingHeart className="w-3 h-3 text-rose-400/50" />
            <FloatingHeart className="w-2.5 h-2.5 text-rose-300/50" />
          </div>
        </footer>
      </div>
    </div>
  );
}
