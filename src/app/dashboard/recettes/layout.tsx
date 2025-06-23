import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Recettes - Dashboard",
  description: "Découvrez vos recettes personnalisées anti-inflammatoires, adaptées à vos goûts et besoins nutritionnels.",
};

export default function RecettesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}