import { useEffect, useRef, useState } from "react";
import { data, Form, Link, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/admin";
import { createClient } from "~/utils/supabase.server";
import "../styles/admin.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Portal — #TheIVLeague" },
    {
      name: "description",
      content: "Manage Guest, Gift and check ins for #TheIVLeague",
    },
  ];
}

// ---------- Helpers ----------
function generateUniqueCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

// ---------- Loader ----------
export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data(
      {
        authenticated: false as const,
        guests: [],
        totalGuestStats: {
          total: 0,
          checkedIn: 0,
          available: 0,
          unavailable: 0,
          pending: 0,
        },
        gifts: [],
        displayTexts: null,
        error: null,
      },
      { headers },
    );
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const filter = url.searchParams.get("filter")?.trim() || "";
  const sort = url.searchParams.get("sort")?.trim() || "";

  // Query for guests with search, filter, and sort directly from DB
  let guestsQuery = supabase.from("guests").select("*");

  if (search) {
    guestsQuery = guestsQuery.ilike("full_name", `%${search}%`);
  }

  if (
    filter &&
    ["Available", "No response yet", "Not Available"].includes(filter)
  ) {
    guestsQuery = guestsQuery.eq("availability", filter);
  }

  if (sort === "asc") {
    guestsQuery = guestsQuery.order("full_name", { ascending: true });
  } else if (sort === "desc") {
    guestsQuery = guestsQuery.order("full_name", { ascending: false });
  } else {
    guestsQuery = guestsQuery.order("created_at", { ascending: false });
  }

  const [statsRes, guestsRes, giftsRes, displayTextsRes] = await Promise.all([
    supabase.from("guests").select("availability, checked_in"),
    guestsQuery,
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

  const allGuests = statsRes.data ?? [];
  const totalGuestStats = {
    total: allGuests.length,
    checkedIn: allGuests.filter((g: any) => g.checked_in).length,
    available: allGuests.filter((g: any) => g.availability === "Available").length,
    unavailable: allGuests.filter((g: any) => g.availability === "Not Available").length,
    pending: allGuests.filter((g: any) => g.availability === "No response yet").length,
  };

  return data(
    {
      authenticated: true as const,
      guests: guestsRes.data ?? [],
      totalGuestStats,
      gifts: giftsRes.data ?? [],
      displayTexts: displayTextsRes.data ?? null,
      error: null,
    },
    { headers },
  );
}

// ---------- Action ----------
export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createClient(request);
  const formData = await request.formData();
  const intent = formData.get("_action") as string;

  // --- Login ---
  if (intent === "login") {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return data(
        { error: "Email and password are required.", intent },
        { status: 400, headers },
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return data({ error: error.message, intent }, { status: 401, headers });
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Logout ---
  if (intent === "logout") {
    await supabase.auth.signOut();
    return data({ error: null, intent }, { headers });
  }

  // --- Add Guest ---
  if (intent === "addGuest") {
    const surname = (formData.get("surname") as string)?.trim();
    const firstName = (formData.get("firstName") as string)?.trim();

    if (!surname || !firstName) {
      return data(
        { error: "Both surname and first name are required.", intent },
        { status: 400, headers },
      );
    }

    const fullName = `${firstName} ${surname}`;

    // Generate a unique 5-digit code, retry if collision
    let uniqueCode = generateUniqueCode();
    let retries = 0;
    while (retries < 10) {
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .eq("unique_code", uniqueCode)
        .single();
      if (!existing) break;
      uniqueCode = generateUniqueCode();
      retries++;
    }

    const { error } = await supabase.from("guests").insert({
      full_name: fullName,
      unique_code: uniqueCode,
      availability: "No response yet",
      checked_in: false,
    });

    if (error) {
      return data(
        { error: `Failed to add guest: ${error.message}`, intent },
        { status: 500, headers },
      );
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Delete Guest ---
  if (intent === "deleteGuest") {
    const guestId = formData.get("guestId") as string;
    const { error } = await supabase.from("guests").delete().eq("id", guestId);

    if (error) {
      return data(
        { error: `Failed to delete guest: ${error.message}`, intent },
        { status: 500, headers },
      );
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Edit Guest ---
  if (intent === "editGuest") {
    const guestId = formData.get("guestId") as string;
    const newName = (formData.get("newName") as string)?.trim();

    if (!newName) {
      return data(
        { error: "Guest name cannot be empty.", intent },
        { status: 400, headers },
      );
    }

    const { error } = await supabase
      .from("guests")
      .update({ full_name: newName })
      .eq("id", guestId);

    if (error) {
      return data(
        { error: `Failed to update guest: ${error.message}`, intent },
        { status: 500, headers },
      );
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Add Gift ---
  if (intent === "addGift") {
    const giftName = (formData.get("giftName") as string)?.trim();
    const purchaseLink =
      (formData.get("purchaseLink") as string)?.trim() || "#";

    if (!giftName) {
      return data(
        { error: "Gift name is required.", intent },
        { status: 400, headers },
      );
    }

    const { error } = await supabase.from("gifts").insert({
      gift_name: giftName,
      purchase_link: purchaseLink,
      chosen_by: "none",
    });

    if (error) {
      return data(
        { error: `Failed to add gift: ${error.message}`, intent },
        { status: 500, headers },
      );
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Add / Update Display Text ---
  if (intent === "addDisplayText") {
    const monitizationText =
      (formData.get("monitizationText") as string)?.trim() || "";
    const gifting_guide =
      (formData.get("giftingGuide") as string)?.trim() || "";
    const JumiaPickup = (formData.get("jumiaPickup") as string)?.trim() || "";

    const bankName = (formData.get("bankName") as string)?.trim();
    const accountName = (formData.get("accountName") as string)?.trim();
    const accountNumber = (formData.get("accountNumber") as string)?.trim();
    const existingId =
      (formData.get("displayTextId") as string)?.trim() || null;

    const payload = {
      jumia_pickup: JumiaPickup,
      gifting_guide: gifting_guide,
      monitization_text: monitizationText,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
    };

    console.log(payload);

    let error;
    if (existingId) {
      // Update existing row
      ({ error } = await supabase
        .from("DisplayTexts")
        .update(payload)
        .eq("id", existingId));
    } else {
      // Insert new row
      ({ error } = await supabase.from("DisplayTexts").insert(payload));
    }

    if (error) {
      return data(
        { error: `Failed to save text: ${error.message}`, intent },
        { status: 500, headers },
      );
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Delete Gift ---
  if (intent === "deleteGift") {
    const giftId = formData.get("giftId") as string;
    const { error } = await supabase.from("gifts").delete().eq("id", giftId);

    if (error) {
      return data(
        { error: `Failed to delete gift: ${error.message}`, intent },
        { status: 500, headers },
      );
    }

    return data({ error: null, intent }, { headers });
  }

  // --- Check In Guest ---
  // if (intent === "checkInGuest") {
  //   const guestId = formData.get("guestId") as string;

  //   const { error } = await supabase
  //     .from("guests")
  //     .update({ checked_in: true })
  //     .eq("id", guestId);

  //   if (error) {
  //     return data(
  //       { error: `Failed to check in guest: ${error.message}`, intent },
  //       { status: 500, headers },
  //     );
  //   }

  //   return data({ error: null, intent }, { headers });
  // }

  return data(
    { error: "Unknown action.", intent: null },
    { status: 400, headers },
  );
}

// ============================================================
// Component
// ============================================================
export default function Admin({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { authenticated, guests, gifts, displayTexts, totalGuestStats } =
    loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const currentFilter = searchParams.get("filter") || "";
  const currentSort = searchParams.get("sort") || "";

  const [searchInputValue, setSearchInputValue] = useState(currentSearch);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInputValue(currentSearch);
  }, [currentSearch]);

  // Real-time search as the admin types (debounced by 250ms)
  useEffect(() => {
    if (searchInputValue.trim() === currentSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      const trimmed = searchInputValue.trim();
      if (trimmed) {
        newParams.set("search", trimmed);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams, { preventScrollReset: true, replace: true });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInputValue, currentSearch, searchParams, setSearchParams]);

  // Click outside to close filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    setSearchParams(newParams, { preventScrollReset: true, replace: true });
  };

  const handleClearSearch = () => {
    setSearchInputValue("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams, { preventScrollReset: true, replace: true });
  };

  const handleFilterSelect = (filterValue: string) => {
    setIsFilterDropdownOpen(false);
    updateQueryParams({ filter: filterValue || null });
  };

  const handleSortToggle = () => {
    let nextSort: string | null = null;
    if (!currentSort) {
      nextSort = "asc";
    } else if (currentSort === "asc") {
      nextSort = "desc";
    } else {
      nextSort = null;
    }
    updateQueryParams({ sort: nextSort });
  };

  const handleResetAllFilters = () => {
    setSearchInputValue("");
    updateQueryParams({ search: null, filter: null, sort: null });
  };

  const hasActiveFilters = Boolean(
    currentSearch || currentFilter || currentSort,
  );

  const [activeTab, setActiveTab] = useState<
    "guests" | "gifts" | "displayTexts"
  >("guests");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // --- Check-in search state ---
  const [checkinQuery, setCheckinQuery] = useState("");
  const [checkinResult, setCheckinResult] = useState<any | null>(null);
  const [checkinSearched, setCheckinSearched] = useState(false);

  // function searchGuest() {
  //   const q = checkinQuery.trim().toLowerCase();
  //   if (!q) {
  //     setCheckinResult(null);
  //     setCheckinSearched(false);
  //     return;
  //   }
  //   const found = guests.find(
  //     (g: any) =>
  //       g.full_name.toLowerCase() === q ||
  //       g.unique_code === q.replace(/\s/g, ""),
  //   );
  //   setCheckinResult(found || null);
  //   setCheckinSearched(true);
  // }

  // function resetCheckin() {
  //   setCheckinQuery("");
  //   setCheckinResult(null);
  //   setCheckinSearched(false);
  // }

  // --- Confirmation modal state ---
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });
  const pendingFormRef = useRef<HTMLFormElement | null>(null);

  function requestDelete(
    form: HTMLFormElement,
    itemName: string,
    itemType: "guest" | "gift",
  ) {
    pendingFormRef.current = form;
    setConfirmModal({
      open: true,
      title: itemType === "guest" ? "Delete Guest" : "Delete Gift",
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    });
  }

  function handleConfirm() {
    if (pendingFormRef.current) {
      pendingFormRef.current.requestSubmit();
    }
    setConfirmModal({ open: false, title: "", message: "" });
    pendingFormRef.current = null;
  }

  function handleCancel() {
    setConfirmModal({ open: false, title: "", message: "" });
    pendingFormRef.current = null;
  }

  // ---------- Login Screen ----------
  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="login-wrapper">
          <div className="login-card">
            <h1 className="text-center">#TheIVLeague Admin Portal</h1>
            <p className="login-subtitle text-center ">
              Sign in to manage guests &amp; gifts
            </p>

            {actionData?.error && actionData.intent === "login" && (
              <div className="login-error">{actionData.error}</div>
            )}

            <Form method="post">
              <input type="hidden" name="_action" value="login" />
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="form-input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Dashboard Stats ----------
  const totalGuests = totalGuestStats?.total ?? guests.length;
  const checkedIn =
    totalGuestStats?.checkedIn ??
    guests.filter((g: any) => g.checked_in).length;
  const available =
    totalGuestStats?.available ??
    guests.filter((g: any) => g.availability === "Available").length;
  const unavailable =
    totalGuestStats?.unavailable ??
    guests.filter((g: any) => g.availability === "Not Available").length;
  const pending =
    totalGuestStats?.pending ??
    guests.filter((g: any) => g.availability === "No response yet").length;
  const totalGifts = gifts.length;
  const chosenGifts = gifts.filter((g: any) => g.chosen_by !== "none").length;

  function startEditing(guestId: string, currentName: string) {
    setEditingGuestId(guestId);
    setEditName(currentName);
  }

  function cancelEditing() {
    setEditingGuestId(null);
    setEditName("");
  }

  function getAvailabilityBadge(status: string) {
    switch (status) {
      case "Available":
        return <span className="badge badge-available">Available</span>;
      case "Not Available":
        return <span className="badge badge-unavailable">Not Available</span>;
      default:
        return <span className="badge badge-pending">No response yet</span>;
    }
  }

  // ---------- Dashboard ----------
  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1 className="">
            #TheIVLeague
            <span>Guest &amp; Gift Management</span>
          </h1>
        </div>
        <div className="flex gap-2 items-center justify-center ">
          <Link to="/RSVP" className="btn btn-ghost btn-sm ">
            RSVP
          </Link>
          <Form method="post">
            <input type="hidden" name="_action" value="logout" />
            <button type="submit" className="btn btn-ghost btn-sm">
              Logout
            </button>
          </Form>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tab-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === "guests" ? "active" : ""}`}
          onClick={() => setActiveTab("guests")}
        >
          Guests ({totalGuests})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "gifts" ? "active" : ""}`}
          onClick={() => setActiveTab("gifts")}
        >
          Gifts ({totalGifts})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "displayTexts" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("displayTexts");
            // resetCheckin();
          }}
        >
          Display Texts
        </button>
      </nav>

      <div className="admin-content">
        {/* Action Error Banner */}
        {actionData?.error && actionData.intent !== "login" && (
          <div className="login-error" style={{ marginBottom: "1rem" }}>
            {actionData.error}
          </div>
        )}

        {/* ======================== GUESTS TAB ======================== */}
        {activeTab === "guests" && (
          <>
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{totalGuests}</div>
                <div className="stat-label">Total Guests</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{available}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{unavailable}</div>
                <div className="stat-label">Not Available</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{pending}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>

            {/* Add Guest */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Add New Guest</h2>
              </div>
              <div className="section-card-body">
                <Form method="post" className="add-form">
                  <input type="hidden" name="_action" value="addGuest" />
                  <div className="form-group">
                    <label htmlFor="add-firstname">First Name</label>
                    <input
                      id="add-firstname"
                      className="form-input"
                      type="text"
                      name="firstName"
                      placeholder="e.g. Tunde"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="add-surname">Surname</label>
                    <input
                      id="add-surname"
                      className="form-input"
                      type="text"
                      name="surname"
                      placeholder="e.g. Adeyemi"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding…" : "+ Add Guest"}
                  </button>
                </Form>
              </div>
            </div>

            {/* Guest Table */}
            <div className="section-card">
              <div className="section-card-header">
                <div className="guest-list-title-group">
                  <h2>Guest List</h2>
                  <span className="guest-count-badge">
                    {hasActiveFilters
                      ? `${guests.length} of ${totalGuests} guests`
                      : `${guests.length} guests`}
                  </span>
                </div>
              </div>

              {/* Toolbar: Real-time Search, Availability Filter, Reset */}
              <div className="table-toolbar">
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search attendee by name..."
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                  />
                  {searchInputValue && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={handleClearSearch}
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter button with 3 options: "Available", "No response yet", "Not Available" */}
                <div
                  className="filter-dropdown-container"
                  ref={filterDropdownRef}
                >
                  <button
                    type="button"
                    className={`btn btn-sm ${currentFilter ? "btn-filter-active" : "btn-ghost"}`}
                    onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                    aria-haspopup="true"
                    aria-expanded={isFilterDropdownOpen}
                  >
                    <svg
                      className="filter-icon"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>
                      {currentFilter
                        ? `Filter: ${currentFilter}`
                        : "Filter Availability"}
                    </span>
                    <span className="dropdown-caret">▾</span>
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="filter-dropdown-menu">
                      <div className="filter-dropdown-header">
                        Filter by Availability
                      </div>
                      <button
                        type="button"
                        className={`filter-dropdown-item ${!currentFilter ? "active" : ""}`}
                        onClick={() => handleFilterSelect("")}
                      >
                        <span>All Guests</span>
                        {!currentFilter && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`filter-dropdown-item ${currentFilter === "Available" ? "active" : ""}`}
                        onClick={() => handleFilterSelect("Available")}
                      >
                        <span className="badge badge-available">
                          Available
                        </span>
                        {currentFilter === "Available" && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`filter-dropdown-item ${currentFilter === "No response yet" ? "active" : ""}`}
                        onClick={() => handleFilterSelect("No response yet")}
                      >
                        <span className="badge badge-pending">
                          No response yet
                        </span>
                        {currentFilter === "No response yet" && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`filter-dropdown-item ${currentFilter === "Not Available" ? "active" : ""}`}
                        onClick={() => handleFilterSelect("Not Available")}
                      >
                        <span className="badge badge-unavailable">
                          Not Available
                        </span>
                        {currentFilter === "Not Available" && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm reset-filters-btn"
                    onClick={handleResetAllFilters}
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="data-table-wrapper">
                {guests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      {hasActiveFilters ? "🔍" : "👥"}
                    </div>
                    <p>
                      {hasActiveFilters
                        ? "No guests found matching your current search or filter."
                        : "No guests added yet. Add your first guest above."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: "0.75rem" }}
                        onClick={handleResetAllFilters}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          <div className="th-sortable-content">
                            <span>Full Name</span>
                            <button
                              type="button"
                              className={`column-sort-button ${currentSort ? "active" : ""}`}
                              onClick={handleSortToggle}
                              aria-label={
                                currentSort === "asc"
                                  ? "Sorted Ascending. Click for Descending"
                                  : currentSort === "desc"
                                  ? "Sorted Descending. Click to reset order"
                                  : "Sort by Name"
                              }
                              title={
                                currentSort === "asc"
                                  ? "Sorted Ascending. Click for Descending"
                                  : currentSort === "desc"
                                  ? "Sorted Descending. Click to reset order"
                                  : "Sort by Name"
                              }
                            >
                              {currentSort === "asc" ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 19V5" />
                                  <path d="m5 12 7-7 7 7" />
                                </svg>
                              ) : currentSort === "desc" ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 5v14" />
                                  <path d="m19 12-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m7 15 5 5 5-5" />
                                  <path d="m7 9 5-5 5 5" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </th>
                        <th>Code</th>
                        <th>
                          Availability
                          {currentFilter && (
                            <span className="th-filter-tag">
                              {" "}
                              ({currentFilter})
                            </span>
                          )}
                        </th>
                        <th>Checked In</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((guest: any) => (
                        <tr key={guest.id}>
                          <td>
                            {editingGuestId === guest.id ? (
                              <Form
                                method="post"
                                className="edit-inline"
                                onSubmit={() => cancelEditing()}
                              >
                                <input
                                  type="hidden"
                                  name="_action"
                                  value="editGuest"
                                />
                                <input
                                  type="hidden"
                                  name="guestId"
                                  value={guest.id}
                                />
                                <input
                                  className="form-input"
                                  type="text"
                                  name="newName"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  required
                                />
                                <button
                                  type="submit"
                                  className="btn btn-success btn-sm"
                                  disabled={isSubmitting}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </button>
                              </Form>
                            ) : (
                              <strong>{guest.full_name}</strong>
                            )}
                          </td>
                          <td>
                            <code>{guest.unique_code}</code>
                          </td>
                          <td>{getAvailabilityBadge(guest.availability)}</td>
                          <td>
                            {guest.checked_in ? (
                              <span className="checkin-yes">✓ Yes</span>
                            ) : (
                              <span className="checkin-no">✗ No</span>
                            )}
                          </td>
                          <td>
                            <div className="table-actions">
                              {editingGuestId !== guest.id && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() =>
                                    startEditing(guest.id, guest.full_name)
                                  }
                                >
                                  Edit
                                </button>
                              )}
                              <Form method="post" style={{ display: "inline" }}>
                                <input
                                  type="hidden"
                                  name="_action"
                                  value="deleteGuest"
                                />
                                <input
                                  type="hidden"
                                  name="guestId"
                                  value={guest.id}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  disabled={isSubmitting}
                                  onClick={(e) => {
                                    const form = (
                                      e.target as HTMLElement
                                    ).closest("form");
                                    if (form)
                                      requestDelete(
                                        form,
                                        guest.full_name,
                                        "guest",
                                      );
                                  }}
                                >
                                  Delete
                                </button>
                              </Form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================== GIFTS TAB ======================== */}
        {activeTab === "gifts" && (
          <>
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{totalGifts}</div>
                <div className="stat-label">Total Gifts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{chosenGifts}</div>
                <div className="stat-label">Chosen</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalGifts - chosenGifts}</div>
                <div className="stat-label">Unclaimed</div>
              </div>
            </div>

            {/* Add Gift */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Add New Gift</h2>
              </div>
              <div className="section-card-body">
                <Form method="post" className="add-form">
                  <input type="hidden" name="_action" value="addGift" />
                  <div className="form-group">
                    <label htmlFor="add-gift-name">Gift Name</label>
                    <input
                      id="add-gift-name"
                      className="form-input"
                      type="text"
                      name="giftName"
                      placeholder="e.g. Dinner Set"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="add-purchase-link">Purchase Link</label>
                    <input
                      id="add-purchase-link"
                      className="form-input"
                      type="url"
                      name="purchaseLink"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding…" : "+ Add Gift"}
                  </button>
                </Form>
              </div>
            </div>

            {/* Gift Table */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Gift Inventory</h2>
              </div>
              <div className="data-table-wrapper">
                {gifts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎁</div>
                    <p>No gifts added yet. Add your first gift above.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Gift Name</th>
                        <th>Purchase Link</th>
                        <th>Chosen By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gifts.map((gift: any) => (
                        <tr key={gift.id}>
                          <td>
                            <strong>{gift.gift_name}</strong>
                          </td>
                          <td>
                            <a
                              href={gift.purchase_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="purchase-link"
                            >
                              View Link ↗
                            </a>
                          </td>
                          <td>
                            {gift.chosen_by === "none" ? (
                              <span className="badge badge-none">
                                Unclaimed
                              </span>
                            ) : (
                              <span className="badge badge-chosen">
                                {gift.chosen_by}
                              </span>
                            )}
                          </td>
                          <td>
                            <Form method="post" style={{ display: "inline" }}>
                              <input
                                type="hidden"
                                name="_action"
                                value="deleteGift"
                              />
                              <input
                                type="hidden"
                                name="giftId"
                                value={gift.id}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                disabled={isSubmitting}
                                onClick={(e) => {
                                  const form = (
                                    e.target as HTMLElement
                                  ).closest("form");
                                  if (form)
                                    requestDelete(form, gift.gift_name, "gift");
                                }}
                              >
                                Delete
                              </button>
                            </Form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================== DISPLAY TEXTS TAB ======================== */}
        {activeTab === "displayTexts" && (
          <>
            {/* Hero Section */}
            <div className="section-card">
              <div className="section-card-header">
                {/* <h2>Hero Section</h2> */}
              </div>
              <div className="section-card-body">
                <Form method="post" className="add-form">
                  <input type="hidden" name="_action" value="addDisplayText" />
                  {displayTexts?.id && (
                    <input
                      type="hidden"
                      name="displayTextId"
                      value={displayTexts.id}
                    />
                  )}
                  <div className="flex w-full justify-between flex-col sm:flex-row gap-7 ">
                    <div className="form-group w-full">
                      <label htmlFor="monitizationText">
                        Monitization Text
                      </label>
                      <textarea
                        id="monitizationText"
                        className="form-input"
                        name="monitizationText"
                        placeholder="We appriciate your effort..."
                        defaultValue={displayTexts?.monitization_text ?? ""}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label htmlFor="giftingGuide">Gift Order Guide</label>
                      <textarea
                        id="giftingGuide"
                        className="form-input"
                        name="giftingGuide"
                        placeholder="1, Acme Road, Ogba, Ikeja"
                        defaultValue={displayTexts?.gifting_guide ?? ""}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label htmlFor="jumiaPickup">
                        Jumai Pick up Location
                      </label>
                      <textarea
                        id="jumiaPickup"
                        className="form-input"
                        name="jumiaPickup"
                        placeholder="1, Acme Road, Ogba, Ikeja"
                        defaultValue={displayTexts?.jumia_pickup ?? ""}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex w-full justify-between flex-col sm:flex-row gap-7 ">
                    <div className="form-group w-full">
                      <label htmlFor="bankName">Bank Name</label>
                      <input
                        id="bankName"
                        className="form-input"
                        type="text"
                        name="bankName"
                        placeholder="Gtbank"
                        defaultValue={displayTexts?.bank_name ?? ""}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="accountNumber">Account Number</label>
                      <input
                        id="accountNumber"
                        type="number"
                        className="form-input"
                        name="accountNumber"
                        placeholder="1234567890"
                        defaultValue={displayTexts?.account_number ?? ""}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="accountName">Account Name</label>
                      <input
                        id="accountName"
                        type="text"
                        className="form-input"
                        name="accountName"
                        placeholder="Adeleye Oreoluwa"
                        defaultValue={displayTexts?.account_name ?? ""}
                        required
                      />
                    </div>
                  </div>

                  {actionData?.intent === "addDisplayText" &&
                    !actionData?.error && (
                      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        ✅ Display texts updated successfully!
                      </div>
                    )}
                  {actionData?.intent === "addDisplayText" &&
                    actionData?.error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {actionData.error}
                      </div>
                    )}

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving…"
                      : displayTexts?.id
                        ? "✓ Update Text"
                        : "+ Add Text"}
                  </button>
                </Form>
              </div>
            </div>
          </>
        )}

        {/* ======================== CHECK IN TAB ======================== */}
        {/* {activeTab === "checkin" && ( */}
        {/* <> */}
        {/* Stats */}
        {/* <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{checkedIn}</div>
                <div className="stat-label">Checked In</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalGuests - checkedIn}</div>
                <div className="stat-label">Not Checked In</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalGuests}</div>
                <div className="stat-label">Total Guests</div>
              </div>
            </div> */}

        {/* Search */}
        {/* <div className="section-card">
              <div className="section-card-header">
                <h2>Search Guest</h2>
              </div>
              <div className="section-card-body">
                <div className="checkin-search-form">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="checkin-search">
                      Full Name or Unique Code
                    </label>
                    <input
                      id="checkin-search"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Adeyemi Tunde or 48271"
                      value={checkinQuery}
                      onChange={(e) => setCheckinQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchGuest();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={searchGuest}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div> */}

        {/* Search Result */}
        {/* {checkinSearched && (
              <div className="section-card">
                <div className="section-card-header">
                  <h2>Result</h2>
                </div>
                <div className="section-card-body">
                  {checkinResult ? (
                    <div className="checkin-result-card">
                      <div className="checkin-result-info">
                        <div className="checkin-result-name">
                          {checkinResult.full_name}
                        </div>
                        <div className="checkin-result-details">
                          <span>
                            Code: <code>{checkinResult.unique_code}</code>
                          </span>
                          <span className="checkin-detail-sep">•</span>
                          {getAvailabilityBadge(checkinResult.availability)}
                          <span className="checkin-detail-sep">•</span>
                          {checkinResult.checked_in ? (
                            <span className="badge badge-available">
                              Already Checked In
                            </span>
                          ) : (
                            <span className="badge badge-pending">
                              Not Checked In
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="checkin-result-actions">
                        {checkinResult.checked_in ? (
                          <div className="checkin-already">
                            <span className="checkin-yes">✓</span> This guest is
                            already checked in.
                          </div>
                        ) : (
                          <Form method="post" onSubmit={() => resetCheckin()}>
                            <input
                              type="hidden"
                              name="_action"
                              value="checkInGuest"
                            />
                            <input
                              type="hidden"
                              name="guestId"
                              value={checkinResult.id}
                            />
                            <div className="checkin-action-btns">
                              <button
                                type="submit"
                                className="btn btn-success"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Checking in…" : "✓ Check In"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={resetCheckin}
                              >
                                Cancel
                              </button>
                            </div>
                          </Form>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <p>
                        No guest found matching "<strong>{checkinQuery}</strong>
                        ". Check the name or code and try again.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )} */}
        {/* </> */}
        {/* )} */}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
