"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  X, 
  Mic,
  Camera,
  Filter,
  TrendingUp,
  Clock,
  Heart
} from "lucide-react"

interface SearchSuggestion {
  id: string
  text: string
  type: "ingredient" | "recipe" | "category"
  count?: number
}

interface RecipeSearchProps {
  onSearch?: (query: string) => void
  onFilterToggle?: () => void
  showFilters?: boolean
  filtersCount?: number
  placeholder?: string
  className?: string
}

export const RecipeSearch = ({ 
  onSearch,
  onFilterToggle,
  showFilters = true,
  filtersCount = 0,
  placeholder = "Rechercher des recettes, ingrédients...",
  className = ""
}: RecipeSearchProps) => {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Suggestions populaires
  const popularSuggestions: SearchSuggestion[] = [
    { id: "saumon", text: "saumon", type: "ingredient", count: 23 },
    { id: "curcuma", text: "curcuma", type: "ingredient", count: 18 },
    { id: "quinoa", text: "quinoa", type: "ingredient", count: 15 },
    { id: "anti-inflammatoire", text: "anti-inflammatoire", type: "category", count: 67 },
    { id: "petit-dejeuner", text: "petit-déjeuner", type: "category", count: 25 },
    { id: "rapide", text: "recettes rapides", type: "category", count: 34 }
  ]

  // Suggestions basées sur la recherche
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])

  useEffect(() => {
    if (query.length > 1) {
      // Simuler recherche de suggestions
      const filtered = popularSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions(popularSuggestions.slice(0, 6))
      setShowSuggestions(query.length === 0)
    }
  }, [query])

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text)
  }

  const handleClear = () => {
    setQuery("")
    onSearch?.("")
    setShowSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleVoiceSearch = () => {
    // Placeholder pour recherche vocale
    setIsListening(!isListening)
    // TODO: Implémenter Web Speech API
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "ingredient":
        return "🥬"
      case "recipe":
        return "👨‍🍳"
      case "category":
        return "📂"
      default:
        return "🔍"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        {/* Barre de recherche principale */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="pl-12 pr-24 h-12 text-base"
            />
            
            {/* Actions dans la barre de recherche */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className={`h-8 w-8 p-0 hover:bg-gray-100 ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'
                }`}
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-400"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bouton de recherche */}
        <Button 
          onClick={() => handleSearch()}
          className="h-12 px-6"
          disabled={!query.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>

        {/* Bouton filtres */}
        {showFilters && (
          <Button
            variant="outline"
            onClick={onFilterToggle}
            className="h-12 px-4 relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {filtersCount > 0 && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {filtersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {query.length === 0 ? (
            /* Suggestions populaires */
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Recherches populaires</span>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                        <span className="text-gray-900">{suggestion.text}</span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-gray-500">
                          {suggestion.count} recettes
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Résultats de recherche */
            <div className="p-4">
              <div className="mb-3">
                <span className="text-sm text-gray-600">
                  Suggestions pour "{query}"
                </span>
              </div>
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{suggestion.text}</span>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-gray-500">
                            {suggestion.count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    Aucune suggestion trouvée
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch()}
                    className="mt-2"
                  >
                    Rechercher "{query}"
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Actions rapides */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recettes rapides
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Anti-inflammatoire
                </span>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="hover:text-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}