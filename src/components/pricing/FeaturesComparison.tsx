"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface ComparisonFeature {
  name: string
  free: boolean | string
  premium: boolean | string
}

const features: ComparisonFeature[] = [
  {
    name: "Recettes anti-inflammatoires",
    free: "5 recettes",
    premium: "200+ recettes"
  },
  {
    name: "Plans de repas personnalisés",
    free: false,
    premium: true
  },
  {
    name: "Suivi nutritionnel",
    free: "Basique",
    premium: "Avancé avec IA"
  },
  {
    name: "Conseils personnalisés",
    free: false,
    premium: true
  },
  {
    name: "Liste de courses automatique",
    free: false,
    premium: true
  },
  {
    name: "Support nutritionniste",
    free: false,
    premium: true
  },
  {
    name: "Modifications sans limite",
    free: false,
    premium: true
  },
  {
    name: "Export PDF des plans",
    free: false,
    premium: true
  }
]

export function FeaturesComparison() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-gray-400" />
      )
    }
    return <span className="text-sm text-muted-foreground">{value}</span>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Comparaison des fonctionnalités</h2>
        <p className="text-muted-foreground">
          Découvrez ce qui est inclus dans chaque plan
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div></div>
            <div 
              className="text-center transition-transform"
              onMouseEnter={() => setHoveredPlan("free")}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <CardTitle className="text-lg">Gratuit</CardTitle>
              <Badge variant="outline" className="mt-1">0€/mois</Badge>
            </div>
            <div 
              className="text-center transition-transform"
              onMouseEnter={() => setHoveredPlan("premium")}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <CardTitle className="text-lg text-primary">Premium</CardTitle>
              <Badge className="mt-1 bg-primary">5,99€/mois</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`grid grid-cols-3 gap-4 items-center py-3 px-2 rounded-lg transition-colors ${
                  hoveredPlan === "free" ? "bg-gray-50" : 
                  hoveredPlan === "premium" ? "bg-primary/5" : ""
                }`}
              >
                <div className="font-medium text-sm">{feature.name}</div>
                <div className="flex justify-center">
                  {renderFeatureValue(feature.free)}
                </div>
                <div className="flex justify-center">
                  {renderFeatureValue(feature.premium)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}