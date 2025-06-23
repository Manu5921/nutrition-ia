import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Users, 
  Utensils,
  Plus,
  MoreHorizontal,
  Heart,
  Star
} from "lucide-react"
import Link from "next/link"

interface Meal {
  id: string
  name: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  prepTime: number
  servings: number
  antiInflammatoryScore: number
  imageUrl?: string
}

interface DayPlan {
  date: string
  meals: Meal[]
  totalCalories: number
  antiInflammatoryScore: number
}

interface WeeklyPlanCardProps {
  weekPlan?: DayPlan[]
  isLoading?: boolean
  hasActivePlan?: boolean
}

const mealTypeLabels = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner", 
  dinner: "Dîner",
  snack: "Collation"
}

const mealTypeColors = {
  breakfast: "bg-yellow-100 text-yellow-800",
  lunch: "bg-blue-100 text-blue-800",
  dinner: "bg-purple-100 text-purple-800",
  snack: "bg-green-100 text-green-800"
}

export const WeeklyPlanCard = ({ 
  weekPlan = [],
  isLoading = false,
  hasActivePlan = false 
}: WeeklyPlanCardProps) => {
  // Plan de démonstration si aucun plan fourni
  const defaultPlan: DayPlan[] = [
    {
      date: new Date().toISOString().split('T')[0],
      meals: [
        {
          id: "1",
          name: "Bowl d'avoine aux myrtilles",
          type: "breakfast",
          prepTime: 10,
          servings: 1,
          antiInflammatoryScore: 8.5
        },
        {
          id: "2", 
          name: "Salade de quinoa au saumon",
          type: "lunch",
          prepTime: 25,
          servings: 2,
          antiInflammatoryScore: 9.2
        },
        {
          id: "3",
          name: "Curry de légumes au curcuma",
          type: "dinner", 
          prepTime: 35,
          servings: 4,
          antiInflammatoryScore: 8.8
        }
      ],
      totalCalories: 1680,
      antiInflammatoryScore: 8.8
    }
  ]

  const planToShow = weekPlan.length > 0 ? weekPlan : defaultPlan
  const today = planToShow[0]

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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasActivePlan) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun plan actif
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre premier plan de repas personnalisé pour commencer votre parcours nutritionnel.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/dashboard/plans/nouveau">
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un plan
                  </Button>
                </Link>
                <Link href="/dashboard/plans">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Voir les modèles
                  </Button>
                </Link>
              </div>
            </div>
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
              <Calendar className="h-5 w-5 text-primary" />
              Plan d'aujourd'hui
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(today.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {today.totalCalories} cal
              </Badge>
              <Badge 
                variant={today.antiInflammatoryScore >= 8 ? "default" : "secondary"}
                className="text-xs"
              >
                <Heart className="h-3 w-3 mr-1" />
                {today.antiInflammatoryScore.toFixed(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Repas du jour */}
        <div className="space-y-3">
          {today.meals.map((meal) => (
            <div 
              key={meal.id}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-primary/10 transition-colors">
                    <Utensils className="h-4 w-4 text-gray-600 group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        {meal.name}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${mealTypeColors[meal.type]}`}
                      >
                        {mealTypeLabels[meal.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meal.prepTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meal.servings} pers.
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {meal.antiInflammatoryScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <Link href="/dashboard/plans">
              <Button variant="outline" size="sm">
                Voir le plan complet
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un repas
            </Button>
          </div>
          
          <Link href="/dashboard/plans/nouveau">
            <Button size="sm">
              Nouveau plan
            </Button>
          </Link>
        </div>

        {/* Progression de la semaine */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression cette semaine</span>
            <span className="text-sm text-gray-600">5/7 jours</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: '71%' }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Excellent ! Vous suivez bien votre plan alimentaire.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}