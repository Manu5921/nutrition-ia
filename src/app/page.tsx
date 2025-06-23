import { Suspense } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil - Votre Coach Nutritionnel Anti-Inflammatoire",
  description: "Découvrez votre coach nutritionnel personnel spécialisé dans l'alimentation anti-inflammatoire. Recettes personnalisées, plans de repas et conseils adaptés à votre profil pour retrouver bien-être et vitalité.",
  keywords: [
    "nutrition anti-inflammatoire",
    "coach nutritionnel en ligne",
    "recettes personnalisées",
    "alimentation santé",
    "bien-être nutritionnel",
    "perte de poids naturelle"
  ],
  openGraph: {
    title: "Coach Nutritionnel IA - Votre Alimentation Anti-Inflammatoire",
    description: "Transformez votre alimentation avec votre coach nutritionnel IA. Recettes anti-inflammatoires, plans personnalisés et accompagnement expert."
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <FeaturesSection />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <TestimonialsSection />
      </Suspense>

      {/* Pricing Section */}
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <PricingSection />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<div className="h-64 bg-primary-600 animate-pulse" />}>
        <CTASection />
      </Suspense>
    </div>
  );
}
