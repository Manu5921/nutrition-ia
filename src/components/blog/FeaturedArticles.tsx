import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"

interface FeaturedArticle {
  slug: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  tags: string[]
  featured?: boolean
}

interface FeaturedArticlesProps {
  articles?: FeaturedArticle[]
  title?: string
}

export const FeaturedArticles = ({ 
  articles = [],
  title = "Articles en vedette" 
}: FeaturedArticlesProps) => {
  // Articles par défaut si aucun fourni
  const defaultArticles: FeaturedArticle[] = [
    {
      slug: "guide-complet-alimentation-anti-inflammatoire",
      title: "Guide complet de l'alimentation anti-inflammatoire",
      excerpt: "Découvrez comment transformer votre alimentation pour réduire l'inflammation et améliorer votre santé globale.",
      author: "Dr. Marie Nutrition",
      date: "2024-01-20",
      readTime: "12 min",
      tags: ["anti-inflammatoire", "guide", "santé"],
      featured: true
    },
    {
      slug: "top-10-aliments-anti-inflammatoires-2024",
      title: "Top 10 des aliments anti-inflammatoires en 2024",
      excerpt: "Notre sélection des aliments les plus puissants pour combattre l'inflammation naturellement.",
      author: "Chef Lucas Santé",
      date: "2024-01-18",
      readTime: "8 min",
      tags: ["aliments", "top-10", "nutrition"],
      featured: true
    },
    {
      slug: "recettes-omega3-delicieuses-faciles",
      title: "15 recettes riches en oméga-3 délicieuses et faciles",
      excerpt: "Des idées de repas savoureux pour augmenter naturellement votre apport en acides gras essentiels.",
      author: "Sarah Cuisine",
      date: "2024-01-15",
      readTime: "10 min",
      tags: ["recettes", "omega3", "cuisine"],
      featured: true
    }
  ]

  const articlesToShow = articles.length > 0 ? articles : defaultArticles

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Nos articles les plus populaires pour vous accompagner dans votre parcours nutritionnel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articlesToShow.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-primary/5 hover:to-primary/10">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-medium">
                      {tag}
                    </Badge>
                  ))}
                  {article.featured && (
                    <Badge className="text-xs bg-gradient-to-r from-primary to-primary/80">
                      ⭐ Vedette
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2 leading-tight">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <time className="font-medium">
                    {new Date(article.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </time>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/blog">
          <Button variant="outline" size="lg" className="mt-4">
            Voir tous les articles
          </Button>
        </Link>
      </div>
    </section>
  )
}