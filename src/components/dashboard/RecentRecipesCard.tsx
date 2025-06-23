import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChefHat, 
  Clock, 
  Heart, 
  Star,
  Bookmark,
  Plus,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Recipe {
  id: string
  name: string
  slug: string
  imageUrl?: string
  prepTime: number
  difficulty: "facile" | "moyen" | "difficile"
  antiInflammatoryScore: number
  rating: number
  isBookmarked?: boolean
  lastCooked?: string
}

interface RecentRecipesCardProps {
  recipes?: Recipe[]
  isLoading?: boolean
  showType?: "recent" | "favorites" | "recommended"
}

const difficultyColors = {
  facile: "bg-green-100 text-green-800",
  moyen: "bg-yellow-100 text-yellow-800", 
  difficile: "bg-red-100 text-red-800"
}

export const RecentRecipesCard = ({ 
  recipes = [],
  isLoading = false,
  showType = "recent"
}: RecentRecipesCardProps) => {
  // Recettes de démonstration
  const defaultRecipes: Recipe[] = [
    {
      id: "1",
      name: "Saumon grillé au curcuma et légumes verts",
      slug: "saumon-grille-curcuma-legumes",
      imageUrl: "/images/recipes/saumon-curcuma.jpg",
      prepTime: 25,
      difficulty: "facile",
      antiInflammatoryScore: 9.2,
      rating: 4.8,
      isBookmarked: true,
      lastCooked: "2024-01-20"
    },
    {
      id: "2", 
      name: "Bowl de quinoa aux myrtilles et noix",
      slug: "bowl-quinoa-myrtilles-noix",
      imageUrl: "/images/recipes/bowl-quinoa.jpg",
      prepTime: 15,
      difficulty: "facile",
      antiInflammatoryScore: 8.7,
      rating: 4.6,
      isBookmarked: false,
      lastCooked: "2024-01-18"
    },
    {
      id: "3",
      name: "Curry de lentilles au gingembre",
      slug: "curry-lentilles-gingembre", 
      imageUrl: "/images/recipes/curry-lentilles.jpg",
      prepTime: 35,
      difficulty: "moyen",
      antiInflammatoryScore: 8.9,
      rating: 4.7,
      isBookmarked: true,
      lastCooked: "2024-01-15"
    }
  ]

  const recipesToShow = recipes.length > 0 ? recipes : defaultRecipes

  const titles = {
    recent: "Recettes récentes",
    favorites: "Mes favoris",
    recommended: "Recommandées pour vous"
  }

  const descriptions = {
    recent: "Vos dernières recettes cuisinées",
    favorites: "Vos recettes préférées sauvegardées", 
    recommended: "Sélectionnées selon vos goûts"
  }

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
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recipesToShow.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune recette récente
              </h3>
              <p className="text-gray-600 mb-4">
                Découvrez nos recettes anti-inflammatoires et commencez à cuisiner sainement.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/dashboard/recettes">
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Découvrir les recettes
                  </Button>
                </Link>
                <Link href="/dashboard/recettes/favorites">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Mes favoris
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
              <ChefHat className="h-5 w-5 text-primary" />
              {titles[showType]}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {descriptions[showType]}
            </p>
          </div>
          <Link href="/dashboard/recettes">
            <Button variant="outline" size="sm">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {recipesToShow.slice(0, 3).map((recipe) => (
          <div 
            key={recipe.id}
            className="group cursor-pointer"
          >
            <Link href={`/dashboard/recettes/${recipe.slug}`}>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Image de la recette */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {recipe.imageUrl ? (
                    <Image
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badge score anti-inflammatoire */}
                  <div className="absolute top-1 right-1">
                    <Badge 
                      variant={recipe.antiInflammatoryScore >= 8.5 ? "default" : "secondary"}
                      className="text-xs px-1.5 py-0.5"
                    >
                      {recipe.antiInflammatoryScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>

                {/* Informations de la recette */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {recipe.name}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prepTime} min
                        </span>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${difficultyColors[recipe.difficulty]}`}
                        >
                          {recipe.difficulty}
                        </Badge>

                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {recipe.rating.toFixed(1)}
                        </span>
                      </div>

                      {recipe.lastCooked && showType === "recent" && (
                        <p className="text-xs text-gray-400 mt-1">
                          Cuisiné le {new Date(recipe.lastCooked).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          // Toggle bookmark
                        }}
                      >
                        <Bookmark 
                          className={`h-4 w-4 ${recipe.isBookmarked ? 'fill-current text-primary' : 'text-gray-400'}`} 
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          // Toggle favorite
                        }}
                      >
                        <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Actions en bas de carte */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link href="/dashboard/recettes/nouvelle">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une recette
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Link href="/dashboard/recettes/favorites">
              <Button variant="ghost" size="sm">
                Mes favoris
              </Button>
            </Link>
            <Link href="/dashboard/recettes">
              <Button size="sm">
                Toutes les recettes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}