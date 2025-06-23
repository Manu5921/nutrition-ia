import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArticleHeader } from "@/components/blog/ArticleHeader";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { ArticleNavigation } from "@/components/blog/ArticleNavigation";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ArticleActions } from "@/components/blog/ArticleActions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Metadata } from "next";

interface BlogArticlePageProps {
  params: {
    slug: string;
  };
}

// Cette fonction sera appelée à la build time pour générer les métadonnées
export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  // Dans une vraie app, vous récupéreriez les données de l'article depuis votre CMS/DB
  const articleData = await getArticleBySlug(params.slug);
  
  if (!articleData) {
    return {
      title: "Article non trouvé - Coach Nutritionnel IA",
    };
  }

  return {
    title: `${articleData.title} - Blog Coach Nutritionnel IA`,
    description: articleData.excerpt,
    keywords: articleData.tags,
    authors: [{ name: articleData.author }],
    publishedTime: articleData.publishedAt,
    modifiedTime: articleData.updatedAt,
    openGraph: {
      title: articleData.title,
      description: articleData.excerpt,
      type: "article",
      publishedTime: articleData.publishedAt,
      modifiedTime: articleData.updatedAt,
      authors: [articleData.author],
      images: [
        {
          url: articleData.coverImage,
          width: 1200,
          height: 630,
          alt: articleData.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: articleData.title,
      description: articleData.excerpt,
      images: [articleData.coverImage],
    },
  };
}

// Génération statique des pages les plus populaires
export async function generateStaticParams() {
  // Dans une vraie app, vous récupéreriez la liste des articles populaires
  const popularSlugs = [
    "alimentation-anti-inflammatoire-guide-complet",
    "recettes-detox-naturelles",
    "supplements-naturels-inflammation",
    "jeune-intermittent-bienfaits",
    "aliments-riches-omega-3"
  ];

  return popularSlugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const articleData = await getArticleBySlug(params.slug);

  if (!articleData) {
    notFound();
  }

  // Générer les données structurées JSON-LD pour le SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleData.title,
    description: articleData.excerpt,
    image: articleData.coverImage,
    author: {
      "@type": "Person",
      name: articleData.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Coach Nutritionnel IA",
      logo: {
        "@type": "ImageObject",
        url: "https://coach-nutritionnel-ia.vercel.app/logo.png",
      },
    },
    datePublished: articleData.publishedAt,
    dateModified: articleData.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://coach-nutritionnel-ia.vercel.app/blog/${params.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD pour les données structurées */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto">
        {/* Article Header */}
        <Suspense fallback={<div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>}>
          <ArticleHeader article={articleData} />
        </Suspense>

        {/* Article Actions (Partage, Favoris) */}
        <div className="mb-8">
          <Suspense fallback={<div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>}>
            <ArticleActions article={articleData} />
          </Suspense>
        </div>

        {/* Article Content */}
        <div className="mb-12">
          <Suspense fallback={<LoadingSpinner />}>
            <ArticleContent content={articleData.content} />
          </Suspense>
        </div>

        {/* Article Navigation */}
        <div className="mb-12">
          <Suspense fallback={<div className="flex justify-between">
            <div className="w-48 h-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>}>
            <ArticleNavigation currentSlug={params.slug} />
          </Suspense>
        </div>

        {/* Related Articles */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 font-playfair mb-8">
            Articles Similaires
          </h2>
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>}>
            <RelatedArticles 
              currentSlug={params.slug}
              tags={articleData.tags}
              category={articleData.category}
            />
          </Suspense>
        </div>
      </article>
    </>
  );
}

// Fonction helper pour récupérer un article par son slug
async function getArticleBySlug(slug: string) {
  // Dans une vraie application, vous récupéreriez les données depuis :
  // - Un CMS (Contentful, Strapi, Sanity)
  // - Un système de fichiers MDX
  // - Une base de données
  
  // Exemple de données simulées
  const mockArticle = {
    id: "1",
    title: "Guide Complet de l'Alimentation Anti-Inflammatoire",
    slug: slug,
    excerpt: "Découvrez comment adapter votre alimentation pour réduire l'inflammation chronique et retrouver votre bien-être naturellement.",
    content: `
      <p>L'alimentation anti-inflammatoire est une approche nutritionnelle qui vise à réduire l'inflammation chronique dans l'organisme...</p>
      <!-- Contenu complet de l'article en HTML -->
    `,
    coverImage: "/blog/alimentation-anti-inflammatoire.jpg",
    author: "Dr. Marie Dubois",
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    readingTime: 8,
    tags: ["anti-inflammatoire", "nutrition", "santé", "bien-être"],
    category: "Nutrition",
  };

  // Simule un délai de récupération
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockArticle;
}