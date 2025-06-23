import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-primary-600 font-playfair">
              404
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 font-playfair mb-2">
            Page Non Trouvée
          </h1>
          
          <p className="text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full bg-primary-600 hover:bg-primary-700 text-white">
            <Link href="/">
              Retourner à l'accueil
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/blog">
              Consulter le blog
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Vous cherchez quelque chose de spécifique ?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/recettes" className="text-primary-600 hover:text-primary-700">
                Recettes
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/profil" className="text-primary-600 hover:text-primary-700">
                Mon profil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}