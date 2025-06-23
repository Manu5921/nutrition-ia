import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Users, 
  Heart, 
  Star,
  BookmarkPlus,
  ChefHat,
  Flame,
  Leaf
} from "lucide-react"

interface Recipe {
  id: string
  name: string
  slug: string
  shortDescription?: string
  imageUrl?: string
  prepTime: number
  cookTime?: number
  servings: number
  difficulty: "facile" | "moyen" | "difficile"
  antiInflammatoryScore: number
  rating?: number
  ratingCount?: number
  tags?: string[]
  isBookmarked?: boolean
  author?: string
}

interface RecipeGridProps {
  recipes?: Recipe[]
  isLoading?: boolean
  emptyMessage?: string
  columns?: 2 | 3 | 4
  showBookmark?: boolean
  className?: string
}

const difficultyColors = {
  facile: "bg-green-100 text-green-800",
  moyen: "bg-yellow-100 text-yellow-800",
  difficile: "bg-red-100 text-red-800"
}

export const RecipeGrid = ({ 
  recipes = [],
  isLoading = false,
  emptyMessage = "Aucune recette trouvée",
  columns = 3,
  showBookmark = true,
  className = ""
}: RecipeGridProps) => {
  // Recettes de démonstration
  const defaultRecipes: Recipe[] = [
    {
      id: "1",
      name: "Saumon grillé au curcuma et légumes arc-en-ciel",
      slug: "saumon-grille-curcuma-legumes",
      shortDescription: "Un plat complet riche en oméga-3 et antioxydants pour réduire l'inflammation",
      imageUrl: "/images/recipes/saumon-curcuma.jpg",
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: "facile",
      antiInflammatoryScore: 9.2,
      rating: 4.8,
      ratingCount: 124,
      tags: ["anti-inflammatoire", "omega3", "proteine"],
      author: "Chef Antoine"
    },
    {
      id: "2",
      name: "Bowl de quinoa aux myrtilles et graines de chia",
      slug: "bowl-quinoa-myrtilles-chia",
      shortDescription: "Petit-déjeuner énergétique bourré d'antioxydants et de fibres",
      imageUrl: "/images/recipes/bowl-quinoa.jpg", 
      prepTime: 10,
      servings: 2,
      difficulty: "facile",
      antiInflammatoryScore: 8.7,
      rating: 4.6,
      ratingCount: 89,
      tags: ["petit-dejeuner", "antioxydants", "fibres"],
      author: "Nutritionniste Sarah"
    },
    {
      id: "3",
      name: "Curry de lentilles corail au gingembre et curcuma",
      slug: "curry-lentilles-gingembre-curcuma",
      shortDescription: "Plat réconfortant aux épices anti-inflammatoires puissantes",
      imageUrl: "/images/recipes/curry-lentilles.jpg",
      prepTime: 15,
      cookTime: 25,
      servings: 6,
      difficulty: "moyen",
      antiInflammatoryScore: 8.9,
      rating: 4.7,
      ratingCount: 156,
      tags: ["vegetarien", "epices", "proteines-vegetales"],
      author: "Chef Priya"
    },
    {
      id: "4",
      name: "Salade de kale massé à l'avocat et graines de tournesol",
      slug: "salade-kale-avocat-graines",
      shortDescription: "Salade nutritive aux super-aliments, parfaite pour le déjeuner",
      prepTime: 12,
      servings: 2,
      difficulty: "facile",
      antiInflammatoryScore: 8.4,
      rating: 4.5,
      ratingCount: 67,
      tags: ["cru", "super-aliments", "vitamines"],
      author: "Chef Verde"
    },
    {
      id: "5",
      name: "Smoothie vert détox aux épinards et gingembre",
      slug: "smoothie-vert-detox-epinards",
      shortDescription: "Boisson purifiante pour commencer la journée en beauté",
      prepTime: 5,
      servings: 1,
      difficulty: "facile",
      antiInflammatoryScore: 8.1,
      rating: 4.3,
      ratingCount: 92,
      tags: ["smoothie", "detox", "energie"],
      author: "Nutritionniste Emma"
    },
    {
      id: "6",
      name: "Poisson blanc en papillote aux herbes méditerranéennes",
      slug: "poisson-papillote-herbes",
      shortDescription: "Cuisson douce qui preserve tous les nutriments du poisson",
      prepTime: 20,
      cookTime: 18,
      servings: 4,
      difficulty: "moyen",
      antiInflammatoryScore: 8.6,
      rating: 4.4,
      ratingCount: 78,
      tags: ["poisson", "leger", "herbes"],
      author: "Chef Méditerranée"
    }
  ]

  const recipesToShow = recipes.length > 0 ? recipes : defaultRecipes

  // Loading state
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${
        columns === 4 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
        columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
        'md:grid-cols-2'
      } ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Empty state
  if (recipesToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ChefHat className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 mb-6">
          Essayez de modifier vos filtres ou explorez nos recettes recommandées.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline">
            Réinitialiser les filtres
          </Button>
          <Link href="/dashboard/recettes/recommandees">
            <Button>
              Voir les recommandées
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${
      columns === 4 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
      columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
      'md:grid-cols-2'
    } ${className}`}>
      {recipesToShow.map((recipe) => {
        const totalTime = recipe.prepTime + (recipe.cookTime || 0)
        
        return (
          <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative">
              {/* Image de la recette */}
              <div className="relative h-48 overflow-hidden">
                {recipe.imageUrl ? (
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {showBookmark && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault()
                          // Toggle bookmark
                        }}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Score anti-inflammatoire */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    className={`${
                      recipe.antiInflammatoryScore >= 8.5 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : recipe.antiInflammatoryScore >= 7
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white font-medium`}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {recipe.antiInflammatoryScore.toFixed(1)}
                  </Badge>
                </div>

                {/* Difficulté */}
                <div className="absolute bottom-4 right-4">
                  <Badge 
                    variant="secondary" 
                    className={`${difficultyColors[recipe.difficulty]} font-medium`}
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <Link href={`/dashboard/recettes/${recipe.slug}`}>
                <div className="space-y-3">
                  {/* Titre et description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe.name}
                    </h3>
                    {recipe.shortDescription && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {recipe.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="text-xs text-gray-500 ml-1">
                          +{recipe.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {totalTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings}
                      </span>
                    </div>
                    
                    {recipe.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{recipe.rating.toFixed(1)}</span>
                        {recipe.ratingCount && (
                          <span className="text-xs text-gray-500">
                            ({recipe.ratingCount})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Auteur */}
                  {recipe.author && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                      <ChefHat className="h-3 w-3" />
                      <span>Par {recipe.author}</span>
                    </div>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}