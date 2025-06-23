import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface ArticleNavigationProps {
  previousArticle?: {
    slug: string
    title: string
  }
  nextArticle?: {
    slug: string
    title: string
  }
}

export const ArticleNavigation = ({ previousArticle, nextArticle }: ArticleNavigationProps) => {
  return (
    <nav className="flex justify-between items-center pt-8 border-t">
      {previousArticle ? (
        <Link href={`/blog/${previousArticle.slug}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Article précédent
          </Button>
        </Link>
      ) : (
        <div />
      )}
      
      {nextArticle ? (
        <Link href={`/blog/${nextArticle.slug}`}>
          <Button variant="outline" className="flex items-center gap-2">
            Article suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}