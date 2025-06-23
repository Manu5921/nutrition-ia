import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coach Nutritionnel IA - Alimentation Anti-Inflammatoire",
    short_name: "Coach Nutritionnel IA",
    description: "Votre coach nutritionnel personnel spécialisé dans l'alimentation anti-inflammatoire",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    orientation: "portrait",
    categories: ["health", "nutrition", "lifestyle"],
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Tableau de bord",
        url: "/dashboard",
        icons: [
          {
            src: "/icons/dashboard-icon.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Mes recettes",
        url: "/dashboard/recettes",
        icons: [
          {
            src: "/icons/recipes-icon.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Blog nutrition",
        url: "/blog",
        icons: [
          {
            src: "/icons/blog-icon.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  };
}