"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "Qu'est-ce que l'alimentation anti-inflammatoire ?",
    answer: "L'alimentation anti-inflammatoire privilégie les aliments riches en antioxydants, oméga-3 et nutriments qui réduisent l'inflammation chronique dans le corps. Elle inclut légumes colorés, poissons gras, noix, épices comme le curcuma, tout en limitant les aliments transformés et les sucres raffinés."
  },
  {
    question: "L'abonnement se renouvelle-t-il automatiquement ?",
    answer: "Oui, l'abonnement premium à 5,99€/mois se renouvelle automatiquement chaque mois. Vous pouvez annuler à tout moment depuis votre espace membre et continuer à profiter des fonctionnalités jusqu'à la fin de votre période payée."
  },
  {
    question: "Puis-je personnaliser les recettes selon mes restrictions alimentaires ?",
    answer: "Absolument ! Notre IA s'adapte à vos restrictions (sans gluten, végétarien, allergies, etc.) et préférences personnelles. Plus vous utilisez l'application, plus les recommandations deviennent précises et adaptées à vos besoins."
  },
  {
    question: "Y a-t-il une période d'essai gratuite ?",
    answer: "Oui, vous pouvez tester gratuitement notre sélection de recettes de base. Pour accéder à toutes les fonctionnalités premium (plans personnalisés, IA nutritionnelle, support), l'abonnement à 5,99€/mois est nécessaire."
  },
  {
    question: "L'application remplace-t-elle un suivi médical ?",
    answer: "Non, notre application est un outil de bien-être et d'éducation nutritionnelle. Elle ne remplace pas les conseils d'un professionnel de santé. Pour des problèmes de santé spécifiques, consultez toujours votre médecin ou un nutritionniste."
  },
  {
    question: "Comment fonctionne l'IA nutritionnelle ?",
    answer: "Notre IA analyse votre profil (âge, activité, objectifs), vos préférences alimentaires et votre historique pour générer des plans de repas personnalisés. Elle s'améliore continuellement grâce à vos retours et ajuste ses recommandations."
  },
  {
    question: "Puis-je utiliser l'application sans connexion internet ?",
    answer: "Les recettes sauvegardées et votre dernier plan de repas restent accessibles hors ligne. Cependant, les nouvelles recommandations IA et la synchronisation nécessitent une connexion internet."
  },
  {
    question: "Y a-t-il des frais cachés ou supplémentaires ?",
    answer: "Non, aucun frais caché. L'abonnement à 5,99€/mois inclut toutes les fonctionnalités premium : recettes illimitées, plans personnalisés, IA nutritionnelle, et support. Aucun achat intégré supplémentaire."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
        <p className="text-muted-foreground">
          Trouvez rapidement les réponses à vos questions
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-left">
                  {faq.question}
                </CardTitle>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            
            {openIndex === index && (
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Vous ne trouvez pas votre réponse ?</h3>
        <p className="text-muted-foreground mb-4">
          Notre équipe est là pour vous aider avec toutes vos questions.
        </p>
        <a 
          href="mailto:support@coach-nutrition.fr" 
          className="text-primary hover:underline font-medium"
        >
          Contactez notre support →
        </a>
      </div>
    </div>
  )
}