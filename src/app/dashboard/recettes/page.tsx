import { Suspense } from "react";
import { RecipeFilters } from "@/components/recipes/RecipeFilters";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { RecipeSearch } from "@/components/recipes/RecipeSearch";
import { GenerateRecipeButton } from "@/components/recipes/GenerateRecipeButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Recettes Anti-Inflammatoires - Coach Nutritionnel IA",
  description: "Explorez votre collection de recettes anti-inflammatoires personnalisées. Filtrez par ingrédients, temps de préparation et bénéfices santé.",
  robots: {
    index: false,
    follow: false,
  },
};

interface RecipesPageProps {
  searchParams: {
    search?: string;
    category?: string;
    difficulty?: string;
    time?: string;
    season?: string;
  };
}

export default function RecipesPage({ searchParams }: RecipesPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-playfair">
              Mes Recettes Anti-Inflammatoires
            </h1>
            <p className="text-gray-600 mt-1">
              Découvrez des recettes personnalisées pour votre bien-être
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <GenerateRecipeButton />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          <Suspense fallback={<div className="h-10 bg-gray-200 rounded animate-pulse"></div>}>
            <RecipeSearch initialSearch={searchParams.search} />
          </Suspense>
          
          <Suspense fallback={<div className="h-16 bg-gray-200 rounded animate-pulse"></div>}>
            <RecipeFilters 
              initialFilters={{
                category: searchParams.category,
                difficulty: searchParams.difficulty,
                time: searchParams.time,
                season: searchParams.season,
              }}
            />
          </Suspense>
        </div>
      </div>

      {/* Recipe Grid */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      }>
        <RecipeGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}