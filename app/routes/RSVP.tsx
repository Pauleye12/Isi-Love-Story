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

// ---------- Loader ----------
export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createClient(request);

  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .order("created_at", { ascending: false });

  return data({ gifts: gifts ?? [] }, { headers });
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
    await supabase
      .from("guests")
      .update({ availability })
      .eq("id", guest.id);

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
export default function RSVP({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { gifts } = loaderData;
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Decorative top border */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-olive-500 to-emerald-700" />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Header */}
        <header className="mb-10 text-center">
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
        </header>

        {/* ======================== RSVP SECTION ======================== */}
        <section className="mb-8">
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/40">
            <div className="border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-transparent px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  1
                </span>
                Confirm Attendance
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
                        placeholder="Surname Firstname (e.g. Adeyemi Tunde)"
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
        <section>
          <div
            className={`overflow-hidden rounded-2xl border bg-white shadow-lg transition-all ${
              confirmedName
                ? "border-emerald-100 shadow-emerald-100/40"
                : "pointer-events-none border-gray-200 opacity-50 shadow-gray-100/40"
            }`}
          >
            <div className="border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-transparent px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                    confirmedName ? "bg-emerald-600" : "bg-gray-400"
                  }`}
                >
                  2
                </span>
                Gift Registry
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
                    Thank you for your generous gift selection,{" "}
                    {confirmedName}. The couple will be delighted!
                  </p>
                </div>
              ) : !hasAvailableGifts ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  <div className="mb-2 text-2xl">🎁</div>
                  <p>All gifts have been claimed. Thank you!</p>
                </div>
              ) : (
                <>
                  {actionData?.intent === "selectGifts" &&
                    actionData.error && (
                      <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionData.error}
                      </div>
                    )}

                  <p className="mb-4 text-sm text-gray-500">
                    Select the gift(s) you&apos;d like to give the couple,
                    then click submit.
                  </p>

                  <Form method="post" onSubmit={() => setSelectedGifts(new Set())}>
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
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-emerald-200" />
            <span className="text-sm text-emerald-400">♥</span>
            <span className="h-px w-8 bg-emerald-200" />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            With love, The Couple
          </p>
        </footer>
      </div>
    </div>
  );
}
