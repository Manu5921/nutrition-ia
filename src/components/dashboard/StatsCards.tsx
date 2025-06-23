import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Heart, 
  Zap, 
  Apple,
  Calendar,
  Award,
  Activity,
  Droplets
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCard {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  icon: React.ElementType
  color: string
  bgColor: string
  description?: string
}

interface StatsCardsProps {
  stats?: Partial<{
    caloriesConsumed: number
    caloriesTarget: number
    antiInflammatoryScore: number
    nutrientBalance: number
    waterIntake: number
    mealCompliance: number
    streakDays: number
    weeklyProgress: number
  }>
  className?: string
}

export const StatsCards = ({ stats = {}, className }: StatsCardsProps) => {
  const {
    caloriesConsumed = 1450,
    caloriesTarget = 1800,
    antiInflammatoryScore = 78,
    nutrientBalance = 85,
    waterIntake = 1.8,
    mealCompliance = 92,
    streakDays = 12,
    weeklyProgress = 88
  } = stats

  const cards: StatCard[] = [
    {
      title: "Calories du jour",
      value: caloriesConsumed,
      unit: `/ ${caloriesTarget}`,
      change: caloriesConsumed - 1200, // vs hier
      changeLabel: "vs hier",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      description: `${Math.round((caloriesConsumed / caloriesTarget) * 100)}% de l'objectif`
    },
    {
      title: "Score Anti-Inflammatoire",
      value: antiInflammatoryScore,
      unit: "/100",
      change: +5,
      changeLabel: "cette semaine",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      description: antiInflammatoryScore >= 80 ? "Excellent !" : antiInflammatoryScore >= 60 ? "Très bien" : "À améliorer"
    },
    {
      title: "Équilibre Nutritionnel",
      value: nutrientBalance,
      unit: "/100",
      change: +3,
      changeLabel: "ce mois",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      description: "Protéines, glucides, lipides"
    },
    {
      title: "Hydratation",
      value: waterIntake,
      unit: "L / 2.5L",
      change: +0.3,
      changeLabel: "vs objectif",
      icon: Droplets,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 border-cyan-200",
      description: `${Math.round((waterIntake / 2.5) * 100)}% de l'objectif`
    },
    {
      title: "Respect du Plan",
      value: mealCompliance,
      unit: "%",
      change: +8,
      changeLabel: "cette semaine",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      description: "Repas suivis selon le plan"
    },
    {
      title: "Série en cours",
      value: streakDays,
      unit: "jours",
      change: +1,
      changeLabel: "aujourd'hui",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200",
      description: streakDays >= 7 ? "Excellente régularité !" : "Continuez ainsi !"
    },
    {
      title: "Progrès Hebdomadaire",
      value: weeklyProgress,
      unit: "%",
      change: +12,
      changeLabel: "vs semaine dernière",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      description: "Tous objectifs confondus"
    }
  ]

  const formatChange = (change: number, unit: string = "") => {
    const isPositive = change > 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? "text-green-600" : "text-red-600"
    
    return (
      <div className={cn("flex items-center gap-1 text-xs", colorClass)}>
        <TrendIcon className="h-3 w-3" />
        <span>
          {isPositive ? "+" : ""}{change}{unit}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {cards.map((card, index) => {
        const Icon = card.icon
        
        return (
          <Card 
            key={card.title} 
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-md border",
              card.bgColor
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg bg-white/60", card.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Valeur principale */}
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-2xl font-bold", card.color)}>
                    {typeof card.value === 'number' && card.value % 1 !== 0 
                      ? card.value.toFixed(1) 
                      : card.value
                    }
                  </span>
                  {card.unit && (
                    <span className="text-sm text-gray-500 font-medium">
                      {card.unit}
                    </span>
                  )}
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                )}

                {/* Changement */}
                <div className="flex items-center justify-between">
                  {card.change !== undefined && (
                    <div className="flex items-center gap-2">
                      {formatChange(card.change)}
                      {card.changeLabel && (
                        <span className="text-xs text-gray-500">
                          {card.changeLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Barre de progression pour certaines métriques */}
              {(card.title.includes('Calories') || card.title.includes('Hydratation')) && (
                <div className="mt-3">
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div 
                      className={cn("h-2 rounded-full transition-all duration-1000", 
                        card.title.includes('Calories') ? "bg-blue-500" : "bg-cyan-500"
                      )}
                      style={{ 
                        width: card.title.includes('Calories') 
                          ? `${Math.min(100, (caloriesConsumed / caloriesTarget) * 100)}%`
                          : `${Math.min(100, (waterIntake / 2.5) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 pointer-events-none" />
          </Card>
        )
      })}
    </div>
  )
}