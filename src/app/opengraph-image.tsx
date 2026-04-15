import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #e0f2fe 100%)",
          color: "#0f172a",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: "36px",
            padding: "56px",
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(148, 163, 184, 0.24)",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.12)",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "28px",
              fontWeight: 700,
              color: "#1d4ed8",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                background: "#2563eb",
              }}
            />
            Job Tracker
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontSize: "72px",
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                maxWidth: "860px",
              }}
            >
              Organize every application in one focused dashboard.
            </div>
            <div
              style={{
                fontSize: "30px",
                lineHeight: 1.4,
                color: "#334155",
                maxWidth: "860px",
              }}
            >
              Track interviews, offers, priorities, and follow-ups without losing
              momentum.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "18px",
              color: "#0f172a",
              fontSize: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: "999px",
                background: "#dbeafe",
              }}
            >
              Applications
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: "999px",
                background: "#dbeafe",
              }}
            >
              Interviews
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: "999px",
                background: "#dbeafe",
              }}
            >
              Offers
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
