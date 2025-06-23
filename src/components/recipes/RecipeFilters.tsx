"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Filter,
  X,
  Clock,
  Users,
  ChefHat,
  Heart,
  Apple,
  Leaf
} from "lucide-react"

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface RecipeFiltersProps {
  onFiltersChange?: (filters: any) => void
  className?: string
}

export const RecipeFilters = ({ onFiltersChange, className }: RecipeFiltersProps) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const filterCategories = {
    difficulty: {
      label: "Difficulté",
      icon: ChefHat,
      options: [
        { id: "facile", label: "Facile", count: 45 },
        { id: "moyen", label: "Moyen", count: 32 },
        { id: "difficile", label: "Difficile", count: 18 }
      ]
    },
    time: {
      label: "Temps de préparation",
      icon: Clock,
      options: [
        { id: "0-15", label: "Moins de 15 min", count: 28 },
        { id: "15-30", label: "15-30 min", count: 42 },
        { id: "30-60", label: "30-60 min", count: 35 },
        { id: "60+", label: "Plus d'1 heure", count: 12 }
      ]
    },
    mealType: {
      label: "Type de repas",
      icon: Apple,
      options: [
        { id: "breakfast", label: "Petit-déjeuner", count: 25 },
        { id: "lunch", label: "Déjeuner", count: 38 },
        { id: "dinner", label: "Dîner", count: 42 },
        { id: "snack", label: "Collation", count: 16 }
      ]
    },
    diet: {
      label: "Régime alimentaire",
      icon: Leaf,
      options: [
        { id: "vegetarian", label: "Végétarien", count: 34 },
        { id: "vegan", label: "Vegan", count: 22 },
        { id: "gluten-free", label: "Sans gluten", count: 28 },
        { id: "dairy-free", label: "Sans lactose", count: 19 },
        { id: "anti-inflammatory", label: "Anti-inflammatoire", count: 67 }
      ]
    },
    score: {
      label: "Score anti-inflammatoire",
      icon: Heart,
      options: [
        { id: "8+", label: "Excellent (8+)", count: 34 },
        { id: "6-8", label: "Très bon (6-8)", count: 28 },
        { id: "4-6", label: "Bon (4-6)", count: 15 },
        { id: "0-4", label: "À améliorer (<4)", count: 8 }
      ]
    }
  }

  const handleFilterToggle = (category: string, filterId: string) => {
    setActiveFilters(prev => {
      const categoryFilters = prev[category] || []
      const newFilters = categoryFilters.includes(filterId)
        ? categoryFilters.filter(id => id !== filterId)
        : [...categoryFilters, filterId]
      
      const updated = {
        ...prev,
        [category]: newFilters.length > 0 ? newFilters : undefined
      }
      
      // Nettoyer les catégories vides
      Object.keys(updated).forEach(key => {
        if (!updated[key]) delete updated[key]
      })
      
      onFiltersChange?.(updated)
      return updated
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    onFiltersChange?.({})
  }

  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).reduce((sum, filters) => sum + (filters?.length || 0), 0)
  }

  const activeCount = getActiveFiltersCount()

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* En-tête des filtres */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Filtres</span>
            {activeCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Effacer
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? "Réduire" : "Plus de filtres"}
            </Button>
          </div>
        </div>

        {/* Filtres rapides (toujours visibles) */}
        <div className="space-y-4">
          {/* Difficulté */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {filterCategories.difficulty.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterCategories.difficulty.options.map((option) => {
                const isActive = activeFilters.difficulty?.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterToggle("difficulty", option.id)}
                    className="text-xs"
                  >
                    {option.label}
                    <span className="ml-1 text-xs opacity-70">({option.count})</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Temps de préparation */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {filterCategories.time.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterCategories.time.options.map((option) => {
                const isActive = activeFilters.time?.includes(option.id)
                return (
                  <Button
                    key={option.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterToggle("time", option.id)}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {option.label}
                    <span className="ml-1 text-xs opacity-70">({option.count})</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filtres avancés (extensibles) */}
        {isExpanded && (
          <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
            {/* Type de repas */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {filterCategories.mealType.label}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {filterCategories.mealType.options.map((option) => {
                  const isActive = activeFilters.mealType?.includes(option.id)
                  return (
                    <Button
                      key={option.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterToggle("mealType", option.id)}
                      className="text-xs justify-start"
                    >
                      {option.label}
                      <span className="ml-auto text-xs opacity-70">({option.count})</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Régime alimentaire */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {filterCategories.diet.label}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {filterCategories.diet.options.map((option) => {
                  const isActive = activeFilters.diet?.includes(option.id)
                  return (
                    <Button
                      key={option.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterToggle("diet", option.id)}
                      className="text-xs justify-start"
                    >
                      <Leaf className="h-3 w-3 mr-2" />
                      {option.label}
                      <span className="ml-auto text-xs opacity-70">({option.count})</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Score anti-inflammatoire */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {filterCategories.score.label}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {filterCategories.score.options.map((option) => {
                  const isActive = activeFilters.score?.includes(option.id)
                  return (
                    <Button
                      key={option.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterToggle("score", option.id)}
                      className="text-xs justify-start"
                    >
                      <Heart className="h-3 w-3 mr-2" />
                      {option.label}
                      <span className="ml-auto text-xs opacity-70">({option.count})</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filtres actifs */}
        {activeCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Filtres actifs</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([category, filters]) =>
                filters?.map((filterId) => {
                  const categoryData = filterCategories[category as keyof typeof filterCategories]
                  const option = categoryData.options.find(opt => opt.id === filterId)
                  if (!option) return null
                  
                  return (
                    <Badge
                      key={`${category}-${filterId}`}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-red-100"
                      onClick={() => handleFilterToggle(category, filterId)}
                    >
                      {option.label}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )
                })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}