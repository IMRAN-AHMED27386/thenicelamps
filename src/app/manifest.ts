import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TheNiceLamps – Elegant Fashion for Every Woman",
    short_name: "TheNiceLamps",
    description:
      "Premium Pakistani suits, co-ord sets and Anarkali frocks. Elegant fashion for every woman at TheNiceLamps.",
    start_url: "/",
    display: "standalone",
    background_color: "#140c0f",
    theme_color: "#140c0f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
