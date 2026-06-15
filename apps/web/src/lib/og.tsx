import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 } as const;
export const ogImageContentType = "image/png" as const;

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

export const createOgImage = ({
  title,
  description,
  eyebrow = "chillpen.club",
}: createOgImage.Params) =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#0a0a0d",
        backgroundImage:
          "radial-gradient(70% 90% at 12% -10%, rgba(232,180,90,0.28), rgba(10,10,13,0) 58%)",
        color: "#f6f4f1",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#e8b45a",
        }}
      >
        {eyebrow}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            color: "#f6f4f1",
            maxWidth: 1000,
          }}
        >
          {truncate(title, 100)}
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            lineHeight: 1.35,
            color: "#a9a7a2",
            maxWidth: 940,
          }}
        >
          {truncate(description, 170)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: 26,
        }}
      >
        <div
          style={{ display: "flex", fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          <span style={{ color: "#f6f4f1" }}>chill</span>
          <span style={{ color: "#e8b45a" }}>pen</span>
        </div>
        <div style={{ color: "#8a8a93", fontSize: 22 }}>
          build worlds together
        </div>
      </div>
    </div>,
    { ...ogImageSize },
  );

export namespace createOgImage {
  export type Params = {
    title: string;
    description: string;
    eyebrow?: string;
  };
}
