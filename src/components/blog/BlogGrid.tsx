import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  readTime: string
}

interface BlogGridProps {
  posts: BlogPost[]
}

export const BlogGrid = ({ posts }: BlogGridProps) => {
  // Articles de démonstration
  const defaultPosts: BlogPost[] = [
    {
      slug: "alimentation-anti-inflammatoire-guide-complet",
      title: "Alimentation anti-inflammatoire : Guide complet pour débutants",
      excerpt: "Découvrez les principes fondamentaux d'une alimentation qui combat l'inflammation et améliore votre santé.",
      date: "2024-01-15",
      tags: ["anti-inflammatoire", "nutrition", "santé"],
      readTime: "8 min"
    },
    {
      slug: "10-aliments-anti-inflammatoires-incontournables",
      title: "10 aliments anti-inflammatoires à intégrer dès aujourd'hui",
      excerpt: "Une liste pratique des meilleurs aliments pour réduire l'inflammation dans votre corps.",
      date: "2024-01-10",
      tags: ["aliments", "liste", "pratique"],
      readTime: "5 min"
    },
    {
      slug: "recettes-omega3-faciles-rapides",
      title: "5 recettes riches en oméga-3 faciles et rapides",
      excerpt: "Des idées de repas délicieux et nutritifs pour augmenter votre apport en acides gras essentiels.",
      date: "2024-01-05",
      tags: ["recettes", "omega3", "cuisine"],
      readTime: "6 min"
    }
  ]

  const articlesToShow = posts.length > 0 ? posts : defaultPosts

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articlesToShow.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <time>{new Date(post.date).toLocaleDateString('fr-FR')}</time>
                <span>{post.readTime} de lecture</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}