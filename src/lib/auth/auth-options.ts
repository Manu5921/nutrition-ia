import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Récupérer les infos d'abonnement
        const subscription = await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            status: "active",
          },
        });

        token.subscribed = !!subscription;
        token.subscriptionId = subscription?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.subscribed = token.subscribed as boolean;
        session.user.subscriptionId = token.subscriptionId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirection après connexion
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  events: {
    async createUser({ user }) {
      // Créer un profil utilisateur par défaut
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          activityLevel: "moderate",
          healthGoals: [],
          foodRestrictions: [],
          preferredMealTimes: ["breakfast", "lunch", "dinner"],
        },
      });
    },
  },
  debug: process.env.NODE_ENV === "development",
};