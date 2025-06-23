import { Brain, Utensils, Heart, BarChart3, Clock, Shield } from "lucide-react";

const features = [
  {
    name: "IA Personnalisée",
    description: "Notre intelligence artificielle analyse votre profil pour créer des recommandations nutritionnelles parfaitement adaptées à vos besoins.",
    icon: Brain,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Recettes Anti-Inflammatoires",
    description: "Plus de 1000 recettes spécialement conçues pour réduire l'inflammation chronique et améliorer votre bien-être.",
    icon: Utensils,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Suivi Santé",
    description: "Surveillez vos progrès avec des métriques de bien-être et des indicateurs anti-inflammatoires personnalisés.",
    icon: Heart,
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Analyses Nutritionnelles",
    description: "Obtenez des analyses détaillées de vos repas avec des recommandations pour optimiser votre alimentation.",
    icon: BarChart3,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Plans Adaptatifs",
    description: "Vos plans de repas s'adaptent automatiquement à vos préférences, restrictions et objectifs de santé.",
    icon: Clock,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Données Sécurisées",
    description: "Vos informations de santé sont protégées avec le plus haut niveau de sécurité et de confidentialité.",
    icon: Shield,
    color: "bg-gray-100 text-gray-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-playfair mb-4">
            Une Approche Scientifique de la Nutrition
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment notre technologie avancée transforme votre relation 
            à l'alimentation pour une vie plus saine et équilibrée.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="group relative bg-white p-8 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-gray-100"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-playfair">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-primary-600 font-medium">
            <span>Prêt à commencer votre transformation nutritionnelle ?</span>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>
    </section>
  );
}