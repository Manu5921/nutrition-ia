import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Fonctionnalités", href: "/#features" },
    { name: "Tarifs", href: "/abonnement" },
    { name: "FAQ", href: "/abonnement#faq" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Recettes", href: "/dashboard/recettes" },
    { name: "Guides", href: "/blog?category=guides" },
  ],
  company: [
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Mentions légales", href: "/legal" },
    { name: "Politique de confidentialité", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center space-x-2 font-bold text-xl text-primary-600 mb-4"
            >
              <Leaf className="h-8 w-8" />
              <span className="font-playfair">Coach Nutritionnel IA</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Votre coach nutritionnel personnel spécialisé dans l'alimentation 
              anti-inflammatoire. Retrouvez bien-être et vitalité naturellement.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-600" />
                <span>contact@coach-nutritionnel-ia.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-600" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Ressources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold text-gray-900 mb-2">
                Restez informé des dernières actualités nutrition
              </h3>
              <p className="text-gray-600 text-sm">
                Recevez nos conseils anti-inflammatoires et nouvelles recettes chaque semaine.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-gray-600 text-sm">
            © 2024 Coach Nutritionnel IA. Tous droits réservés.
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
            >
              Confidentialité
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
            >
              CGU
            </Link>
            <Link
              href="/cookies"
              className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}