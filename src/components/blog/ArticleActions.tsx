import { Button } from "@/components/ui/button"
import { Share2, Bookmark, Heart } from "lucide-react"

export const ArticleActions = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Heart className="h-4 w-4 mr-2" />
        J'aime
      </Button>
      <Button variant="outline" size="sm">
        <Bookmark className="h-4 w-4 mr-2" />
        Sauvegarder
      </Button>
      <Button variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Partager
      </Button>
    </div>
  )
}