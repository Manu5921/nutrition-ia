import * as React from "react"
import { NutritionCard, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Clock, 
  Users, 
  Flame, 
  Heart, 
  ChefHat, 
  Star, 
  Zap,
  Apple,
  Wheat,
  Fish
} from "lucide-react"

// Utilitaires pour RecipeCard
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 1 
  }).format(num)
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-success-600"
  if (score >= 60) return "text-turmeric-600"
  if (score >= 40) return "text-warning-600"
  return "text-danger-600"
}

const getScoreLevel = (score: number): string => {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Bon"
  if (score >= 40) return "Moyen"
  return "À améliorer"
}

const getFoodIcon = (tag: string): string => {
  const icons: Record<string, string> = {
    "végétarien": "🥬",
    "végan": "🌱", 
    "sans gluten": "🌾",
    "riche en oméga-3": "🐟",
    "anti-inflammatoire": "🔥",
    "detox": "💚",
    "protéiné": "💪",
    "épicé": "🌶️",
    "méditerranéen": "🫒",
    "asiatique": "🥢"
  }
  return icons[tag.toLowerCase()] || "🍽️"
}

interface RecipeCardProps {
  recipe: {
    id: string
    name: string
    description: string
    image?: string
    cookingTime: number // en minutes
    servings: number
    calories: number
    antiInflammatoryScore: number
    difficulty: 'facile' | 'moyen' | 'difficile'
    tags: string[]
    ingredients: Array<{
      name: string
      quantity: number
      unit: string
    }>
    nutrition: {
      proteins: number
      carbs: number
      fats: number
      fiber: number
      omega3: number
    }
  }
  onSave?: (recipeId: string) => void
  onView?: (recipeId: string) => void
  saved?: boolean
  className?: string
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSave,
  onView,
  saved = false,
  className
}) => {
  const scoreColor = getScoreColor(recipe.antiInflammatoryScore)
  const scoreLevel = getScoreLevel(recipe.antiInflammatoryScore)
  
  const difficultyConfig = {
    facile: { color: 'bg-success-100 text-success-700', icon: '👍' },
    moyen: { color: 'bg-warning-100 text-warning-700', icon: '👌' },
    difficile: { color: 'bg-danger-100 text-danger-700', icon: '💪' }
  }

  return (
    <NutritionCard 
      variant="recipe" 
      className={cn(
        "group hover:scale-[1.02] transition-all duration-300 animate-fade-in hover:shadow-glow container-type-inline-size", 
        className
      )}
    >
      {/* Image de la recette avec overlay moderne */}
      {recipe.image && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img 
            src={recipe.image} 
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 group-hover:brightness-110"
            loading="lazy"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
          
          {/* Score anti-inflammatoire */}
          <div className="absolute top-3 right-3">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-soft transition-all duration-300",
              recipe.antiInflammatoryScore >= 80 ? "bg-success-100/90 text-success-700 border-success-200" :
              recipe.antiInflammatoryScore >= 60 ? "bg-turmeric-100/90 text-turmeric-700 border-turmeric-200" :
              recipe.antiInflammatoryScore >= 40 ? "bg-warning-100/90 text-warning-700 border-warning-200" : 
              "bg-danger-100/90 text-danger-700 border-danger-200"
            )}>
              <Star className="inline h-3 w-3 mr-1" />
              {recipe.antiInflammatoryScore}/100
            </div>
          </div>
          
          {/* Badge difficulté */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md border shadow-soft",
              difficultyConfig[recipe.difficulty].color,
              "border-white/20"
            )}>
              {difficultyConfig[recipe.difficulty].icon} {recipe.difficulty}
            </div>
          </div>

          {/* Indicateur favori */}
          {saved && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-danger-500/90 backdrop-blur-md rounded-full p-1.5 shadow-soft">
                <Heart className="h-3 w-3 text-white fill-current" />
              </div>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-turmeric-600 transition-colors">
              {recipe.name}
            </CardTitle>
            <p className="text-sm text-sage-600 mt-1 line-clamp-2">
              {recipe.description}
            </p>
          </div>
          <button
            onClick={() => onSave?.(recipe.id)}
            className={cn(
              "p-2 rounded-full transition-colors",
              saved 
                ? "text-danger-600 hover:text-danger-700 bg-danger-50" 
                : "text-sage-400 hover:text-danger-600 hover:bg-danger-50"
            )}
            aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={cn("h-5 w-5", saved && "fill-current")} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Informations pratiques avec container queries */}
        <div className="grid grid-cols-3 gap-3 container-md:gap-4">
          <div className="flex items-center gap-2 text-sm text-sage-600 group/info hover:text-sage-800 transition-colors">
            <div className="p-1.5 rounded-lg bg-sage-100 group-hover/info:bg-sage-200 transition-colors">
              <Clock className="h-4 w-4" />
            </div>
            <span className="font-medium">{recipe.cookingTime} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sage-600 group/info hover:text-sage-800 transition-colors">
            <div className="p-1.5 rounded-lg bg-turmeric-100 group-hover/info:bg-turmeric-200 transition-colors">
              <Users className="h-4 w-4" />
            </div>
            <span className="font-medium">{recipe.servings} pers.</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sage-600 group/info hover:text-sage-800 transition-colors">
            <div className="p-1.5 rounded-lg bg-danger-100 group-hover/info:bg-danger-200 transition-colors">
              <Flame className="h-4 w-4" />
            </div>
            <span className="font-medium">{recipe.calories} kcal</span>
          </div>
        </div>

        {/* Score anti-inflammatoire amélioré */}
        <div className="bg-gradient-to-br from-linen-50 to-sage-50 rounded-2xl p-4 border border-linen-200 shadow-inner-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sage-100">
                <Zap className="h-4 w-4 text-sage-600" />
              </div>
              <span className="text-sm font-semibold text-sage-800">Score Anti-Inflammatoire</span>
            </div>
            <span className={cn("text-sm font-bold px-2 py-1 rounded-lg", scoreColor)}>
              {scoreLevel}
            </span>
          </div>
          <div className="w-full bg-linen-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={cn(
                "h-2.5 rounded-full transition-all duration-1000 ease-out relative",
                recipe.antiInflammatoryScore >= 80 ? "bg-gradient-to-r from-success-500 to-success-600" :
                recipe.antiInflammatoryScore >= 60 ? "bg-gradient-to-r from-turmeric-500 to-turmeric-600" :
                recipe.antiInflammatoryScore >= 40 ? "bg-gradient-to-r from-warning-500 to-warning-600" : 
                "bg-gradient-to-r from-danger-500 to-danger-600"
              )}
              style={{ width: `${recipe.antiInflammatoryScore}%` }}
            >
              {recipe.antiInflammatoryScore >= 80 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse-soft"></div>
              )}
            </div>
          </div>
        </div>

        {/* Valeurs nutritionnelles clés avec icônes */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-2 rounded-lg bg-linen-50">
            <div className="flex items-center gap-2">
              <Wheat className="h-4 w-4 text-turmeric-600" />
              <span className="text-sage-600 font-medium">Protéines</span>
            </div>
            <span className="font-bold text-sage-800 tabular-nums">{formatNumber(recipe.nutrition.proteins)}g</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-linen-50">
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4 text-success-600" />
              <span className="text-sage-600 font-medium">Fibres</span>
            </div>
            <span className="font-bold text-sage-800 tabular-nums">{formatNumber(recipe.nutrition.fiber)}g</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-linen-50">
            <div className="flex items-center gap-2">
              <Fish className="h-4 w-4 text-blue-600" />
              <span className="text-sage-600 font-medium">Oméga-3</span>
            </div>
            <span className="font-bold text-sage-800 tabular-nums">{formatNumber(recipe.nutrition.omega3)}g</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-linen-50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning-600" />
              <span className="text-sage-600 font-medium">Glucides</span>
            </div>
            <span className="font-bold text-sage-800 tabular-nums">{formatNumber(recipe.nutrition.carbs)}g</span>
          </div>
        </div>

        {/* Tags avec animations */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className={cn(
                "text-xs transition-all duration-300 hover:scale-105",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="mr-1">{getFoodIcon(tag)}</span>
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs hover:bg-linen-50 transition-colors cursor-help"
              title={`Autres tags: ${recipe.tags.slice(3).join(', ')}`}
            >
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          onClick={() => onView?.(recipe.id)}
          className="w-full group/btn"
          variant="nutrition"
          leftIcon={<ChefHat className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />}
        >
          Voir la recette
        </Button>
      </CardFooter>
    </NutritionCard>
  )
}

export default RecipeCard