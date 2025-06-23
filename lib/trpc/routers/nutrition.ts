/**
 * COACH NUTRITIONNEL IA - TRPC NUTRITION ROUTER 2025
 * ==================================================
 * API tRPC pour l'analyse nutritionnelle et le scoring anti-inflammatoire
 * Patterns 2025 : Edge Runtime, OpenAI integration, Nutritionix API
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  publicProcedure, 
  protectedProcedure, 
  subscribedProcedure,
  handleSupabaseError
} from '../server'

// Schémas Zod pour validation
const nutritionSearchSchema = z.object({
  query: z.string().min(2).max(100),
  limit: z.number().min(1).max(20).default(10),
})

const foodItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  unit: z.string(),
  calories: z.number().min(0),
  nutrients: z.object({
    proteins: z.number().min(0),
    carbs: z.number().min(0),
    fats: z.number().min(0),
    fiber: z.number().min(0),
    sugar: z.number().min(0),
    sodium: z.number().min(0),
    omega3: z.number().optional(),
    antioxidants: z.number().optional(),
    vitamins: z.record(z.string(), z.number()).optional(),
    minerals: z.record(z.string(), z.number()).optional(),
  }),
  antiInflammatoryScore: z.number().min(1).max(10),
  tags: z.array(z.string()),
})

const nutritionAnalysisSchema = z.object({
  foods: z.array(foodItemSchema).min(1),
  userGoals: z.object({
    dailyCalories: z.number().optional(),
    weightGoal: z.enum(['lose', 'maintain', 'gain']).optional(),
    restrictions: z.array(z.string()).optional(),
  }).optional(),
})

// Base de données d'aliments anti-inflammatoires (simulée)
const ANTI_INFLAMMATORY_FOODS = [
  {
    id: 'salmon',
    name: 'Saumon',
    calories: 208,
    unit: 'g',
    nutrients: {
      proteins: 25.4,
      carbs: 0,
      fats: 12.4,
      fiber: 0,
      sugar: 0,
      sodium: 59,
      omega3: 2.3,
      antioxidants: 0.5,
    },
    antiInflammatoryScore: 9,
    tags: ['poisson', 'omega3', 'proteine', 'anti-inflammatoire'],
  },
  {
    id: 'spinach',
    name: 'Épinards',
    calories: 23,
    unit: 'g',
    nutrients: {
      proteins: 2.9,
      carbs: 3.6,
      fats: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79,
      antioxidants: 8.5,
    },
    antiInflammatoryScore: 8,
    tags: ['legume', 'vert', 'antioxydants', 'vitamines'],
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    calories: 368,
    unit: 'g',
    nutrients: {
      proteins: 14.1,
      carbs: 64.2,
      fats: 6.1,
      fiber: 7.0,
      sugar: 4.6,
      sodium: 5,
    },
    antiInflammatoryScore: 7,
    tags: ['cereal', 'proteine', 'fibre', 'sans-gluten'],
  },
  {
    id: 'blueberries',
    name: 'Myrtilles',
    calories: 57,
    unit: 'g',
    nutrients: {
      proteins: 0.7,
      carbs: 14.5,
      fats: 0.3,
      fiber: 2.4,
      sugar: 10.0,
      sodium: 1,
      antioxidants: 9.2,
    },
    antiInflammatoryScore: 9,
    tags: ['fruit', 'antioxydants', 'anti-inflammatoire', 'vitamines'],
  },
  {
    id: 'avocado',
    name: 'Avocat',
    calories: 160,
    unit: 'g',
    nutrients: {
      proteins: 2.0,
      carbs: 8.5,
      fats: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      sodium: 7,
      omega3: 0.1,
    },
    antiInflammatoryScore: 8,
    tags: ['fruit', 'bonnes-graisses', 'fibre', 'potassium'],
  },
  {
    id: 'turmeric',
    name: 'Curcuma',
    calories: 354,
    unit: 'g',
    nutrients: {
      proteins: 7.8,
      carbs: 64.9,
      fats: 9.9,
      fiber: 21.1,
      sugar: 3.2,
      sodium: 38,
      antioxidants: 10.0,
    },
    antiInflammatoryScore: 10,
    tags: ['epice', 'anti-inflammatoire', 'curcumine', 'antioxydants'],
  },
  {
    id: 'olive-oil',
    name: 'Huile d\'olive extra vierge',
    calories: 884,
    unit: 'g',
    nutrients: {
      proteins: 0,
      carbs: 0,
      fats: 100,
      fiber: 0,
      sugar: 0,
      sodium: 2,
      antioxidants: 7.5,
    },
    antiInflammatoryScore: 8,
    tags: ['huile', 'monoinsat', 'antioxydants', 'mediterraneen'],
  },
]

// Fonction pour calculer le score anti-inflammatoire global
const calculateAntiInflammatoryScore = (foods: z.infer<typeof foodItemSchema>[]) => {
  if (foods.length === 0) return 0
  
  const totalScore = foods.reduce((sum, food) => {
    const weight = food.calories / 100 // Pondération par les calories
    return sum + (food.antiInflammatoryScore * weight)
  }, 0)
  
  const totalWeight = foods.reduce((sum, food) => sum + (food.calories / 100), 0)
  
  return Math.round((totalScore / totalWeight) * 10) / 10
}

// Fonction pour générer des recommandations personnalisées
const generateRecommendations = (analysis: any, userGoals?: any) => {
  const recommendations: string[] = []
  
  if (analysis.score.antiInflammatory < 6) {
    recommendations.push(
      "Ajoutez plus d'aliments anti-inflammatoires comme le saumon, les myrtilles et le curcuma",
      "Réduisez les aliments transformés et privilégiez les aliments entiers"
    )
  }
  
  if (analysis.macros.omega3 < 1) {
    recommendations.push(
      "Intégrez plus d'oméga-3 avec du poisson gras, des noix ou des graines de chia"
    )
  }
  
  if (analysis.macros.fiber < 25) {
    recommendations.push(
      "Augmentez votre consommation de fibres avec des légumes verts et des fruits"
    )
  }
  
  if (userGoals?.weightGoal === 'lose' && analysis.totalCalories > 1800) {
    recommendations.push(
      "Réduisez légèrement les portions pour atteindre votre objectif de perte de poids"
    )
  }
  
  return recommendations
}

export const nutritionRouter = createTRPCRouter({
  // Rechercher des aliments dans la base
  searchFoods: publicProcedure
    .input(nutritionSearchSchema)
    .mutation(async ({ input }) => {
      try {
        // Recherche dans notre base d'aliments anti-inflammatoires
        const results = ANTI_INFLAMMATORY_FOODS.filter(food =>
          food.name.toLowerCase().includes(input.query.toLowerCase()) ||
          food.tags.some(tag => tag.toLowerCase().includes(input.query.toLowerCase()))
        ).slice(0, input.limit)
        
        return results
      } catch (error) {
        console.error('Erreur recherche aliments:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la recherche d\'aliments',
        })
      }
    }),

  // Analyser la nutrition d'une sélection d'aliments
  analyze: protectedProcedure
    .input(nutritionAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { foods, userGoals } = input
        
        // Calculs nutritionnels
        const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)
        const totalProteins = foods.reduce((sum, food) => sum + food.nutrients.proteins, 0)
        const totalCarbs = foods.reduce((sum, food) => sum + food.nutrients.carbs, 0)
        const totalFats = foods.reduce((sum, food) => sum + food.nutrients.fats, 0)
        const totalFiber = foods.reduce((sum, food) => sum + food.nutrients.fiber, 0)
        const totalOmega3 = foods.reduce((sum, food) => sum + (food.nutrients.omega3 || 0), 0)
        
        // Calcul des scores
        const antiInflammatoryScore = calculateAntiInflammatoryScore(foods)
        
        // Score d'équilibre macronutriments (idéal: 25% protéines, 45% glucides, 30% lipides)
        const proteinPercent = (totalProteins * 4) / totalCalories * 100
        const carbPercent = (totalCarbs * 4) / totalCalories * 100
        const fatPercent = (totalFats * 9) / totalCalories * 100
        
        const balanceScore = Math.max(0, 100 - (
          Math.abs(proteinPercent - 25) +
          Math.abs(carbPercent - 45) +
          Math.abs(fatPercent - 30)
        ))
        
        // Score de qualité basé sur les micronutriments
        const fiberScore = Math.min(100, (totalFiber / 25) * 100) // 25g recommandés
        const omega3Score = Math.min(100, (totalOmega3 / 2) * 100) // 2g recommandés
        const qualityScore = (fiberScore + omega3Score + antiInflammatoryScore * 10) / 3
        
        // Score global
        const overallScore = Math.round((antiInflammatoryScore * 10 + balanceScore + qualityScore) / 3)
        
        const analysis = {
          totalCalories,
          macros: {
            proteins: Math.round(totalProteins * 10) / 10,
            carbs: Math.round(totalCarbs * 10) / 10,
            fats: Math.round(totalFats * 10) / 10,
            fiber: Math.round(totalFiber * 10) / 10,
            omega3: Math.round(totalOmega3 * 100) / 100,
          },
          score: {
            overall: overallScore,
            antiInflammatory: Math.round(antiInflammatoryScore * 10),
            balance: Math.round(balanceScore),
            quality: Math.round(qualityScore),
          },
          recommendations: generateRecommendations({ 
            score: { antiInflammatory: antiInflammatoryScore },
            macros: { omega3: totalOmega3, fiber: totalFiber },
            totalCalories 
          }, userGoals),
          warnings: totalCalories > 2500 ? ['Apport calorique très élevé'] : [],
        }
        
        // Sauvegarder l'analyse pour l'utilisateur connecté (optionnel)
        if (ctx.user) {
          // Ici on pourrait sauvegarder dans Supabase pour un historique
        }
        
        return analysis
      } catch (error) {
        console.error('Erreur analyse nutrition:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de l\'analyse nutritionnelle',
        })
      }
    }),

  // Obtenir l'historique des analyses (abonné)
  getAnalysisHistory: subscribedProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0) 
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Récupérer l'historique depuis Supabase
        const { data, error } = await ctx.supabase
          .from('nutrition_analyses')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)
        
        if (error) handleSupabaseError(error)
        
        return data || []
      } catch (error) {
        console.error('Erreur récupération historique:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération de l\'historique',
        })
      }
    }),

  // Obtenir des suggestions d'amélioration personnalisées (abonné)
  getPersonalizedSuggestions: subscribedProcedure
    .query(async ({ ctx }) => {
      try {
        // Récupérer le profil utilisateur
        const { data: profile } = await ctx.supabase
          .from('user_profiles')
          .select('health_goals, food_restrictions, activity_level')
          .eq('user_id', ctx.user.id)
          .maybeSingle()
        
        // Générer des suggestions basées sur le profil
        const suggestions = []
        
        if (profile?.health_goals?.includes('weight_loss')) {
          suggestions.push({
            type: 'calorie_reduction',
            title: 'Réduction calorique',
            description: 'Créez un déficit de 300-500 calories par jour',
            foods: ['légumes verts', 'protéines maigres', 'fruits peu sucrés']
          })
        }
        
        if (profile?.health_goals?.includes('anti_inflammatory')) {
          suggestions.push({
            type: 'anti_inflammatory',
            title: 'Alimentation anti-inflammatoire',
            description: 'Privilégiez les aliments riches en oméga-3 et antioxydants',
            foods: ['saumon', 'myrtilles', 'curcuma', 'épinards']
          })
        }
        
        return suggestions
      } catch (error) {
        console.error('Erreur suggestions personnalisées:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la génération des suggestions',
        })
      }
    }),

  // Calculer les besoins nutritionnels quotidiens
  calculateDailyNeeds: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Récupérer le profil utilisateur
        const { data: profile } = await ctx.supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', ctx.user.id)
          .maybeSingle()
        
        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profil utilisateur non trouvé',
          })
        }
        
        // Calcul BMR (Basal Metabolic Rate) - Harris-Benedict
        const age = profile.birth_date 
          ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
          : 30
        
        let bmr = 0
        if (profile.gender === 'male') {
          bmr = 88.362 + (13.397 * (profile.weight_kg || 70)) + 
                (4.799 * (profile.height_cm || 175)) - (5.677 * age)
        } else {
          bmr = 447.593 + (9.247 * (profile.weight_kg || 60)) + 
                (3.098 * (profile.height_cm || 165)) - (4.330 * age)
        }
        
        // Facteur d'activité
        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        }
        
        const activityLevel = profile.activity_level || 'moderate'
        const dailyCalories = Math.round(bmr * activityMultipliers[activityLevel])
        
        // Calcul des macronutriments
        const dailyProteins = Math.round((profile.weight_kg || 70) * 1.6) // 1.6g/kg
        const dailyCarbs = Math.round((dailyCalories * 0.45) / 4) // 45% des calories
        const dailyFats = Math.round((dailyCalories * 0.30) / 9) // 30% des calories
        
        return {
          calories: dailyCalories,
          macros: {
            proteins: dailyProteins,
            carbs: dailyCarbs,
            fats: dailyFats,
          },
          micronutrients: {
            fiber: 25, // g/jour
            omega3: 2, // g/jour
            vitamin_d: 15, // µg/jour
            calcium: 1000, // mg/jour
          },
          hydration: Math.round((profile.weight_kg || 70) * 35), // ml/jour
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur calcul besoins quotidiens:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors du calcul des besoins nutritionnels',
        })
      }
    }),
})