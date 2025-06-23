import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Plus, 
  Camera, 
  Calculator,
  Target,
  Calendar,
  MessageCircle,
  Search,
  ShoppingCart,
  Download,
  Share2,
  Bell
} from "lucide-react"
import Link from "next/link"

interface QuickAction {
  id: string
  label: string
  description: string
  href: string
  icon: React.ElementType
  color: string
  bgColor: string
  badge?: string
  premium?: boolean
}

interface QuickActionsCardProps {
  userPlan?: "free" | "premium"
  recentActions?: string[]
  className?: string
}

export const QuickActionsCard = ({ 
  userPlan = "free",
  recentActions = [],
  className 
}: QuickActionsCardProps) => {
  const actions: QuickAction[] = [
    {
      id: "add-meal",
      label: "Ajouter un repas",
      description: "Enregistrer votre dernier repas",
      href: "/dashboard/nutrition/ajouter",
      icon: Plus,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100"
    },
    {
      id: "scan-food",
      label: "Scanner un aliment",
      description: "Analyser avec l'appareil photo",
      href: "/dashboard/nutrition/scanner",
      icon: Camera,
      color: "text-green-600", 
      bgColor: "bg-green-50 hover:bg-green-100",
      badge: "IA",
      premium: true
    },
    {
      id: "calculate-needs",
      label: "Calculer mes besoins",
      description: "Besoins nutritionnels personnalisés",
      href: "/dashboard/nutrition/calculateur",
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100"
    },
    {
      id: "set-goals",
      label: "Définir objectifs",
      description: "Personnaliser vos cibles",
      href: "/dashboard/objectifs",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100"
    },
    {
      id: "plan-week",
      label: "Planifier la semaine",
      description: "Créer un plan de repas",
      href: "/dashboard/plans/nouveau",
      icon: Calendar,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 hover:bg-cyan-100",
      premium: true
    },
    {
      id: "ai-chat",
      label: "Chat nutritionnel",
      description: "Discuter avec l'IA nutrition",
      href: "/dashboard/chat",
      icon: MessageCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
      badge: "IA",
      premium: true
    },
    {
      id: "search-recipes",
      label: "Chercher recettes",
      description: "Trouver des recettes adaptées",
      href: "/dashboard/recettes/recherche",
      icon: Search,
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100"
    },
    {
      id: "shopping-list",
      label: "Liste de courses",
      description: "Générer automatiquement",
      href: "/dashboard/courses",
      icon: ShoppingCart,
      color: "text-teal-600",
      bgColor: "bg-teal-50 hover:bg-teal-100",
      premium: true
    }
  ]

  // Actions rapides pour utilisateurs gratuits vs premium
  const availableActions = userPlan === "premium" 
    ? actions 
    : actions.filter(action => !action.premium).slice(0, 6)

  const premiumActions = actions.filter(action => action.premium)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Actions rapides
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Vos outils nutrition en un clic
            </p>
          </div>
          {userPlan === "free" && premiumActions.length > 0 && (
            <Link href="/dashboard/abonnement">
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Débloquer tout
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Actions principales */}
        <div className="grid grid-cols-2 gap-3">
          {availableActions.map((action) => {
            const Icon = action.icon
            
            return (
              <Link key={action.id} href={action.href}>
                <div className={`
                  p-4 rounded-lg border-2 border-transparent transition-all duration-200 cursor-pointer
                  ${action.bgColor} hover:border-gray-200 hover:shadow-sm
                  ${recentActions.includes(action.id) ? 'ring-2 ring-primary/20' : ''}
                `}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white/80 ${action.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {action.label}
                        </h4>
                        {action.badge && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Actions premium pour utilisateurs gratuits */}
        {userPlan === "free" && premiumActions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Fonctionnalités Premium</h4>
              <Badge className="text-xs bg-gradient-to-r from-primary to-primary/80">
                Premium
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {premiumActions.slice(0, 2).map((action) => {
                const Icon = action.icon
                
                return (
                  <Link key={action.id} href="/dashboard/abonnement">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 opacity-75 hover:opacity-90 transition-opacity cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-white/80">
                          <Icon className={`h-3 w-3 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {action.label}
                            </span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              Premium
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions secondaires */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700">Autres actions</h4>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/rapports">
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Exporter données
              </Button>
            </Link>
            
            <Link href="/dashboard/partage">
              <Button variant="outline" size="sm" className="text-xs">
                <Share2 className="h-3 w-3 mr-1" />
                Partager progrès
              </Button>
            </Link>
            
            <Button variant="outline" size="sm" className="text-xs">
              <Bell className="h-3 w-3 mr-1" />
              Rappels
            </Button>
          </div>
        </div>

        {/* Tip du jour */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-yellow-100 rounded">
              <Target className="h-3 w-3 text-yellow-600" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-yellow-800 mb-1">
                💡 Tip du jour
              </h5>
              <p className="text-xs text-yellow-700 leading-relaxed">
                Commencez votre journée par un verre d'eau avec du citron pour stimuler votre système digestif et réduire l'inflammation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}