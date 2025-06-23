import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Target, 
  Calendar,
  Activity,
  Heart,
  Zap,
  Apple,
  Droplets,
  Award
} from "lucide-react"
import Link from "next/link"

interface NutritionData {
  date: string
  calories: number
  antiInflammatoryScore: number
  macros: {
    proteins: number
    carbs: number
    fats: number
  }
  goals: {
    caloriesTarget: number
    proteinTarget: number
    antiInflammatoryTarget: number
  }
}

interface NutritionProgressCardProps {
  data?: NutritionData[]
  isLoading?: boolean
  period?: "week" | "month"
}

export const NutritionProgressCard = ({ 
  data = [],
  isLoading = false,
  period = "week"
}: NutritionProgressCardProps) => {
  // Données de démonstration
  const defaultData: NutritionData[] = [
    {
      date: "2024-01-23",
      calories: 1650,
      antiInflammatoryScore: 8.2,
      macros: { proteins: 95, carbs: 180, fats: 65 },
      goals: { caloriesTarget: 1800, proteinTarget: 90, antiInflammatoryTarget: 8.0 }
    },
    {
      date: "2024-01-22", 
      calories: 1580,
      antiInflammatoryScore: 7.8,
      macros: { proteins: 88, carbs: 175, fats: 58 },
      goals: { caloriesTarget: 1800, proteinTarget: 90, antiInflammatoryTarget: 8.0 }
    },
    {
      date: "2024-01-21",
      calories: 1720,
      antiInflammatoryScore: 8.5,
      macros: { proteins: 102, carbs: 190, fats: 68 },
      goals: { caloriesTarget: 1800, proteinTarget: 90, antiInflammatoryTarget: 8.0 }
    }
  ]

  const dataToShow = data.length > 0 ? data : defaultData
  const latest = dataToShow[0]
  const previous = dataToShow[1]

  // Calculs de progression
  const caloriesProgress = latest ? (latest.calories / latest.goals.caloriesTarget) * 100 : 0
  const proteinProgress = latest ? (latest.macros.proteins / latest.goals.proteinTarget) * 100 : 0
  const antiInflammatoryProgress = latest ? (latest.antiInflammatoryScore / latest.goals.antiInflammatoryTarget) * 100 : 0

  // Tendances
  const caloriesTrend = latest && previous ? latest.calories - previous.calories : 0
  const antiInflammatoryTrend = latest && previous ? latest.antiInflammatoryScore - previous.antiInflammatoryScore : 0

  const progressItems = [
    {
      label: "Calories",
      current: latest?.calories || 0,
      target: latest?.goals.caloriesTarget || 1800,
      progress: caloriesProgress,
      trend: caloriesTrend,
      unit: "kcal",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      progressColor: "bg-blue-500"
    },
    {
      label: "Protéines",
      current: latest?.macros.proteins || 0,
      target: latest?.goals.proteinTarget || 90,
      progress: proteinProgress,
      trend: previous ? (latest?.macros.proteins || 0) - (previous?.macros.proteins || 0) : 0,
      unit: "g",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      progressColor: "bg-green-500"
    },
    {
      label: "Score Anti-Inflammatoire",
      current: latest?.antiInflammatoryScore || 0,
      target: latest?.goals.antiInflammatoryTarget || 8.0,
      progress: antiInflammatoryProgress,
      trend: antiInflammatoryTrend,
      unit: "/10",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      progressColor: "bg-red-500"
    }
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progrès Nutritionnel
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Vos métriques de {period === "week" ? "la semaine" : "ce mois"}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {period === "week" ? "7 jours" : "30 jours"}
            </Badge>
            <Link href="/dashboard/suivi">
              <Button variant="outline" size="sm">
                Détails
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métriques principales */}
        {progressItems.map((item, index) => {
          const Icon = item.icon
          const isOnTrack = item.progress >= 80 && item.progress <= 120
          const trendPositive = item.trend > 0

          return (
            <div key={item.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        {typeof item.current === 'number' && item.current % 1 !== 0 
                          ? item.current.toFixed(1) 
                          : item.current
                        }
                        {item.unit} / {item.target}{item.unit}
                      </span>
                      {item.trend !== 0 && (
                        <span className={`text-xs flex items-center gap-1 ${
                          trendPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trendPositive ? '↗' : '↘'}
                          {Math.abs(item.trend).toFixed(item.unit === '/10' ? 1 : 0)}{item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    isOnTrack ? 'text-green-600' : item.progress > 120 ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {Math.round(item.progress)}%
                  </div>
                  {isOnTrack && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      ✓ Objectif
                    </Badge>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${item.progressColor}`}
                    style={{ width: `${Math.min(100, item.progress)}%` }}
                  />
                </div>
                {item.progress > 100 && (
                  <p className="text-xs text-orange-600">
                    Dépassement de {Math.round(item.progress - 100)}% de l'objectif
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Résumé et recommandations */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Award className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Bilan du jour</h4>
              <p className="text-sm text-gray-700 mb-2">
                {caloriesProgress >= 80 && caloriesProgress <= 120
                  ? "Excellent équilibre calorique ! "
                  : caloriesProgress < 80 
                    ? "Augmentez légèrement vos apports. "
                    : "Réduisez un peu les calories. "
                }
                {antiInflammatoryProgress >= 100
                  ? "Votre alimentation est très anti-inflammatoire."
                  : "Ajoutez plus d'aliments anti-inflammatoires."
                }
              </p>
              <div className="flex gap-2">
                <Link href="/dashboard/nutrition">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Apple className="h-3 w-3 mr-1" />
                    Analyser
                  </Button>
                </Link>
                <Link href="/dashboard/recettes">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Recettes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link href="/dashboard/nutrition/ajouter">
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Ajouter un repas
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Link href="/dashboard/suivi">
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </Link>
            <Link href="/dashboard/objectifs">
              <Button size="sm">
                Ajuster objectifs
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}