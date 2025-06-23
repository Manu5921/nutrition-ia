import { NextRequest, NextResponse } from 'next/server';

// Types pour les recettes
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  inflammatoryScore: number;
  categories: string[];
  nutrition: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  image?: string;
}

// Base de données simulée de recettes anti-inflammatoires
const antiInflammatoryRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Saumon grillé au curcuma et légumes verts',
    description: 'Un plat riche en oméga-3 et antioxydants, parfait pour réduire l\'inflammation.',
    ingredients: [
      '4 filets de saumon (600g)',
      '2 cuillères à soupe de curcuma en poudre',
      '300g d\'épinards frais',
      '200g de brocolis',
      '2 cuillères à soupe d\'huile d\'olive',
      '1 citron',
      'Sel et poivre',
      '2 gousses d\'ail'
    ],
    instructions: [
      'Préchauffer le four à 200°C',
      'Mélanger le curcuma, l\'huile d\'olive, l\'ail écrasé',
      'Badigeonner les filets de saumon avec ce mélange',
      'Faire cuire 15 minutes au four',
      'Faire sauter les épinards et brocolis à la poêle',
      'Servir avec un filet de citron'
    ],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'facile',
    inflammatoryScore: -9,
    categories: ['poisson', 'anti-inflammatoire', 'riche-en-omega3'],
    nutrition: {
      calories: 320,
      proteins: 28,
      carbs: 8,
      fats: 18,
      fiber: 4
    }
  },
  {
    id: '2',
    title: 'Smoothie anti-inflammatoire aux myrtilles',
    description: 'Un smoothie délicieux et nutritif pour commencer la journée en forme.',
    ingredients: [
      '200g de myrtilles congelées',
      '1 avocat mûr',
      '1 cuillère à soupe de gingembre frais râpé',
      '1 tasse d\'épinards',
      '300ml de lait d\'amande',
      '1 cuillère à soupe de graines de chia',
      '1 cuillère à café de curcuma',
      'Miel (optionnel)'
    ],
    instructions: [
      'Mixer tous les ingrédients dans un blender',
      'Ajuster la consistance avec le lait d\'amande',
      'Goûter et ajouter du miel si nécessaire',
      'Servir immédiatement avec quelques myrtilles sur le dessus'
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: 'facile',
    inflammatoryScore: -8,
    categories: ['smoothie', 'petit-dejeuner', 'antioxydant'],
    nutrition: {
      calories: 240,
      proteins: 6,
      carbs: 25,
      fats: 12,
      fiber: 10
    }
  },
  {
    id: '3',
    title: 'Salade de quinoa aux noix et avocat',
    description: 'Une salade complète et rassasiante, riche en fibres et bons gras.',
    ingredients: [
      '200g de quinoa',
      '2 avocats',
      '100g de noix',
      '150g de roquette',
      '1 concombre',
      '200g de tomates cerises',
      '3 cuillères à soupe d\'huile d\'olive',
      '2 cuillères à soupe de vinaigre balsamique',
      'Herbes fraîches (persil, menthe)'
    ],
    instructions: [
      'Cuire le quinoa selon les instructions du paquet',
      'Laisser refroidir complètement',
      'Couper les avocats, concombre et tomates',
      'Mélanger tous les ingrédients',
      'Assaisonner avec l\'huile et le vinaigre',
      'Servir frais'
    ],
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: 'facile',
    inflammatoryScore: -7,
    categories: ['salade', 'vegetarien', 'complet'],
    nutrition: {
      calories: 380,
      proteins: 12,
      carbs: 35,
      fats: 22,
      fiber: 8
    }
  },
  {
    id: '4',
    title: 'Curry de légumes au lait de coco',
    description: 'Un curry réconfortant aux épices anti-inflammatoires.',
    ingredients: [
      '1 aubergine',
      '2 courgettes',
      '1 poivron rouge',
      '200g de haricots verts',
      '400ml de lait de coco',
      '2 cuillères à soupe de pâte de curry',
      '1 cuillère à soupe de curcuma',
      '1 morceau de gingembre frais',
      'Coriandre fraîche'
    ],
    instructions: [
      'Couper tous les légumes en morceaux',
      'Faire revenir les légumes dans une poêle',
      'Ajouter la pâte de curry et les épices',
      'Verser le lait de coco et laisser mijoter 20 minutes',
      'Garnir de coriandre fraîche'
    ],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: 'moyen',
    inflammatoryScore: -8,
    categories: ['curry', 'vegetarien', 'epice'],
    nutrition: {
      calories: 280,
      proteins: 8,
      carbs: 20,
      fats: 18,
      fiber: 6
    }
  }
];

interface RecommendationRequest {
  preferences?: string[];
  dietaryRestrictions?: string[];
  targetInflammatoryScore?: number;
  maxPrepTime?: number;
  difficulty?: string;
  mealType?: string;
}

function getRecommendations(params: RecommendationRequest): Recipe[] {
  let filteredRecipes = [...antiInflammatoryRecipes];

  // Filtrer par restrictions alimentaires
  if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (params.dietaryRestrictions!.includes('vegetarien')) {
        return recipe.categories.includes('vegetarien') || 
               !recipe.categories.includes('poisson') && 
               !recipe.categories.includes('viande');
      }
      return true;
    });
  }

  // Filtrer par temps de préparation
  if (params.maxPrepTime) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.prepTime + recipe.cookTime <= params.maxPrepTime
    );
  }

  // Filtrer par niveau de difficulté
  if (params.difficulty) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.difficulty === params.difficulty
    );
  }

  // Filtrer par type de repas
  if (params.mealType) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.categories.includes(params.mealType)
    );
  }

  // Trier par score anti-inflammatoire (meilleur en premier)
  filteredRecipes.sort((a, b) => a.inflammatoryScore - b.inflammatoryScore);

  return filteredRecipes.slice(0, 6); // Retourner max 6 recettes
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recommendations = getRecommendations(body);

    return NextResponse.json({
      success: true,
      recommendations,
      totalFound: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const maxTime = searchParams.get('maxTime');

    const params: RecommendationRequest = {};
    
    if (category) params.mealType = category;
    if (difficulty) params.difficulty = difficulty;
    if (maxTime) params.maxPrepTime = parseInt(maxTime);

    const recommendations = getRecommendations(params);

    return NextResponse.json({
      success: true,
      recommendations,
      totalFound: recommendations.length,
      filters: {
        category,
        difficulty,
        maxTime
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}