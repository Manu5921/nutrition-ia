"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  Calendar,
  Target,
  TrendingUp,
  Heart
} from "lucide-react"

interface DashboardHeaderProps {
  userName?: string
  currentStreak?: number
  todayScore?: number
  hasNotifications?: boolean
}

export const DashboardHeader = ({
  userName = "Utilisateur",
  currentStreak = 0,
  todayScore = 0,
  hasNotifications = false
}: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { color: "bg-purple-500", icon: "🏆", text: "Expert" }
    if (streak >= 14) return { color: "bg-blue-500", icon: "🔥", text: "En feu" }
    if (streak >= 7) return { color: "bg-green-500", icon: "⭐", text: "Excellent" }
    if (streak >= 3) return { color: "bg-yellow-500", icon: "💪", text: "Motivé" }
    return { color: "bg-gray-500", icon: "🌱", text: "Débutant" }
  }

  const streakBadge = getStreakBadge(currentStreak)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Section Gauche - Salutation et Stats */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {userName} !
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Continuez votre parcours nutritionnel anti-inflammatoire
            </p>
          </div>

          {/* Stats rapides */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Score du jour */}
            <div className={`px-3 py-2 rounded-lg border ${getScoreColor(todayScore)}`}>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <div>
                  <div className="text-xs font-medium opacity-75">Score du jour</div>
                  <div className="text-sm font-bold">{todayScore}/100</div>
                </div>
              </div>
            </div>

            {/* Série en cours */}
            {currentStreak > 0 && (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{streakBadge.icon}</span>
                  <div>
                    <div className="text-xs text-gray-600">{streakBadge.text}</div>
                    <div className="text-sm font-bold text-gray-900">
                      {currentStreak} jours
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Droite - Recherche et Actions */}
        <div className="flex items-center space-x-4">
          {/* Barre de recherche */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une recette, un aliment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            {/* Objectifs du jour */}
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Calendar className="h-4 w-4 mr-2" />
              Objectifs
            </Button>

            {/* Progression */}
            <Button variant="outline" size="sm" className="hidden md:flex">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progrès
            </Button>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Button>

            {/* Paramètres */}
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Profil */}
            <Button variant="outline" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Barre de recherche mobile */}
      <div className="lg:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats mobiles */}
      <div className="md:hidden mt-4 flex items-center justify-center space-x-4">
        <div className={`px-3 py-2 rounded-lg border ${getScoreColor(todayScore)}`}>
          <div className="text-center">
            <div className="text-xs font-medium opacity-75">Score</div>
            <div className="text-sm font-bold">{todayScore}/100</div>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
            <div className="text-center">
              <div className="text-lg">{streakBadge.icon}</div>
              <div className="text-xs text-gray-600">{currentStreak} jours</div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}