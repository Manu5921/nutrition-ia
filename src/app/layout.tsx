import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coach-nutritionnel-ia.vercel.app"),
  title: {
    default: "Coach Nutritionnel IA - Alimentation Anti-Inflammatoire",
    template: "%s | Coach Nutritionnel IA"
  },
  description: "Votre coach nutritionnel personnel spécialisé dans l'alimentation anti-inflammatoire. Recettes personnalisées, plans de repas et conseils adaptés à votre profil. 5,99€/mois.",
  keywords: [
    "nutrition anti-inflammatoire",
    "coach nutritionnel",
    "recettes santé",
    "alimentation équilibrée",
    "perte de poids",
    "bien-être",
    "France"
  ],
  authors: [{ name: "Coach Nutritionnel IA" }],
  creator: "Coach Nutritionnel IA",
  publisher: "Coach Nutritionnel IA",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://coach-nutritionnel-ia.vercel.app",
    siteName: "Coach Nutritionnel IA",
    title: "Coach Nutritionnel IA - Alimentation Anti-Inflammatoire",
    description: "Votre coach nutritionnel personnel spécialisé dans l'alimentation anti-inflammatoire. Recettes personnalisées, plans de repas et conseils adaptés.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Coach Nutritionnel IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach Nutritionnel IA - Alimentation Anti-Inflammatoire",
    description: "Votre coach nutritionnel personnel spécialisé dans l'alimentation anti-inflammatoire.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="font-inter antialiased bg-white text-gray-900 min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
