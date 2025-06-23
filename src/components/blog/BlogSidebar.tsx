import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const BlogSidebar = () => {
  const categories = [
    "Nutrition anti-inflammatoire",
    "Recettes santé",
    "Conseils bien-être",
    "Perte de poids",
    "Suppléments"
  ]

  const popularTags = [
    "omega3", "antioxydants", "inflammation", "quinoa", "saumon", "épinards"
  ]

  return (
    <aside className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <a href="#" className="text-sm hover:text-primary transition-colors">
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}