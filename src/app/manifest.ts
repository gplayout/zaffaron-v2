import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zaffaron — Authentic Persian Recipes",
    short_name: "Zaffaron",
    description: "Authentic Persian recipes and world cuisine.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#d97706",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
