import { NextRequest, NextResponse } from 'next/server';

// Types pour l'analyse nutritionnelle
interface NutritionAnalysis {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  inflammatoryScore: number;
  recommendations: string[];
}

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
}

// Base de données simulée d'aliments anti-inflammatoires
const antiInflammatoryFoods = {
  'saumon': { 
    calories: 208, 
    proteins: 25.4, 
    carbs: 0, 
    fats: 11.6, 
    fiber: 0, 
    inflammatoryScore: -8 
  },
  'épinards': { 
    calories: 23, 
    proteins: 2.9, 
    carbs: 3.6, 
    fats: 0.4, 
    fiber: 2.2, 
    inflammatoryScore: -9 
  },
  'avocat': { 
    calories: 160, 
    proteins: 2, 
    carbs: 8.5, 
    fats: 14.7, 
    fiber: 6.7, 
    inflammatoryScore: -7 
  },
  'myrtilles': { 
    calories: 57, 
    proteins: 0.7, 
    carbs: 14.5, 
    fats: 0.3, 
    fiber: 2.4, 
    inflammatoryScore: -9 
  },
  'curcuma': { 
    calories: 312, 
    proteins: 9.7, 
    carbs: 67.1, 
    fats: 3.2, 
    fiber: 22.7, 
    inflammatoryScore: -10 
  },
  'noix': { 
    calories: 654, 
    proteins: 15.2, 
    carbs: 13.7, 
    fats: 65.2, 
    fiber: 6.7, 
    inflammatoryScore: -6 
  },
  'brocoli': { 
    calories: 34, 
    proteins: 2.8, 
    carbs: 7, 
    fats: 0.4, 
    fiber: 2.6, 
    inflammatoryScore: -8 
  },
  'gingembre': { 
    calories: 80, 
    proteins: 1.8, 
    carbs: 17.8, 
    fats: 0.8, 
    fiber: 2, 
    inflammatoryScore: -9 
  }
};

function analyzeFood(foodItems: FoodItem[]): NutritionAnalysis {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;
  let totalInflammatoryScore = 0;
  const recommendations: string[] = [];

  foodItems.forEach(item => {
    const foodName = item.name.toLowerCase();
    const foodData = antiInflammatoryFoods[foodName as keyof typeof antiInflammatoryFoods];
    
    if (foodData) {
      const multiplier = item.quantity / 100; // Assuming base values are per 100g
      
      totalCalories += foodData.calories * multiplier;
      totalProteins += foodData.proteins * multiplier;
      totalCarbs += foodData.carbs * multiplier;
      totalFats += foodData.fats * multiplier;
      totalFiber += foodData.fiber * multiplier;
      totalInflammatoryScore += foodData.inflammatoryScore * multiplier;
    }
  });

  // Génération de recommandations basées sur l'analyse
  if (totalInflammatoryScore > -5) {
    recommendations.push("Ajoutez plus d'aliments anti-inflammatoires comme le curcuma ou le gingembre");
  }
  
  if (totalFiber < 25) {
    recommendations.push("Augmentez votre consommation de fibres avec plus de légumes verts");
  }
  
  if (totalProteins < 50) {
    recommendations.push("Incluez plus de sources de protéines comme le saumon ou les noix");
  }
  
  if (totalInflammatoryScore < -20) {
    recommendations.push("Excellent choix d'aliments anti-inflammatoires ! Continuez ainsi");
  }

  return {
    calories: Math.round(totalCalories),
    proteins: Math.round(totalProteins * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fats: Math.round(totalFats * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    inflammatoryScore: Math.round(totalInflammatoryScore),
    recommendations
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { foods } = body;

    if (!foods || !Array.isArray(foods)) {
      return NextResponse.json(
        { error: 'Liste d\'aliments requis' },
        { status: 400 }
      );
    }

    // Valider les données d'entrée
    const validFoods = foods.filter((food: any) => 
      food.name && 
      typeof food.quantity === 'number' && 
      food.quantity > 0 &&
      food.unit
    );

    if (validFoods.length === 0) {
      return NextResponse.json(
        { error: 'Aucun aliment valide fourni' },
        { status: 400 }
      );
    }

    const analysis = analyzeFood(validFoods);

    return NextResponse.json({
      success: true,
      analysis,
      processedFoods: validFoods.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'analyse nutritionnelle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET endpoint pour obtenir la liste des aliments disponibles
export async function GET() {
  try {
    const availableFoods = Object.keys(antiInflammatoryFoods).map(food => ({
      name: food,
      displayName: food.charAt(0).toUpperCase() + food.slice(1),
      nutritionPer100g: antiInflammatoryFoods[food as keyof typeof antiInflammatoryFoods]
    }));

    return NextResponse.json({
      success: true,
      foods: availableFoods,
      totalFoods: availableFoods.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des aliments:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}