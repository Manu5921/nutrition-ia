"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Crown,
  Star,
  Zap,
  Shield,
  Calendar,
  CreditCard,
  Check,
  X,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from "lucide-react"

interface Subscription {
  plan: "free" | "premium" | "pro"
  status: "active" | "canceled" | "expired"
  renewalDate?: string
  features: string[]
  limits: {
    recipesPerMonth: number
    aiAnalysisPerMonth: number
    mealPlansPerMonth: number
  }
  usage: {
    recipesUsed: number
    aiAnalysisUsed: number
    mealPlansUsed: number
  }
}

interface SubscriptionCardProps {
  className?: string
}

export const SubscriptionCard = ({ className }: SubscriptionCardProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false)
  
  // Simulation de données d'abonnement
  const subscription: Subscription = {
    plan: "free",
    status: "active",
    features: [
      "3 recettes personnalisées/mois",
      "Analyse nutritionnelle de base",
      "Accès aux recettes communautaires",
      "Suivi des calories"
    ],
    limits: {
      recipesPerMonth: 3,
      aiAnalysisPerMonth: 10,
      mealPlansPerMonth: 1
    },
    usage: {
      recipesUsed: 2,
      aiAnalysisUsed: 7,
      mealPlansUsed: 1
    }
  }

  const plans = {
    free: {
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: Shield
    },
    premium: {
      name: "Premium",
      price: "9,99€",
      period: "/mois",
      color: "text-primary",
      bgColor: "bg-primary/10",
      icon: Star
    },
    pro: {
      name: "Professionnel",
      price: "19,99€",
      period: "/mois",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: Crown
    }
  }

  const premiumFeatures = [
    "Recettes illimitées avec IA",
    "Plans de repas personnalisés",
    "Analyse détaillée anti-inflammatoire",
    "Recommandations adaptées aux objectifs",
    "Suivi avancé des nutriments",
    "Accès prioritaire aux nouvelles fonctionnalités",
    "Support client prioritaire",
    "Export des données"
  ]

  const currentPlan = plans[subscription.plan]
  const Icon = currentPlan.icon

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-orange-600"
    return "text-green-600"
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      // Simulation de la mise à niveau
      await new Promise(resolve => setTimeout(resolve, 2000))
      // TODO: Implémenter la logique Stripe
      console.log("Upgrading to premium...")
    } catch (error) {
      console.error("Error upgrading:", error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${currentPlan.color}`} />
              Mon abonnement
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Votre plan actuel et utilisation
            </p>
          </div>
          <Badge 
            variant={subscription.status === "active" ? "default" : "secondary"}
            className={subscription.status === "active" ? "bg-green-100 text-green-800" : ""}
          >
            {subscription.status === "active" ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan actuel */}
        <div className={`rounded-lg p-4 ${currentPlan.bgColor} border`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/80 ${currentPlan.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentPlan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{currentPlan.price}</span>
                  <span className="text-sm text-gray-600">{currentPlan.period}</span>
                </div>
              </div>
            </div>
            {subscription.plan !== "premium" && (
              <Button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isUpgrading ? "Mise à niveau..." : "Passer au Premium"}
              </Button>
            )}
          </div>

          {subscription.renewalDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Renouvellement le {subscription.renewalDate}</span>
            </div>
          )}
        </div>

        {/* Utilisation */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Utilisation ce mois-ci
          </h4>
          
          <div className="space-y-3">
            {/* Recettes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Recettes générées</span>
                <span className={getUsageColor(getUsagePercentage(subscription.usage.recipesUsed, subscription.limits.recipesPerMonth))}>
                  {subscription.usage.recipesUsed}/{subscription.limits.recipesPerMonth}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(subscription.usage.recipesUsed, subscription.limits.recipesPerMonth)} 
                className="h-2"
              />
            </div>

            {/* Analyses IA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyses IA</span>
                <span className={getUsageColor(getUsagePercentage(subscription.usage.aiAnalysisUsed, subscription.limits.aiAnalysisPerMonth))}>
                  {subscription.usage.aiAnalysisUsed}/{subscription.limits.aiAnalysisPerMonth}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(subscription.usage.aiAnalysisUsed, subscription.limits.aiAnalysisPerMonth)} 
                className="h-2"
              />
            </div>

            {/* Plans de repas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Plans de repas</span>
                <span className={getUsageColor(getUsagePercentage(subscription.usage.mealPlansUsed, subscription.limits.mealPlansPerMonth))}>
                  {subscription.usage.mealPlansUsed}/{subscription.limits.mealPlansPerMonth}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(subscription.usage.mealPlansUsed, subscription.limits.mealPlansPerMonth)} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Fonctionnalités incluses */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Fonctionnalités incluses</h4>
          <div className="space-y-2">
            {subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appel à l'action Premium */}
        {subscription.plan === "free" && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">Débloquez tout le potentiel</h4>
                <div className="space-y-1 mb-3">
                  {premiumFeatures.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleUpgrade} disabled={isUpgrading} className="bg-gradient-to-r from-primary to-primary/80">
                    <Star className="h-4 w-4 mr-2" />
                    Essayer Premium
                  </Button>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    🎉 7 jours gratuits
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestion de l'abonnement */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Moyens de paiement
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Inviter des amis
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}