import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://coach-nutritionnel-ia.vercel.app";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/abonnement"],
        disallow: ["/dashboard", "/profil", "/api", "/_next", "/admin"],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}