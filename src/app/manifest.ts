import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TheNiceLamps – Premium Fancy Lighting",
    short_name: "TheNiceLamps",
    description:
      "Elevate your space with premium fancy lighting, chandeliers, and floor lamps at TheNiceLamps.",
    start_url: "/",
    display: "standalone",
    background_color: "#140c0f",
    theme_color: "#140c0f",
    icons: [
      {
        src: "/logo-new.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo-new.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo-new.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
