import { Suspense } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SubscriptionCard } from "@/components/profile/SubscriptionCard";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { NutritionPreferences } from "@/components/profile/NutritionPreferences";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon Profil - Coach Nutritionnel IA",
  description: "Gérez votre profil nutritionnel, vos préférences alimentaires et paramètres de compte pour une expérience personnalisée.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">
            Mon Profil Nutritionnel
          </h1>
          <p className="text-gray-600 mt-1">
            Personnalisez votre expérience pour des recommandations optimales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations Personnelles
              </h2>
              <Suspense fallback={<div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>}>
                <ProfileForm />
              </Suspense>
            </div>

            {/* Nutrition Preferences */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Préférences Nutritionnelles
              </h2>
              <Suspense fallback={<div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>}>
                <NutritionPreferences />
              </Suspense>
            </div>

            {/* Account Settings */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Paramètres du Compte
              </h2>
              <Suspense fallback={<div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>}>
                <AccountSettings />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Suspense fallback={<div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>}>
              <SubscriptionCard />
            </Suspense>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Complétez votre profil
              </h3>
              <p className="text-primary-700 text-sm mb-4">
                Plus votre profil est complet, plus nos recommandations sont précises.
              </p>
              <div className="bg-primary-200 rounded-full h-2 mb-2">
                <div className="bg-primary-600 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-primary-600 text-xs font-medium">75% complété</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques Rapides
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recettes favorites</span>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plans suivis</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jours d'activité</span>
                  <span className="font-semibold text-gray-900">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}