import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à transformer votre alimentation ?
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Rejoignez les milliers de personnes qui ont déjà retrouvé leur bien-être 
              grâce à une alimentation anti-inflammatoire personnalisée.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">2,500+</div>
              <p className="text-emerald-100">Membres actifs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <p className="text-emerald-100">Taux de satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">-12kg</div>
              <p className="text-emerald-100">Perte moyenne en 6 mois</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Commencer mon coaching
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-emerald-600 font-semibold px-8 py-4 text-lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Voir la communauté
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-emerald-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Paiement sécurisé
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Garantie 30 jours
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sans engagement
            </div>
          </div>

          {/* Final message */}
          <div className="mt-8 p-6 bg-emerald-800/30 rounded-lg backdrop-blur-sm">
            <p className="text-emerald-100 font-medium">
              🎯 Offre spéciale : Premier mois à 2,99€ pour les 100 premiers inscrits
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}