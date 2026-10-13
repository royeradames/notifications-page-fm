import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Notifications Page: three unread notifications, including Mark Webber's reaction to My first tournament today!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const icon = await readFile(join(process.cwd(), "public/icon.svg"));
  const src = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7fafd", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", background: "#ffffff", borderRadius: 24, padding: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, color: "#1c202b", fontSize: 64, fontWeight: 700 }}>
            Notifications
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 60, borderRadius: 12, background: "#0a317b", color: "#ffffff", fontSize: 40 }}>3</div>
          </div>
          <div style={{ display: "flex", gap: 28, padding: 32, marginTop: 36, background: "#f7fafd", borderRadius: 12 }}>
            <img src={src} alt="" width={90} height={90} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1, fontSize: 30, color: "#5a6372", lineHeight: 1.4 }}>
              <div style={{ color: "#1c202b", fontWeight: 700 }}>Mark Webber reacted to your recent post</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                My first tournament today!
                <div style={{ width: 14, height: 14, borderRadius: 7, background: "#f65351" }} />
              </div>
              <div style={{ marginTop: 8 }}>1m ago</div>
            </div>
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#5a6372" }}>A Frontend Mentor challenge</div>
        </div>
      </div>
    ),
    size,
  );
}
