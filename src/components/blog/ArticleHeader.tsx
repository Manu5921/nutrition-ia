import { Badge } from "@/components/ui/badge"

interface ArticleHeaderProps {
  title: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  readTime?: string
}

export const ArticleHeader = ({
  title,
  excerpt,
  date,
  author = "Coach Nutritionnel IA",
  tags = [],
  readTime = "5 min"
}: ArticleHeaderProps) => {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      
      {excerpt && (
        <p className="text-lg text-muted-foreground">{excerpt}</p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Par {author}</span>
        <span>•</span>
        <time>{new Date(date).toLocaleDateString('fr-FR')}</time>
        <span>•</span>
        <span>{readTime} de lecture</span>
      </div>
    </header>
  )
}