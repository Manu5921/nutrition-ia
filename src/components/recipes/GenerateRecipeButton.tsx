"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  Wand2,
  Clock,
  Users,
  ChefHat,
  Heart,
  X,
  Plus,
  Loader2
} from "lucide-react"

interface GenerateRecipeButtonProps {
  onRecipeGenerated?: (recipe: any) => void
  userPlan?: "free" | "premium"
  className?: string
}

interface GenerationPreferences {
  ingredients: string[]
  mealType: string
  difficulty: string
  dietaryRestrictions: string[]
  maxTime: number
  servings: number
  antiInflammatoryFocus: boolean
}

export const GenerateRecipeButton = ({ 
  onRecipeGenerated,
  userPlan = "free",
  className 
}: GenerateRecipeButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [newIngredient, setNewIngredient] = useState("")
  
  const [preferences, setPreferences] = useState<GenerationPreferences>({
    ingredients: [],
    mealType: "",
    difficulty: "facile",
    dietaryRestrictions: [],
    maxTime: 30,
    servings: 4,
    antiInflammatoryFocus: true
  })

  const mealTypes = [
    { id: "breakfast", label: "Petit-déjeuner", icon: "🌅" },
    { id: "lunch", label: "Déjeuner", icon: "☀️" },
    { id: "dinner", label: "Dîner", icon: "🌙" },
    { id: "snack", label: "Collation", icon: "🍎" }
  ]

  const difficultyLevels = [
    { id: "facile", label: "Facile", desc: "10-20 min" },
    { id: "moyen", label: "Moyen", desc: "30-45 min" },
    { id: "difficile", label: "Difficile", desc: "1h+" }
  ]

  const commonRestrictions = [
    "végétarien", "vegan", "sans gluten", "sans lactose", "paléo", "cétogène"
  ]

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !preferences.ingredients.includes(newIngredient.trim())) {
      setPreferences(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }))
      setNewIngredient("")
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setPreferences(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }))
  }

  const handleGenerateRecipe = async () => {
    if (userPlan === "free") {
      // Rediriger vers l'abonnement pour les utilisateurs gratuits
      window.location.href = "/dashboard/abonnement"
      return
    }

    setIsGenerating(true)
    
    try {
      // Simuler génération IA
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Recette générée de démonstration
      const generatedRecipe = {
        id: Date.now().toString(),
        name: `Recette IA aux ${preferences.ingredients.slice(0, 2).join(' et ')}`,
        description: "Recette générée spécialement pour vous par notre IA nutritionnelle",
        ingredients: preferences.ingredients.map(ing => ({
          name: ing,
          quantity: "200g",
          unit: "g"
        })),
        instructions: [
          "Préparer tous les ingrédients",
          "Mélanger selon les proportions optimales",
          "Cuire en préservant les nutriments",
          "Servir et déguster"
        ],
        prepTime: preferences.maxTime,
        servings: preferences.servings,
        difficulty: preferences.difficulty,
        antiInflammatoryScore: 8.5,
        nutritionFacts: {
          calories: 280,
          proteins: 18,
          carbs: 32,
          fats: 12,
          fiber: 8
        },
        mealType: preferences.mealType,
        dietTags: preferences.dietaryRestrictions,
        generated: true
      }
      
      onRecipeGenerated?.(generatedRecipe)
      setShowPreferences(false)
      
    } catch (error) {
      console.error("Erreur génération recette:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (showPreferences) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <Wand2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Génération IA</h3>
                <p className="text-sm text-gray-600">Personnalisez votre recette</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Ingrédients */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Ingrédients disponibles
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Ajouter un ingrédient..."
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  className="flex-1"
                />
                <Button onClick={handleAddIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveIngredient(ingredient)}
                  >
                    {ingredient}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Type de repas */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Type de repas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mealTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={preferences.mealType === type.id ? "default" : "outline"}
                    onClick={() => setPreferences(prev => ({ ...prev, mealType: type.id }))}
                    className="h-auto p-3 flex-col gap-1"
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulté */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Niveau de difficulté
              </label>
              <div className="grid grid-cols-3 gap-2">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level.id}
                    variant={preferences.difficulty === level.id ? "default" : "outline"}
                    onClick={() => setPreferences(prev => ({ ...prev, difficulty: level.id }))}
                    className="h-auto p-3 flex-col gap-1"
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs text-gray-500">{level.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Paramètres avancés */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Temps max (minutes)
                </label>
                <Input
                  type="number"
                  value={preferences.maxTime}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    maxTime: parseInt(e.target.value) || 30 
                  }))}
                  min="5"
                  max="180"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nombre de portions
                </label>
                <Input
                  type="number"
                  value={preferences.servings}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    servings: parseInt(e.target.value) || 4 
                  }))}
                  min="1"
                  max="12"
                />
              </div>
            </div>

            {/* Options spéciales */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.antiInflammatoryFocus}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    antiInflammatoryFocus: e.target.checked 
                  }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Focus anti-inflammatoire
                </span>
                <Heart className="h-4 w-4 text-red-500" />
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleGenerateRecipe}
                disabled={isGenerating || preferences.ingredients.length === 0}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer la recette
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreferences(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button
      onClick={() => setShowPreferences(true)}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${className}`}
      size="lg"
    >
      <Wand2 className="h-4 w-4 mr-2" />
      Générer avec IA
      {userPlan === "free" && (
        <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
          Premium
        </Badge>
      )}
    </Button>
  )
}