'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Users,
  ChefHat,
  Plus,
  RefreshCw
} from 'lucide-react';

interface MealPlan {
  id: string;
  day: string;
  meals: {
    breakfast: Recipe | null;
    lunch: Recipe | null;
    dinner: Recipe | null;
    snack: Recipe | null;
  };
  totalNutrition: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  inflammatoryScore: number;
  nutrition: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  image?: string;
}

const daysOfWeek = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
];

const mealTypes = [
  { key: 'breakfast', label: 'Petit-déjeuner', icon: '🌅' },
  { key: 'lunch', label: 'Déjeuner', icon: '☀️' },
  { key: 'dinner', label: 'Dîner', icon: '🌙' },
  { key: 'snack', label: 'Collation', icon: '🍎' }
];

// Données simulées
const sampleRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Smoothie anti-inflammatoire',
    description: 'Myrtilles, avocat, gingembre',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'facile',
    inflammatoryScore: -8,
    nutrition: { calories: 240, proteins: 6, carbs: 25, fats: 12, fiber: 10 }
  },
  {
    id: '2',
    title: 'Salade de quinoa',
    description: 'Quinoa, légumes, avocat',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: 'facile',
    inflammatoryScore: -7,
    nutrition: { calories: 380, proteins: 12, carbs: 35, fats: 22, fiber: 8 }
  },
  {
    id: '3',
    title: 'Saumon grillé',
    description: 'Saumon, curcuma, légumes',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'moyen',
    inflammatoryScore: -9,
    nutrition: { calories: 320, proteins: 28, carbs: 8, fats: 18, fiber: 4 }
  }
];

export function MealPlanner() {
  const [weekPlan, setWeekPlan] = useState<MealPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    generateWeekPlan();
  }, []);

  const generateWeekPlan = async () => {
    setIsGenerating(true);
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newWeekPlan: MealPlan[] = daysOfWeek.map((day, index) => {
      const breakfast = sampleRecipes[0];
      const lunch = sampleRecipes[1];
      const dinner = sampleRecipes[2];
      const snack = index % 2 === 0 ? sampleRecipes[0] : null;
      
      const totalNutrition = {
        calories: breakfast.nutrition.calories + lunch.nutrition.calories + dinner.nutrition.calories + (snack?.nutrition.calories || 0),
        proteins: breakfast.nutrition.proteins + lunch.nutrition.proteins + dinner.nutrition.proteins + (snack?.nutrition.proteins || 0),
        carbs: breakfast.nutrition.carbs + lunch.nutrition.carbs + dinner.nutrition.carbs + (snack?.nutrition.carbs || 0),
        fats: breakfast.nutrition.fats + lunch.nutrition.fats + dinner.nutrition.fats + (snack?.nutrition.fats || 0),
        fiber: breakfast.nutrition.fiber + lunch.nutrition.fiber + dinner.nutrition.fiber + (snack?.nutrition.fiber || 0)
      };

      return {
        id: `day-${index}`,
        day,
        meals: { breakfast, lunch, dinner, snack },
        totalNutrition
      };
    });
    
    setWeekPlan(newWeekPlan);
    setIsGenerating(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-700';
      case 'moyen': return 'bg-yellow-100 text-yellow-700';
      case 'difficile': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInflammatoryScoreColor = (score: number) => {
    if (score <= -8) return 'text-green-600';
    if (score <= -5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Planning de la Semaine
          </h2>
          <p className="text-gray-600 mt-1">
            Votre menu personnalisé anti-inflammatoire
          </p>
        </div>
        <Button 
          onClick={generateWeekPlan}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Nouveau planning
        </Button>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekPlan.map((dayPlan) => (
          <Card 
            key={dayPlan.id} 
            className={`p-4 cursor-pointer transition-all ${
              selectedDay === dayPlan.day 
                ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedDay(selectedDay === dayPlan.day ? null : dayPlan.day)}
          >
            <div className="text-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">
                {dayPlan.day}
              </h3>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(dayPlan.totalNutrition.calories)} kcal
              </div>
            </div>

            <div className="space-y-2">
              {mealTypes.map(({ key, label, icon }) => {
                const meal = dayPlan.meals[key as keyof typeof dayPlan.meals];
                return (
                  <div key={key} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {icon} {label.split('-')[0]}
                      </span>
                      {meal && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(meal.difficulty)}`}
                        >
                          {meal.difficulty}
                        </Badge>
                      )}
                    </div>
                    {meal ? (
                      <div className="text-gray-900 font-medium truncate">
                        {meal.title}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">
                        Non planifié
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Day View */}
      {selectedDay && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              <Calendar className="w-5 h-5 inline mr-2" />
              {selectedDay} - Menu détaillé
            </h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Modifier
            </Button>
          </div>

          {(() => {
            const dayPlan = weekPlan.find(plan => plan.day === selectedDay);
            if (!dayPlan) return null;

            return (
              <div className="space-y-6">
                {/* Meals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mealTypes.map(({ key, label, icon }) => {
                    const meal = dayPlan.meals[key as keyof typeof dayPlan.meals];
                    
                    return (
                      <Card key={key} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {icon} {label}
                          </h4>
                          {meal && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(meal.difficulty)}`}
                            >
                              {meal.difficulty}
                            </Badge>
                          )}
                        </div>

                        {meal ? (
                          <div className="space-y-2">
                            <h5 className="font-semibold text-gray-900 text-sm">
                              {meal.title}
                            </h5>
                            <p className="text-xs text-gray-600">
                              {meal.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {meal.prepTime + meal.cookTime}min
                              </div>
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {meal.servings}
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Calories:</span>
                                  <span className="font-medium ml-1">
                                    {meal.nutrition.calories}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Protéines:</span>
                                  <span className="font-medium ml-1">
                                    {meal.nutrition.proteins}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Fibres:</span>
                                  <span className="font-medium ml-1">
                                    {meal.nutrition.fiber}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Score:</span>
                                  <span className={`font-medium ml-1 ${getInflammatoryScoreColor(meal.inflammatoryScore)}`}>
                                    {meal.inflammatoryScore}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">
                              Aucun repas planifié
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Plus className="w-3 h-3 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>

                {/* Daily Summary */}
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Résumé nutritionnel du jour
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {Math.round(dayPlan.totalNutrition.calories)}
                      </div>
                      <div className="text-xs text-gray-600">Calories</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(dayPlan.totalNutrition.proteins)}g
                      </div>
                      <div className="text-xs text-gray-600">Protéines</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(dayPlan.totalNutrition.carbs)}g
                      </div>
                      <div className="text-xs text-gray-600">Glucides</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(dayPlan.totalNutrition.fats)}g
                      </div>
                      <div className="text-xs text-gray-600">Lipides</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(dayPlan.totalNutrition.fiber)}g
                      </div>
                      <div className="text-xs text-gray-600">Fibres</div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}