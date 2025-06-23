import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";

const features = [
  "Analyse nutritionnelle personnalisée",
  "Recettes anti-inflammatoires illimitées",
  "Plans de repas adaptatifs",
  "Suivi de vos progrès en temps réel",
  "Base de données de 1000+ aliments",
  "Conseils nutritionnels quotidiens",
  "Support communauté 24/7",
  "Intégration avec vos applications santé"
];

export function PricingSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Investissez dans votre santé
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un seul abonnement pour transformer votre alimentation et retrouver votre bien-être.
            Moins cher qu'un repas au restaurant, plus précieux que tout.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="relative p-8 border-2 border-emerald-200 shadow-xl">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-emerald-600 text-white px-4 py-1 text-sm font-medium">
                <Crown className="w-4 h-4 mr-1" />
                Recommandé
              </Badge>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Coach Nutritionnel Premium
              </h3>
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-emerald-600">5,99€</span>
                <span className="text-gray-500 ml-2">/mois</span>
              </div>
              <p className="text-gray-600">
                Accès complet à tous les outils et fonctionnalités
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer maintenant
            </Button>

            {/* Money back guarantee */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                ✓ Garantie satisfait ou remboursé 30 jours
              </p>
              <p className="text-sm text-gray-500">
                ✓ Résiliation possible à tout moment
              </p>
            </div>
          </Card>
        </div>

        {/* Value proposition */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Pourquoi choisir notre coach nutritionnel ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">-70%</div>
                <p className="text-sm text-gray-600">
                  vs consultation nutritionniste traditionnelle
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
                <p className="text-sm text-gray-600">
                  Disponible quand vous en avez besoin
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">IA</div>
                <p className="text-sm text-gray-600">
                  Conseils personnalisés et évolutifs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}