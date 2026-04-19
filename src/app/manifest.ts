import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ImmoDz — Immobilier en Algérie",
    short_name: "ImmoDz",
    description:
      "Plateforme de recherche de biens immobiliers (location / vente) en Algérie",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#003527",
    orientation: "portrait",
    lang: "fr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
