import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Target,
  Calendar,
  Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "Suivi de Progression",
  description: "Suivez vos progrès nutritionnels, votre bien-être et l'évolution de vos habitudes alimentaires.",
};

// Simulated data - In real app, this would come from API/database
const progressData = {
  wellnessScore: 85,
  inflammationLevel: 32, // Lower is better
  weightChange: -2.5,
  energyLevel: 78,
  streakDays: 12,
  goalsCompleted: 7,
  totalGoals: 10
};

const weeklyStats = [
  { day: "Lun", score: 75 },
  { day: "Mar", score: 82 },
  { day: "Mer", score: 78 },
  { day: "Jeu", score: 88 },
  { day: "Ven", score: 85 },
  { day: "Sam", score: 92 },
  { day: "Dim", score: 89 }
];

const achievements = [
  {
    id: 1,
    title: "Première semaine complète",
    description: "7 jours consécutifs de suivi",
    icon: "🎯",
    date: "Il y a 5 jours",
    unlocked: true
  },
  {
    id: 2,
    title: "Réduction inflammation",
    description: "Niveau d'inflammation -20%",
    icon: "💪",
    date: "Il y a 3 jours",
    unlocked: true
  },
  {
    id: 3,
    title: "Recettes explorées",
    description: "25 nouvelles recettes testées",
    icon: "👨‍🍳",
    date: "Il y a 1 jour",
    unlocked: true
  },
  {
    id: 4,
    title: "Objectif mensuel",
    description: "Atteindre 90% de bien-être",
    icon: "🏆",
    date: "Dans 2 semaines",
    unlocked: false
  }
];

function StatsCard({ 
  title, 
  value, 
  unit, 
  change, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: number;
  unit: string;
  change?: number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down';
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              {value}{unit}
            </span>
            {change && (
              <div className={`flex items-center ml-2 text-sm ${
                trend === 'up' ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(change)}{unit}
              </div>
            )}
          </div>
        </div>
        <div className="p-3 bg-emerald-100 rounded-full">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
    </Card>
  );
}

export default function SuiviPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi de Progression</h1>
          <p className="text-gray-600 mt-1">
            Votre évolution nutritionnelle et bien-être
          </p>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          <Calendar className="w-4 h-4 mr-1" />
          Jour {progressData.streakDays}
        </Badge>
      </div>

      {/* Key Metrics */}
      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Score de Bien-être"
            value={progressData.wellnessScore}
            unit="%"
            change={5}
            icon={Heart}
            trend="up"
          />
          <StatsCard
            title="Niveau d'Inflammation"
            value={progressData.inflammationLevel}
            unit=""
            change={-8}
            icon={Activity}
            trend="down"
          />
          <StatsCard
            title="Évolution Poids"
            value={progressData.weightChange}
            unit="kg"
            change={progressData.weightChange}
            icon={Target}
            trend="down"
          />
          <StatsCard
            title="Niveau d'Énergie"
            value={progressData.energyLevel}
            unit="%"
            change={12}
            icon={TrendingUp}
            trend="up"
          />
        </div>
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progression de la Semaine
          </h3>
          <div className="space-y-4">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">{stat.day}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stat.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {stat.score}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Award className="w-5 h-5 inline mr-2" />
            Récompenses
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`flex items-center p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-2xl mr-3">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {achievement.date}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Objectifs du Mois
          </h3>
          <Badge variant="outline">
            {progressData.goalsCompleted}/{progressData.totalGoals} complétés
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(progressData.goalsCompleted / progressData.totalGoals) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round((progressData.goalsCompleted / progressData.totalGoals) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Progression</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {progressData.totalGoals - progressData.goalsCompleted}
            </div>
            <p className="text-sm text-gray-600">Objectifs restants</p>
          </div>
        </div>
      </Card>
    </div>
  );
}