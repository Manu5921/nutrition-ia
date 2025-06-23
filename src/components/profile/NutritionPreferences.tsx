"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Heart,
  Target,
  Apple,
  Zap,
  Droplets,
  Clock,
  Utensils,
  Leaf,
  AlertTriangle,
  Plus,
  X,
  Save,
  RefreshCw
} from "lucide-react"

interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  water: number
}

interface MealPreferences {
  mealsPerDay: number
  cookingTime: number
  spiceLevel: number
  antiInflammatoryFocus: boolean
  organicPreference: boolean
  localProducePreference: boolean
}

interface NutritionPreferencesProps {
  className?: string
}

export const NutritionPreferences = ({ className }: NutritionPreferencesProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [customAllergy, setCustomAllergy] = useState("")
  
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 120,
    carbs: 250,
    fats: 80,
    fiber: 25,
    water: 2000
  })

  const [mealPrefs, setMealPrefs] = useState<MealPreferences>({
    mealsPerDay: 3,
    cookingTime: 30,
    spiceLevel: 3,
    antiInflammatoryFocus: true,
    organicPreference: false,
    localProducePreference: true
  })

  const [favoriteIngredients, setFavoriteIngredients] = useState<string[]>([
    "Saumon",
    "Avocat",
    "Quinoa",
    "Epinards",
    "Myrtilles"
  ])

  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([
    "Brocolis",
    "Champignons"
  ])

  const [specificAllergies, setSpecificAllergies] = useState<string[]>([
    "Arachides",
    "Crustacés"
  ])

  const commonIngredients = [
    "Saumon", "Thon", "Poulet", "Boeuf", "Tofu", "Lentilles", "Quinoa", "Riz complet",
    "Avocat", "Epinards", "Kale", "Brocolis", "Courgettes", "Tomates", "Poivrons",
    "Myrtilles", "Fraises", "Bananes", "Pommes", "Noix", "Amandes", "Graines de chia",
    "Huile d'olive", "Curcuma", "Gingembre", "Ail", "Oignon"
  ]

  const handleGoalChange = (goal: keyof NutritionGoals, value: number[]) => {
    setNutritionGoals(prev => ({ ...prev, [goal]: value[0] }))
  }

  const handleMealPrefChange = (pref: keyof MealPreferences, value: number[] | boolean) => {
    setMealPrefs(prev => ({ 
      ...prev, 
      [pref]: Array.isArray(value) ? value[0] : value 
    }))
  }

  const handleIngredientToggle = (ingredient: string, type: 'favorite' | 'disliked') => {
    if (type === 'favorite') {
      setFavoriteIngredients(prev => 
        prev.includes(ingredient) 
          ? prev.filter(i => i !== ingredient)
          : [...prev, ingredient]
      )
      // Retirer des non-aimés si ajouté aux favoris
      setDislikedIngredients(prev => prev.filter(i => i !== ingredient))
    } else {
      setDislikedIngredients(prev => 
        prev.includes(ingredient) 
          ? prev.filter(i => i !== ingredient)
          : [...prev, ingredient]
      )
      // Retirer des favoris si ajouté aux non-aimés
      setFavoriteIngredients(prev => prev.filter(i => i !== ingredient))
    }
  }

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !specificAllergies.includes(customAllergy.trim())) {
      setSpecificAllergies(prev => [...prev, customAllergy.trim()])
      setCustomAllergy("")
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    setSpecificAllergies(prev => prev.filter(a => a !== allergy))
  }

  const calculateMacroPercentages = () => {
    const { calories, protein, carbs, fats } = nutritionGoals
    const proteinCals = protein * 4
    const carbsCals = carbs * 4
    const fatsCals = fats * 9
    const total = proteinCals + carbsCals + fatsCals
    
    return {
      protein: Math.round((proteinCals / total) * 100),
      carbs: Math.round((carbsCals / total) * 100),
      fats: Math.round((fatsCals / total) * 100)
    }
  }

  const macroPercentages = calculateMacroPercentages()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulation sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000))
      // TODO: Implémenter avec tRPC
      console.log("Nutrition preferences saved:", {
        nutritionGoals,
        mealPrefs,
        favoriteIngredients,
        dislikedIngredients,
        specificAllergies
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    // Réinitialiser aux valeurs par défaut
    setNutritionGoals({
      calories: 2000,
      protein: 120,
      carbs: 250,
      fats: 80,
      fiber: 25,
      water: 2000
    })
    setMealPrefs({
      mealsPerDay: 3,
      cookingTime: 30,
      spiceLevel: 3,
      antiInflammatoryFocus: true,
      organicPreference: false,
      localProducePreference: true
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Objectifs nutritionnels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Objectifs nutritionnels quotidiens
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Définissez vos objectifs pour une nutrition adaptée à vos besoins
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Calories
              </Label>
              <Badge variant="outline">{nutritionGoals.calories} kcal</Badge>
            </div>
            <Slider
              value={[nutritionGoals.calories]}
              onValueChange={(value) => handleGoalChange("calories", value)}
              min={1200}
              max={4000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1200 kcal</span>
              <span>4000 kcal</span>
            </div>
          </div>

          {/* Macronutriments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Protéines</Label>
                <div className="text-right">
                  <div className="text-sm font-medium">{nutritionGoals.protein}g</div>
                  <div className="text-xs text-muted-foreground">{macroPercentages.protein}%</div>
                </div>
              </div>
              <Slider
                value={[nutritionGoals.protein]}
                onValueChange={(value) => handleGoalChange("protein", value)}
                min={50}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Glucides</Label>
                <div className="text-right">
                  <div className="text-sm font-medium">{nutritionGoals.carbs}g</div>
                  <div className="text-xs text-muted-foreground">{macroPercentages.carbs}%</div>
                </div>
              </div>
              <Slider
                value={[nutritionGoals.carbs]}
                onValueChange={(value) => handleGoalChange("carbs", value)}
                min={50}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Lipides</Label>
                <div className="text-right">
                  <div className="text-sm font-medium">{nutritionGoals.fats}g</div>
                  <div className="text-xs text-muted-foreground">{macroPercentages.fats}%</div>
                </div>
              </div>
              <Slider
                value={[nutritionGoals.fats]}
                onValueChange={(value) => handleGoalChange("fats", value)}
                min={20}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Fibres et eau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Apple className="h-4 w-4 text-green-500" />
                  Fibres
                </Label>
                <Badge variant="outline">{nutritionGoals.fiber}g</Badge>
              </div>
              <Slider
                value={[nutritionGoals.fiber]}
                onValueChange={(value) => handleGoalChange("fiber", value)}
                min={10}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Eau
                </Label>
                <Badge variant="outline">{nutritionGoals.water}ml</Badge>
              </div>
              <Slider
                value={[nutritionGoals.water]}
                onValueChange={(value) => handleGoalChange("water", value)}
                min={1000}
                max={4000}
                step={100}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences de repas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Préférences de repas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Nombre de repas par jour</Label>
                <Badge variant="outline">{mealPrefs.mealsPerDay} repas</Badge>
              </div>
              <Slider
                value={[mealPrefs.mealsPerDay]}
                onValueChange={(value) => handleMealPrefChange("mealsPerDay", value)}
                min={2}
                max={6}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Temps de cuisine max
                </Label>
                <Badge variant="outline">{mealPrefs.cookingTime} min</Badge>
              </div>
              <Slider
                value={[mealPrefs.cookingTime]}
                onValueChange={(value) => handleMealPrefChange("cookingTime", value)}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Niveau d'épices</Label>
              <Badge variant="outline">
                {mealPrefs.spiceLevel === 1 ? "Doux" :
                 mealPrefs.spiceLevel === 2 ? "Léger" :
                 mealPrefs.spiceLevel === 3 ? "Modéré" :
                 mealPrefs.spiceLevel === 4 ? "Epicé" : "Très epicé"}
              </Badge>
            </div>
            <Slider
              value={[mealPrefs.spiceLevel]}
              onValueChange={(value) => handleMealPrefChange("spiceLevel", value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Doux</span>
              <span>Très epicé</span>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <label className="text-sm font-medium">Focus anti-inflammatoire</label>
                </div>
                <p className="text-xs text-muted-foreground">Privilégier les aliments anti-inflammatoires</p>
              </div>
              <Switch
                checked={mealPrefs.antiInflammatoryFocus}
                onCheckedChange={(checked) => handleMealPrefChange("antiInflammatoryFocus", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <label className="text-sm font-medium">Préférence bio</label>
                </div>
                <p className="text-xs text-muted-foreground">Recommander des produits biologiques</p>
              </div>
              <Switch
                checked={mealPrefs.organicPreference}
                onCheckedChange={(checked) => handleMealPrefChange("organicPreference", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Produits locaux</label>
                <p className="text-xs text-muted-foreground">Privilégier les produits de saison et locaux</p>
              </div>
              <Switch
                checked={mealPrefs.localProducePreference}
                onCheckedChange={(checked) => handleMealPrefChange("localProducePreference", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies spécifiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Allergies et intolérances spécifiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une allergie spécifique..."
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergy()}
              className="flex-1"
            />
            <Button onClick={handleAddCustomAllergy} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {specificAllergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specificAllergies.map((allergy) => (
                <Badge
                  key={allergy}
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => handleRemoveAllergy(allergy)}
                >
                  {allergy}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingrédients favoris et non-aimés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-primary" />
            Préférences d'ingrédients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Favoris */}
          <div className="space-y-3">
            <h4 className="font-medium text-green-700 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Ingrédients favoris
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant={favoriteIngredients.includes(ingredient) ? "default" : "outline"}
                  className={`cursor-pointer justify-center p-2 hover:scale-105 transition-transform ${
                    favoriteIngredients.includes(ingredient) ? "bg-green-100 text-green-800 border-green-200" : ""
                  } ${
                    dislikedIngredients.includes(ingredient) ? "opacity-50" : ""
                  }`}
                  onClick={() => handleIngredientToggle(ingredient, "favorite")}
                >
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          {/* Non-aimés */}
          <div className="space-y-3">
            <h4 className="font-medium text-red-700 flex items-center gap-2">
              <X className="h-4 w-4" />
              Ingrédients à éviter
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant={dislikedIngredients.includes(ingredient) ? "destructive" : "outline"}
                  className={`cursor-pointer justify-center p-2 hover:scale-105 transition-transform ${
                    favoriteIngredients.includes(ingredient) ? "opacity-50" : ""
                  }`}
                  onClick={() => handleIngredientToggle(ingredient, "disliked")}
                >
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Sauvegarde..." : "Sauvegarder les préférences"}
        </Button>
      </div>
    </div>
  )
}