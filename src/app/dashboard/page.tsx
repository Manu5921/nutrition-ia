import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WeeklyPlanCard } from "@/components/dashboard/WeeklyPlanCard";
import { RecentRecipesCard } from "@/components/dashboard/RecentRecipesCard";
import { NutritionProgressCard } from "@/components/dashboard/NutritionProgressCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de Bord - Coach Nutritionnel IA",
  description: "Consultez votre tableau de bord personnalisé avec vos statistiques nutritionnelles, plan hebdomadaire et recommandations personnalisées.",
  robots: {
    index: false, // Dashboard privé
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 font-playfair">
          Bonjour ! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Voici votre résumé nutritionnel du jour
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>}>
        <StatsCards />
      </Suspense>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan & Nutrition */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<div className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-96"></div>}>
            <WeeklyPlanCard />
          </Suspense>
          
          <Suspense fallback={<div className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-80"></div>}>
            <NutritionProgressCard />
          </Suspense>
        </div>

        {/* Right Column - Actions & Recipes */}
        <div className="space-y-6">
          <Suspense fallback={<div className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-64"></div>}>
            <QuickActionsCard />
          </Suspense>
          
          <Suspense fallback={<div className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-80"></div>}>
            <RecentRecipesCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}