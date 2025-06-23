import * as React from "react"
import { NutritionCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Heart, Zap, Shield, Target, Apple, Leaf } from "lucide-react"

// Utilitaires pour le scoring nutritionnel
const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-success-600"
  if (score >= 60) return "text-turmeric-600"
  if (score >= 40) return "text-warning-600"
  return "text-danger-600"
}

const getScoreLevel = (score: number): string => {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Bon"
  if (score >= 40) return "Moyen"
  return "À améliorer"
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 1 
  }).format(num)
}

interface NutritionScoreProps {
  score: number
  previousScore?: number
  breakdown: {
    omega3: number
    antioxidants: number
    fiber: number
    vitamins: number
    minerals: number
    antiInflammatory: number
  }
  recommendations?: string[]
  className?: string
}

export const NutritionScore: React.FC<NutritionScoreProps> = ({
  score,
  previousScore,
  breakdown,
  recommendations = [],
  className
}) => {
  const scoreColor = getScoreColor(score)
  const scoreLevel = getScoreLevel(score)
  
  // Calcul de la tendance
  const scoreTrend = previousScore ? score - previousScore : 0
  const TrendIcon = scoreTrend > 0 ? TrendingUp : scoreTrend < 0 ? TrendingDown : Minus
  const trendColor = scoreTrend > 0 ? "text-success-600" : scoreTrend < 0 ? "text-danger-600" : "text-sage-400"

  // Configuration des icônes pour chaque catégorie avec nouvelles icônes Tailwind 4.0
  const categoryIcons = {
    omega3: Heart,
    antioxidants: Shield,
    fiber: Apple,
    vitamins: Target,
    minerals: Leaf,
    antiInflammatory: Zap
  }

  const categoryColors = {
    omega3: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 shadow-soft border border-blue-200",
    antioxidants: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 shadow-soft border border-purple-200", 
    fiber: "bg-gradient-to-br from-success-100 to-success-200 text-success-700 shadow-soft border border-success-200",
    vitamins: "bg-gradient-to-br from-turmeric-100 to-turmeric-200 text-turmeric-700 shadow-soft border border-turmeric-200",
    minerals: "bg-gradient-to-br from-sage-100 to-sage-200 text-sage-700 shadow-soft border border-sage-200",
    antiInflammatory: "bg-gradient-to-br from-warning-100 to-warning-200 text-warning-700 shadow-soft border border-warning-200"
  }

  const categoryLabels = {
    omega3: "Oméga-3",
    antioxidants: "Antioxydants",
    fiber: "Fibres",
    vitamins: "Vitamines",
    minerals: "Minéraux",
    antiInflammatory: "Anti-Inflammatoire"
  }

  return (
    <NutritionCard variant="score" className={cn("animate-fade-in", className)}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4">
          {/* Cercle de score principal avec effet glow */}
          <div className="relative inline-flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-sage-100 to-turmeric-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm scale-110"></div>
            <svg className="h-28 w-28 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
              {/* Cercle de fond */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-linen-200"
              />
              {/* Cercle de progression avec animation */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                className={cn(
                  "transition-all duration-1500 ease-out",
                  score >= 80 ? "text-success-500" :
                  score >= 60 ? "text-turmeric-500" :
                  score >= 40 ? "text-warning-500" : "text-danger-500"
                )}
                strokeLinecap="round"
                style={{
                  filter: score >= 80 ? "drop-shadow(0 0 8px rgb(34 197 94 / 0.3))" : undefined
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className={cn(
                "text-3xl font-display font-semibold animate-scale-in", 
                scoreColor
              )}>
                {Math.round(score)}
              </span>
              <span className="text-xs text-sage-600 font-medium">/ 100</span>
            </div>
          </div>
        </div>

        <CardTitle className="text-center">
          Score Nutritionnel
        </CardTitle>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={cn("text-lg font-semibold", scoreColor)}>
            {scoreLevel}
          </span>
          {previousScore && (
            <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>
                {scoreTrend > 0 ? '+' : ''}{formatNumber(scoreTrend)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Détail par catégorie avec container queries */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-sage-800 flex items-center gap-2">
            <Target className="h-4 w-4 text-sage-600" />
            Détail par catégorie
          </h4>
          <div className="grid gap-4 container-md:grid-cols-2 container-lg:grid-cols-1">
            {Object.entries(breakdown).map(([category, value], index) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons]
              const colorClass = categoryColors[category as keyof typeof categoryColors]
              const label = categoryLabels[category as keyof typeof categoryLabels]
              
              return (
                <div 
                  key={category} 
                  className="flex items-center gap-3 group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110", 
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-sage-800 truncate">
                        {label}
                      </span>
                      <span className="text-sm text-sage-600 font-semibold tabular-nums">
                        {Math.round(value)}/100
                      </span>
                    </div>
                    <div className="w-full bg-linen-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000 ease-out relative",
                          value >= 80 ? "bg-gradient-to-r from-success-500 to-success-600" :
                          value >= 60 ? "bg-gradient-to-r from-turmeric-500 to-turmeric-600" :
                          value >= 40 ? "bg-gradient-to-r from-warning-500 to-warning-600" : 
                          "bg-gradient-to-r from-danger-500 to-danger-600"
                        )}
                        style={{ 
                          width: `${Math.min(100, value)}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      >
                        {value >= 80 && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse-soft"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommandations */}
        {recommendations.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-linen-200">
            <h4 className="text-sm font-semibold text-sage-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success-600" />
              Recommandations
            </h4>
            <ul className="space-y-2">
              {recommendations.slice(0, 3).map((recommendation, index) => (
                <li key={index} className="text-sm text-sage-700 flex items-start gap-2">
                  <span className="text-turmeric-500 mt-0.5">•</span>
                  <span className="flex-1">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message motivationnel avec design amélioré */}
        <div className={cn(
          "p-5 rounded-2xl text-center relative overflow-hidden group",
          score >= 80 ? "bg-gradient-to-br from-success-50 to-success-100 border border-success-200 shadow-soft" :
          score >= 60 ? "bg-gradient-to-br from-turmeric-50 to-turmeric-100 border border-turmeric-200 shadow-soft" :
          score >= 40 ? "bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200 shadow-soft" : 
          "bg-gradient-to-br from-sage-50 to-sage-100 border border-sage-200 shadow-soft"
        )}>
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="text-2xl mb-2">
              {score >= 80 ? "🎉" :
               score >= 60 ? "👍" :
               score >= 40 ? "💪" : "🌱"}
            </div>
            <p className={cn(
              "text-sm font-medium leading-relaxed text-pretty",
              score >= 80 ? "text-success-800" :
              score >= 60 ? "text-turmeric-800" :
              score >= 40 ? "text-warning-800" : "text-sage-800"
            )}>
              {score >= 80 ? "Excellent ! Continuez sur cette voie !" :
               score >= 60 ? "Bon travail ! Quelques améliorations possibles." :
               score >= 40 ? "Vous progressez ! Restez motivé(e) !" :
               "Chaque petit pas compte ! Commençons ensemble."}
            </p>
          </div>
        </div>
      </CardContent>
    </NutritionCard>
  )
}

export default NutritionScore