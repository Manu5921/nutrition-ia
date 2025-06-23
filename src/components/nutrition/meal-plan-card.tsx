import * as React from "react"
import { NutritionCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Calendar, 
  Clock, 
  Flame, 
  Target, 
  Plus, 
  Edit3, 
  Star,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Apple
} from "lucide-react"

// Types pour le plan de repas
interface MealItem {
  id: string
  name: string
  description: string
  calories: number
  prepTime: number
  difficulty: 'facile' | 'moyen' | 'difficile'
  antiInflammatoryScore: number
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
  }>
  tags: string[]
}

interface MealPlanCardProps {
  day: string
  meals: {
    breakfast?: MealItem
    lunch?: MealItem
    dinner?: MealItem
    snacks?: MealItem[]
  }
  totalCalories: number
  totalScore: number
  onMealEdit?: (mealType: string, meal: MealItem) => void
  onAddSnack?: () => void
  className?: string
}

// Utilitaires
const getMealIcon = (mealType: string) => {
  const icons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snacks: Apple
  }
  return icons[mealType as keyof typeof icons] || Utensils
}

const getMealTime = (mealType: string) => {
  const times = {
    breakfast: "Petit-déjeuner (8h00)",
    lunch: "Déjeuner (12h30)",
    dinner: "Dîner (19h30)",
    snacks: "Collations"
  }
  return times[mealType as keyof typeof times] || mealType
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-success-600"
  if (score >= 60) return "text-turmeric-600"
  if (score >= 40) return "text-warning-600"
  return "text-danger-600"
}

const getDifficultyConfig = (difficulty: string) => {
  const configs = {
    facile: { color: 'bg-success-100 text-success-700 border-success-200', icon: '👍' },
    moyen: { color: 'bg-warning-100 text-warning-700 border-warning-200', icon: '👌' },
    difficile: { color: 'bg-danger-100 text-danger-700 border-danger-200', icon: '💪' }
  }
  return configs[difficulty as keyof typeof configs] || configs.facile
}

// Composant pour un repas individuel
const MealSlot: React.FC<{
  mealType: string
  meal?: MealItem
  onEdit?: (meal: MealItem) => void
  onAdd?: () => void
}> = ({ mealType, meal, onEdit, onAdd }) => {
  const Icon = getMealIcon(mealType)
  const mealTime = getMealTime(mealType)
  
  if (!meal) {
    return (
      <div className="border-2 border-dashed border-linen-300 rounded-2xl p-6 text-center group hover:border-sage-300 hover:bg-sage-50/50 transition-all duration-300">
        <Icon className="h-8 w-8 text-linen-400 mx-auto mb-3 group-hover:text-sage-400 transition-colors" />
        <p className="text-sm text-sage-500 mb-3">{mealTime}</p>
        <Button 
          onClick={onAdd}
          variant="ghost" 
          size="sm"
          className="text-sage-600 hover:text-sage-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un repas
        </Button>
      </div>
    )
  }

  const scoreColor = getScoreColor(meal.antiInflammatoryScore)
  const difficultyConfig = getDifficultyConfig(meal.difficulty)

  return (
    <div className="bg-white rounded-2xl border border-linen-200 p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl group-hover:from-sage-200 group-hover:to-sage-300 transition-all duration-300">
            <Icon className="h-5 w-5 text-sage-600" />
          </div>
          <div>
            <p className="text-xs text-sage-500 font-medium mb-1">{mealTime}</p>
            <h4 className="font-semibold text-sage-800 text-pretty line-clamp-1">
              {meal.name}
            </h4>
          </div>
        </div>
        <button
          onClick={() => onEdit?.(meal)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-sage-100 text-sage-500 hover:text-sage-700"
          aria-label="Modifier le repas"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-sage-600 mb-4 line-clamp-2 leading-relaxed">
        {meal.description}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-sage-500 mb-1">
            <Clock className="h-3 w-3" />
            <span>Temps</span>
          </div>
          <p className="text-sm font-semibold text-sage-800">{meal.prepTime} min</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-sage-500 mb-1">
            <Flame className="h-3 w-3" />
            <span>Calories</span>
          </div>
          <p className="text-sm font-semibold text-sage-800">{meal.calories} kcal</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-sage-500 mb-1">
            <Star className="h-3 w-3" />
            <span>Score</span>
          </div>
          <p className={cn("text-sm font-semibold", scoreColor)}>{meal.antiInflammatoryScore}/100</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge 
          className={cn("text-xs border", difficultyConfig.color)}
        >
          {difficultyConfig.icon} {meal.difficulty}
        </Badge>
        
        <div className="flex gap-1">
          {meal.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {meal.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{meal.tags.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({
  day,
  meals,
  totalCalories,
  totalScore,
  onMealEdit,
  onAddSnack,
  className
}) => {
  const scoreColor = getScoreColor(totalScore)

  return (
    <NutritionCard variant="meal" className={cn("animate-fade-in", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-turmeric-100 to-turmeric-200 rounded-2xl shadow-soft">
              <Calendar className="h-6 w-6 text-turmeric-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{day}</CardTitle>
              <p className="text-sm text-sage-600 font-medium">Plan de repas personnalisé</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-sage-500" />
              <span className="text-sm text-sage-600">Score global</span>
            </div>
            <p className={cn("text-2xl font-display font-semibold", scoreColor)}>
              {totalScore}/100
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Résumé nutritionnel */}
        <div className="bg-gradient-to-br from-linen-50 to-sage-50 rounded-2xl p-5 border border-linen-200 shadow-inner-soft">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sage-800 flex items-center gap-2">
              <Flame className="h-4 w-4 text-turmeric-600" />
              Apports journaliers
            </h4>
            <div className="text-right">
              <p className="text-2xl font-display font-semibold text-turmeric-600">
                {totalCalories}
              </p>
              <p className="text-xs text-sage-500">kcal/jour</p>
            </div>
          </div>
          
          <div className="w-full bg-linen-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-turmeric-500 to-turmeric-600 transition-all duration-1000 ease-out relative"
              style={{ width: `${Math.min(100, (totalCalories / 2000) * 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse-soft"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-sage-500 mt-1">
            <span>0 kcal</span>
            <span>Objectif: 2000 kcal</span>
          </div>
        </div>

        {/* Repas de la journée */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sage-800 flex items-center gap-2">
            <Utensils className="h-4 w-4 text-sage-600" />
            Repas de la journée
          </h4>
          
          <div className="grid gap-4 container-md:grid-cols-1 container-lg:grid-cols-2">
            <MealSlot
              mealType="breakfast"
              meal={meals.breakfast}
              onEdit={(meal) => onMealEdit?.('breakfast', meal)}
              onAdd={() => console.log('Ajouter petit-déjeuner')}
            />
            <MealSlot
              mealType="lunch"
              meal={meals.lunch}
              onEdit={(meal) => onMealEdit?.('lunch', meal)}
              onAdd={() => console.log('Ajouter déjeuner')}
            />
            <MealSlot
              mealType="dinner"
              meal={meals.dinner}
              onEdit={(meal) => onMealEdit?.('dinner', meal)}
              onAdd={() => console.log('Ajouter dîner')}
            />
            
            {/* Section collations */}
            <div className="border-2 border-dashed border-turmeric-200 rounded-2xl p-6 text-center group hover:border-turmeric-300 hover:bg-turmeric-50/30 transition-all duration-300">
              <Apple className="h-8 w-8 text-turmeric-400 mx-auto mb-3 group-hover:text-turmeric-500 transition-colors" />
              <p className="text-sm text-sage-600 mb-3">Collations (optionnel)</p>
              {meals.snacks && meals.snacks.length > 0 ? (
                <div className="space-y-2">
                  {meals.snacks.map((snack, index) => (
                    <div key={index} className="text-xs text-sage-700 bg-white/50 rounded-lg p-2">
                      {snack.name} • {snack.calories} kcal
                    </div>
                  ))}
                </div>
              ) : (
                <Button 
                  onClick={onAddSnack}
                  variant="ghost" 
                  size="sm"
                  className="text-turmeric-600 hover:text-turmeric-700 hover:bg-turmeric-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une collation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Actions du plan */}
        <div className="flex gap-3 pt-4 border-t border-linen-200">
          <Button 
            variant="nutrition" 
            className="flex-1"
            leftIcon={<Target className="h-4 w-4" />}
          >
            Modifier le plan
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Dupliquer
          </Button>
        </div>
      </CardContent>
    </NutritionCard>
  )
}

export default MealPlanCard