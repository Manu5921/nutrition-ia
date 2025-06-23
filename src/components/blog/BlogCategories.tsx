import { Badge } from "@/components/ui/badge"

interface BlogCategoriesProps {
  categories?: string[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}

export const BlogCategories = ({ 
  categories = [],
  activeCategory = "all",
  onCategoryChange 
}: BlogCategoriesProps) => {
  const defaultCategories = [
    "Tous les articles",
    "Nutrition anti-inflammatoire", 
    "Recettes santé",
    "Conseils bien-être",
    "Perte de poids",
    "Suppléments"
  ]

  const categoriesToShow = categories.length > 0 ? categories : defaultCategories

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {categoriesToShow.map((category) => (
        <Badge
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => onCategoryChange?.(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  )
}