import { User } from "next-auth";

// Extension des types NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    subscribed?: boolean;
    subscriptionId?: string;
  }

  interface Session {
    user: User & {
      id: string;
      subscribed: boolean;
      subscriptionId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subscribed: boolean;
    subscriptionId?: string;
  }
}

// Types pour l'application
export interface UserProfile {
  id: string;
  userId: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  healthGoals: string[];
  foodRestrictions: string[];
  preferredMealTimes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionFacts: NutritionFacts;
  antiInflammatoryScore: number;
  season: string[];
  difficultyLevel: "easy" | "medium" | "hard";
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  coverImage?: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  antiInflammatoryCompounds?: string[];
}

export interface WeeklyMealPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  meals: {
    [day: string]: {
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
      snacks?: Recipe[];
    };
  };
  shoppingList: ShoppingListItem[];
  generatedAt: Date;
}

export interface ShoppingListItem {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number;
  tags: string[];
  category: string;
  featured: boolean;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  maxTime?: number;
  season?: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types pour les formulaires
export interface ProfileFormData {
  age?: number;
  weightKg?: number;
  heightCm?: number;
  activityLevel: UserProfile["activityLevel"];
  healthGoals: string[];
  foodRestrictions: string[];
  preferredMealTimes: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterSubscription {
  email: string;
  preferences?: {
    recipes: boolean;
    tips: boolean;
    articles: boolean;
  };
}

// Types pour les analytics
export interface UserStats {
  recipesGenerated: number;
  favoritesCount: number;
  plansCreated: number;
  activeDays: number;
  averageAntiInflammatoryScore: number;
}

export interface RecipeRating {
  id: string;
  userId: string;
  recipeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Types pour les notifications
export interface Notification {
  id: string;
  userId: string;
  type: "recipe_suggestion" | "plan_ready" | "tip" | "reminder";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Enums
export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum ActivityLevel {
  SEDENTARY = "sedentary",
  LIGHT = "light",
  MODERATE = "moderate",
  ACTIVE = "active",
  VERY_ACTIVE = "very_active",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
}