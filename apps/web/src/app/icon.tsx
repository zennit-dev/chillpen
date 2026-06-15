import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default () =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0d",
        backgroundImage:
          "radial-gradient(circle at 32% 22%, rgba(232,180,90,0.55), rgba(10,10,13,0) 62%)",
        color: "#e8b45a",
        fontSize: 172,
        fontWeight: 700,
        fontFamily: "sans-serif",
      }}
    >
      c
    </div>,
    size,
  );
