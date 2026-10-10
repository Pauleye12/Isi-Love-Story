import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   WEDDING INVITATION COMPONENT
   ═══════════════════════════════════════════════════════════
   Renders the IVBg.png invitation with the guest's name
   overlaid at the bottom of the front (top) card.

   Usage:
     <WeddingInvitation guestName="John Doe" />
   ═══════════════════════════════════════════════════════════ */

interface WeddingInvitationProps {
  guestName: string;
}

export default function WeddingInvitation({
  guestName,
}: WeddingInvitationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /* ── Generate the personalised invitation ─────────────── */
  const generateInvitation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Match canvas to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original invitation image
      ctx.drawImage(img, 0, 0);

      /* ── Front card: Guest name placement ─────────────
         The image has two cards stacked vertically.
         The front card (ACCESS CARD) occupies the top ~46%.
         We place the guest name near the bottom of the front card.
      ──────────────────────────────────────────────────── */
      const frontCardBottom = img.height * 0.44;
      const nameY = frontCardBottom;
      const nameCenterX = img.width / 2 + img.width * 0.15;

      // Dynamically scale font size based on image width
      const baseFontSize = Math.round(img.width * 0.03);
      const fontSize = Math.max(12, Math.min(baseFontSize, 32));

      // Draw text with elegant styling
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Subtle shadow for depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Guest name in a bold serif font matching "BRAVA EVENT CENTER" style
      ctx.font = `bold ${fontSize}px "Cinzel", "Playfair Display", "Georgia", serif`;
      ctx.fillStyle = "#000000";

      ctx.fillText(guestName, nameCenterX, nameY);

      ctx.restore();

      /* ── Back card: "(Admits One)" placement ───────────
         The back card (bottom card) has "STRICTLY BY INVITATION"
         near the bottom. We place "(Admits One)" just below it,
         centered horizontally at the bottom center of the card.
      ──────────────────────────────────────────────────── */
      const admitsCenterX = img.width / 2;
      const admitsY = img.height * 0.87;

      const baseAdmitsFontSize = Math.round(img.width * 0.015);
      const admitsFontSize = Math.max(22, Math.min(baseAdmitsFontSize, 20));

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.font = `bold ${admitsFontSize}px "Cinzel", "Playfair Display", "Georgia", serif`;
      ctx.fillStyle = "#000000";

      ctx.fillText("Admits One", admitsCenterX, admitsY);

      ctx.restore();

      // Export the canvas as a data URL for preview / download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      setImageDataUrl(dataUrl);
      setIsLoading(false);
    };

    img.onerror = () => {
      console.error("Failed to load invitation background image.");
      setHasError(true);
      setIsLoading(false);
    };

    img.src = "/IV.jpeg";
  }, [guestName]);

  useEffect(() => {
    generateInvitation();
  }, [generateInvitation]);

  /* ── Download handler ─────────────────────────────────── */
  const handleDownload = () => {
    if (!imageDataUrl) return;

    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `TheIVLeague-Invitation-${guestName.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Close modal on Escape ────────────────────────────── */
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  /* ── Error state ──────────────────────────────────────── */
  if (hasError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center">
        <p className="text-sm text-red-600">
          Unable to generate your invitation. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Hidden canvas used for image generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ═══════ INLINE PREVIEW ═══════ */}
      <div
        className="invitation-wrapper"
        style={{
          marginTop: "1.5rem",
          animation: "invitationFadeIn 0.8s ease-out both",
        }}
      >
        {/* Header label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              height: "1px",
              width: "2rem",
              background: "linear-gradient(to right, transparent, #6ee7b7)",
            }}
          />
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              color: "#047857",
            }}
          >
            ✉ Your Personalised Invitation
          </span>
          <span
            style={{
              height: "1px",
              width: "2rem",
              background: "linear-gradient(to left, transparent, #6ee7b7)",
            }}
          />
        </div>

        {/* Preview card */}
        <div
          style={{
            position: "relative",
            borderRadius: "1rem",
            overflow: "hidden",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            boxShadow:
              "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            background: "white",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.01)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 20px 40px -10px rgba(16, 185, 129, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
          }}
          role="button"
          tabIndex={0}
          aria-label="View full invitation"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsModalOpen(true);
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 0",
              }}
            >
              <div className="invitation-spinner" />
              <span
                style={{
                  marginLeft: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Generating your invitation…
              </span>
            </div>
          ) : (
            imageDataUrl && (
              <img
                src={imageDataUrl}
                alt={`Wedding invitation for ${guestName}`}
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
            )
          )}

          {/* "Tap to view" overlay badge */}
          {!isLoading && imageDataUrl && (
            <div
              style={{
                position: "absolute",
                bottom: "0.75rem",
                right: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                borderRadius: "9999px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#047857",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              Tap to view &amp; download
            </div>
          )}
        </div>

        {/* Quick download button under preview */}
        {!isLoading && imageDataUrl && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0.75rem",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #059669, #047857)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 6px 16px rgba(5, 150, 105, 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 12px rgba(5, 150, 105, 0.3)";
              }}
            >
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Invitation
            </button>
          </div>
        )}
      </div>

      {/* ═══════ FULLSCREEN MODAL ═══════ */}
      {isModalOpen && imageDataUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            padding: "1rem",
            animation: "invitationModalFadeIn 0.3s ease-out both",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Wedding Invitation"
        >
          {/* Modal content */}
          <div
            style={{
              position: "relative",
              maxWidth: "32rem",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: "1rem",
              overflow: "hidden",
              background: "white",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
              animation: "invitationModalSlideUp 0.4s ease-out both",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1.25rem",
                borderBottom: "1px solid rgba(16, 185, 129, 0.15)",
                background:
                  "linear-gradient(to right, rgba(16, 185, 129, 0.06), transparent)",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                ✉ Your Invitation
              </span>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: "1rem",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
                  (e.currentTarget as HTMLElement).style.color = "#1f2937";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "white";
                  (e.currentTarget as HTMLElement).style.color = "#6b7280";
                }}
                aria-label="Close invitation modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable image */}
            <div
              style={{
                overflowY: "auto",
                flex: 1,
              }}
            >
              <img
                src={imageDataUrl}
                alt={`Wedding invitation for ${guestName}`}
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
            </div>

            {/* Modal footer with download */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "0.875rem 1.25rem",
                borderTop: "1px solid rgba(16, 185, 129, 0.15)",
                background:
                  "linear-gradient(to right, rgba(16, 185, 129, 0.04), transparent)",
              }}
            >
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.5rem",
                  borderRadius: "0.625rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "white",
                  background: "linear-gradient(135deg, #059669, #047857)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 6px 16px rgba(5, 150, 105, 0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 12px rgba(5, 150, 105, 0.3)";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SCOPED KEYFRAME STYLES ═══════ */}
      <style>{`
        @keyframes invitationFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes invitationModalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes invitationModalSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes invitationSpin {
          to { transform: rotate(360deg); }
        }

        .invitation-spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #d1fae5;
          border-top-color: #059669;
          border-radius: 50%;
          animation: invitationSpin 0.6s linear infinite;
        }
      `}</style>
    </>
  );
}
