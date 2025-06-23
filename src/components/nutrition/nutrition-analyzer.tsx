"use client"

/**
 * ANALYSEUR NUTRITIONNEL IA - COMPOSANT PRINCIPAL
 * ==============================================
 * Analyse nutritionnelle en temps réel avec scoring anti-inflammatoire
 * Patterns 2025 : React 19, TypeScript strict, shadcn/ui
 */

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/hooks/use-toast"
import { Search, Camera, Plus, X, TrendingUp, AlertCircle } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

// Types pour l'analyse nutritionnelle
interface FoodItem {
  id: string
  name: string
  quantity: number
  unit: string
  calories: number
  nutrients: {
    proteins: number
    carbs: number
    fats: number
    fiber: number
    sugar: number
    sodium: number
    omega3?: number
    antioxidants?: number
    vitamins?: Record<string, number>
    minerals?: Record<string, number>
  }
  antiInflammatoryScore: number
  tags: string[]
}

interface NutritionAnalysis {
  totalCalories: number
  macros: {
    proteins: number
    carbs: number
    fats: number
  }
  score: {
    overall: number
    antiInflammatory: number
    balance: number
    quality: number
  }
  recommendations: string[]
  warnings: string[]
}

export const NutritionAnalyzer = () => {
  // État du composant
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null)

  // Mutations tRPC
  const searchFoods = trpc.nutrition.searchFoods.useMutation()
  const analyzeNutrition = trpc.nutrition.analyze.useMutation()

  // Recherche d'aliments avec debounce
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchFoods.mutateAsync({ query })
      setSearchResults(results)
    } catch (error) {
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher cet aliment",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }, [searchFoods])

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  // Ajouter un aliment à l'analyse
  const addFood = useCallback((food: any, quantity: number = 100) => {
    const newFood: FoodItem = {
      id: `${food.id}_${Date.now()}`,
      name: food.name,
      quantity,
      unit: food.unit || "g",
      calories: Math.round((food.calories * quantity) / 100),
      nutrients: {
        proteins: Math.round((food.nutrients.proteins * quantity) / 100),
        carbs: Math.round((food.nutrients.carbs * quantity) / 100),
        fats: Math.round((food.nutrients.fats * quantity) / 100),
        fiber: Math.round((food.nutrients.fiber * quantity) / 100),
        sugar: Math.round((food.nutrients.sugar * quantity) / 100),
        sodium: Math.round((food.nutrients.sodium * quantity) / 100),
        omega3: food.nutrients.omega3 ? Math.round((food.nutrients.omega3 * quantity) / 100) : undefined,
        antioxidants: food.nutrients.antioxidants ? Math.round((food.nutrients.antioxidants * quantity) / 100) : undefined,
        vitamins: food.nutrients.vitamins || {},
        minerals: food.nutrients.minerals || {},
      },
      antiInflammatoryScore: food.antiInflammatoryScore || 5,
      tags: food.tags || []
    }

    setFoods(prev => [...prev, newFood])
    setSearchQuery("")
    setSearchResults([])
    
    toast({
      title: "Aliment ajouté",
      description: `${food.name} ajouté à votre analyse`,
    })
  }, [])

  // Supprimer un aliment
  const removeFood = useCallback((foodId: string) => {
    setFoods(prev => prev.filter(f => f.id !== foodId))
  }, [])

  // Analyser la nutrition
  const handleAnalyze = useCallback(async () => {
    if (foods.length === 0) {
      toast({
        title: "Aucun aliment",
        description: "Ajoutez au moins un aliment pour l'analyse",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeNutrition.mutateAsync({ foods })
      setAnalysis(result)
      
      toast({
        title: "Analyse terminée",
        description: "Votre profil nutritionnel a été analysé",
      })
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser votre nutrition",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [foods, analyzeNutrition])

  // Calculs pour l'affichage
  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)
  const avgAntiInflammatoryScore = foods.length > 0 
    ? foods.reduce((sum, food) => sum + food.antiInflammatoryScore, 0) / foods.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Interface de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Ajouter des aliments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Rechercher un aliment (ex: saumon, épinards, quinoa...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => addFood(food)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.calories} cal/100g
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={food.antiInflammatoryScore >= 7 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      Score: {food.antiInflammatoryScore}/10
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des aliments ajoutés */}
      {foods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aliments sélectionnés ({foods.length})</span>
              <div className="text-sm text-muted-foreground">
                Total: {totalCalories} calories
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.quantity}{food.unit} • {food.calories} cal
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={food.antiInflammatoryScore >= 7 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {food.antiInflammatoryScore}/10
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFood(food.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé rapide */}
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Calories totales:</span>
                  <div className="font-semibold">{totalCalories} kcal</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Score anti-inflammatoire:</span>
                  <div className={cn(
                    "font-semibold",
                    avgAntiInflammatoryScore >= 7 ? "text-green-600" : 
                    avgAntiInflammatoryScore >= 5 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {avgAntiInflammatoryScore.toFixed(1)}/10
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton d'analyse */}
            <div className="mt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || foods.length === 0}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyser ma nutrition
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats d'analyse */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analyse nutritionnelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score global */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {analysis.score.overall}/100
              </div>
              <div className="text-muted-foreground">Score nutritionnel global</div>
            </div>

            {/* Détails des scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-semibold mb-1">
                  {analysis.score.antiInflammatory}
                </div>
                <div className="text-sm text-muted-foreground">
                  Anti-inflammatoire
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-semibold mb-1">
                  {analysis.score.balance}
                </div>
                <div className="text-sm text-muted-foreground">
                  Équilibre
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-semibold mb-1">
                  {analysis.score.quality}
                </div>
                <div className="text-sm text-muted-foreground">
                  Qualité
                </div>
              </div>
            </div>

            {/* Recommandations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Recommandations
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Avertissements */}
            {analysis.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Points d'attention
                </h4>
                <ul className="space-y-2">
                  {analysis.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NutritionAnalyzer