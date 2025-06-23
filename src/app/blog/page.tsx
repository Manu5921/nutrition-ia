import { Suspense } from "react";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogCategories } from "@/components/blog/BlogCategories";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { FeaturedArticles } from "@/components/blog/FeaturedArticles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Nutrition Anti-Inflammatoire - Conseils & Recettes",
  description: "Découvrez nos articles sur la nutrition anti-inflammatoire, recettes santé, conseils de bien-être et guides pratiques pour une alimentation équilibrée.",
  keywords: [
    "blog nutrition",
    "articles anti-inflammatoire",
    "conseils nutritionnels",
    "recettes santé",
    "bien-être alimentaire",
    "guides nutrition France"
  ],
  openGraph: {
    title: "Blog Nutrition Anti-Inflammatoire - Coach Nutritionnel IA",
    description: "Articles, conseils et recettes pour une alimentation anti-inflammatoire. Guides pratiques par des experts en nutrition.",
    type: "website",
  },
  alternates: {
    types: {
      "application/rss+xml": "/blog/rss.xml",
    },
  },
};

interface BlogPageProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
  };
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = parseInt(searchParams.page || "1");
  
  return (
    <div className="space-y-8">
      {/* Blog Hero */}
      <Suspense fallback={<div className="bg-gradient-to-r from-primary-600 to-primary-800 h-64 rounded-lg animate-pulse"></div>}>
        <BlogHero />
      </Suspense>

      {/* Featured Articles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 font-playfair mb-6">
          Articles Populaires
        </h2>
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>}>
          <FeaturedArticles />
        </Suspense>
      </div>

      {/* Search and Categories */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-playfair">
            Tous les Articles
          </h2>
          <Suspense fallback={<div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>}>
            <BlogSearch initialSearch={searchParams.search} />
          </Suspense>
        </div>
        
        <Suspense fallback={<div className="flex flex-wrap gap-2 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>}>
          <BlogCategories selectedCategory={searchParams.category} />
        </Suspense>
      </div>

      {/* Articles Grid */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>}>
        <BlogGrid 
          searchParams={searchParams}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}