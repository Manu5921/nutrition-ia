import { Suspense } from "react";
import { PricingCard } from "@/components/pricing/PricingCard";
import { FeaturesComparison } from "@/components/pricing/FeaturesComparison";
import { FAQSection } from "@/components/pricing/FAQSection";
import { TestimonialsCarousel } from "@/components/pricing/TestimonialsCarousel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnement Premium - Coach Nutritionnel IA",
  description: "Accédez à toutes les fonctionnalités premium de votre coach nutritionnel IA pour seulement 5,99€/mois. Recettes illimitées, plans personnalisés et suivi expert.",
  keywords: [
    "abonnement coach nutritionnel",
    "premium nutrition IA",
    "5.99 euros par mois",
    "recettes personnalisées",
    "suivi nutritionnel"
  ],
  openGraph: {
    title: "Abonnement Premium - Coach Nutritionnel IA",
    description: "Transformez votre alimentation avec l'abonnement premium à 5,99€/mois. Recettes illimitées et accompagnement personnalisé.",
  }
};

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-playfair mb-4">
              Débloquez Votre Potentiel Nutritionnel
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Accédez à l'ensemble de nos fonctionnalités premium pour transformer 
              votre alimentation et retrouver votre bien-être naturellement.
            </p>
            <div className="flex items-center justify-center space-x-2 text-primary-100">
              <span className="text-sm">Plus de 10,000 utilisateurs satisfaits</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Pricing Card */}
        <div className="mb-16">
          <Suspense fallback={<div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-2 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>}>
            <PricingCard />
          </Suspense>
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-playfair mb-4">
              Tout Ce Dont Vous Avez Besoin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une seule formule complète avec toutes les fonctionnalités 
              pour transformer votre alimentation durablement.
            </p>
          </div>
          
          <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>}>
            <FeaturesComparison />
          </Suspense>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-playfair mb-4">
              Ils Ont Transformé Leur Alimentation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de nos utilisateurs qui ont retrouvé 
              bien-être et vitalité grâce à notre approche personnalisée.
            </p>
          </div>
          
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>}>
            <TestimonialsCarousel />
          </Suspense>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-playfair mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trouvez les réponses aux questions les plus courantes 
              sur notre service et votre abonnement.
            </p>
          </div>
          
          <Suspense fallback={<div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>}>
            <FAQSection />
          </Suspense>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold font-playfair mb-4">
            Prêt à Commencer Votre Transformation ?
          </h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont déjà transformé 
            leur alimentation et retrouvé leur bien-être naturellement.
          </p>
          <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Commencer Maintenant - 5,99€/mois
          </button>
          <p className="text-primary-200 text-sm mt-3">
            Annulation possible à tout moment • Satisfaction garantie
          </p>
        </div>
      </div>
    </div>
  );
}