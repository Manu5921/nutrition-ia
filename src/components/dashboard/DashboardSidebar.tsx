"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Home,
  User,
  Apple,
  Calendar,
  TrendingUp,
  BookOpen,
  Settings,
  Heart,
  Target,
  CreditCard,
  HelpCircle,
  LogOut,
  ChefHat,
  Activity
} from "lucide-react"

interface SidebarItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string | number
  premium?: boolean
}

const navigationItems: SidebarItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: Home
  },
  {
    href: "/dashboard/nutrition",
    label: "Analyse Nutrition",
    icon: Apple,
    badge: "New"
  },
  {
    href: "/dashboard/recettes",
    label: "Mes Recettes",
    icon: ChefHat
  },
  {
    href: "/dashboard/plans",
    label: "Plans de Repas",
    icon: Calendar,
    premium: true
  },
  {
    href: "/dashboard/suivi",
    label: "Suivi Progrès",
    icon: TrendingUp
  },
  {
    href: "/dashboard/objectifs",
    label: "Mes Objectifs",
    icon: Target
  }
]

const otherItems: SidebarItem[] = [
  {
    href: "/blog",
    label: "Blog Nutrition",
    icon: BookOpen
  },
  {
    href: "/dashboard/profil",
    label: "Mon Profil",
    icon: User
  },
  {
    href: "/dashboard/abonnement",
    label: "Abonnement",
    icon: CreditCard,
    badge: "Premium"
  }
]

const bottomItems: SidebarItem[] = [
  {
    href: "/dashboard/aide",
    label: "Aide & Support",
    icon: HelpCircle
  },
  {
    href: "/dashboard/parametres",
    label: "Paramètres",
    icon: Settings
  }
]

interface DashboardSidebarProps {
  userName?: string
  userPlan?: "free" | "premium"
  className?: string
}

export const DashboardSidebar = ({ 
  userName = "Utilisateur",
  userPlan = "free",
  className 
}: DashboardSidebarProps) => {
  const pathname = usePathname()

  const NavItem = ({ item }: { item: SidebarItem }) => {
    const isActive = pathname === item.href
    const isPremium = item.premium && userPlan === "free"

    return (
      <Link href={isPremium ? "/dashboard/abonnement" : item.href}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-11 px-3",
            isActive && "bg-primary text-primary-foreground shadow-sm",
            isPremium && "opacity-60 hover:opacity-80"
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          
          {item.badge && (
            <Badge 
              variant={isActive ? "secondary" : "outline"} 
              className="text-xs px-2 py-0.5"
            >
              {item.badge}
            </Badge>
          )}
          
          {isPremium && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-yellow-400 text-yellow-600">
              Premium
            </Badge>
          )}
        </Button>
      </Link>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Coach Nutrition</h2>
            <p className="text-sm text-gray-600">Anti-inflammatoire</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <div className="flex items-center gap-2">
              <Badge 
                variant={userPlan === "premium" ? "default" : "secondary"}
                className="text-xs"
              >
                {userPlan === "premium" ? "Premium" : "Gratuit"}
              </Badge>
              {userPlan === "free" && (
                <Link href="/dashboard/abonnement">
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                    Passer Premium
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Nutrition
            </h3>
            {navigationItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Autres
            </h3>
            {otherItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </nav>
      </div>

      {/* Stats rapides */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Série actuelle</span>
          </div>
          <div className="text-lg font-bold text-green-600">12 jours</div>
          <div className="text-xs text-gray-600">Continuez ainsi ! 🔥</div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  )
}