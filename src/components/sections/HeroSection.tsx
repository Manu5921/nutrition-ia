import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Heart } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                Note moyenne de 4.8/5 par nos utilisateurs
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-playfair mb-6 leading-tight">
              Transformez Votre
              <span className="text-primary-600 block">
                Alimentation Naturellement
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Découvrez votre coach nutritionnel IA spécialisé dans l'alimentation 
              anti-inflammatoire. Recettes personnalisées, plans de repas et conseils 
              adaptés à votre profil pour retrouver bien-être et vitalité.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700 font-medium">+10,000 utilisateurs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-gray-700 font-medium">95% de satisfaction</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link href="/abonnement">
                  Commencer Maintenant - 5,99€/mois
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                <Link href="/blog">
                  Découvrir le Blog
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="text-sm text-gray-500">
              <p>✓ Annulation possible à tout moment</p>
              <p>✓ Recettes illimitées et personnalisées</p>
              <p>✓ Suivi nutritionnel expert</p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
              
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/hero-nutrition.jpg"
                  alt="Alimentation anti-inflammatoire"
                  width={500}
                  height={400}
                  className="rounded-lg object-cover w-full h-80"
                  priority
                />
                
                {/* Floating cards */}
                <div className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg p-4 max-w-[200px]">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Anti-inflammatoire</p>
                      <p className="text-sm text-gray-600">Recettes adaptées</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-[180px]">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Personnalisé</p>
                      <p className="text-sm text-gray-600">Pour votre profil</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 opacity-30">
        <svg width="404" height="784" fill="none" viewBox="0 0 404 784">
          <defs>
            <pattern id="56409614-3d62-4985-9a10-7ca758a8f4f0" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-primary-200" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#56409614-3d62-4985-9a10-7ca758a8f4f0)" />
        </svg>
      </div>
    </section>
  );
}