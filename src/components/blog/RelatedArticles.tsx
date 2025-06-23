import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RelatedArticle {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  date: string
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
}

export const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
  if (articles.length === 0) return null

  return (
    <section className="space-y-6">
      <h3 className="text-2xl font-semibold">Articles connexes</h3>
      
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{article.excerpt}</p>
                <time className="text-xs text-muted-foreground mt-2 block">
                  {new Date(article.date).toLocaleDateString('fr-FR')}
                </time>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}