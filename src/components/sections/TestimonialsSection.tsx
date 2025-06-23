import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marie L.",
    location: "Paris",
    rating: 5,
    comment: "Grâce au coach nutritionnel IA, j'ai enfin compris l'importance de l'alimentation anti-inflammatoire. Mes douleurs articulaires ont considérablement diminué en 3 mois !",
    avatar: "ML"
  },
  {
    id: 2,
    name: "Pierre D.",
    location: "Lyon",
    rating: 5,
    comment: "Les recettes sont délicieuses et faciles à préparer. J'ai perdu 8kg naturellement sans frustration. Le suivi personnalisé fait toute la différence.",
    avatar: "PD"
  },
  {
    id: 3,
    name: "Sophie M.",
    location: "Marseille",
    rating: 5,
    comment: "Enfin un programme nutrition qui s'adapte à mon emploi du temps chargé ! Les conseils sont précis et les résultats visibles dès la première semaine.",
    avatar: "SM"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ce que disent nos membres
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les témoignages de personnes qui ont transformé leur alimentation 
            et retrouvé leur bien-être grâce à notre coach nutritionnel IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-emerald-600 font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                
                {/* Name and location */}
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-gray-700 italic">
                "{testimonial.comment}"
              </blockquote>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">4.9/5</span>
              <span className="ml-1">sur 500+ avis</span>
            </div>
            <div>
              <span className="font-semibold">98%</span>
              <span className="ml-1">de satisfaction</span>
            </div>
            <div>
              <span className="font-semibold">2,500+</span>
              <span className="ml-1">membres actifs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}