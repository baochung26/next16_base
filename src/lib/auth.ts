import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Note: NextAuth is currently disabled in this project
// This file is kept for potential future use with Google OAuth
// For now, authentication uses token-based approach with backend API

// Build providers array conditionally
const providers: any[] = [
  // CredentialsProvider disabled - using token-based auth instead
  // Uncomment and implement if you need NextAuth credentials provider
];

// Only add Google provider if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Implement Google OAuth sign-in logic here if needed
      // For now, NextAuth is disabled
      return true;
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id;
          token.username = (user as any).username;
        }
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (!session || !session.user) {
          return {
            user: {
              id: "",
              email: "",
              name: null,
              image: null,
              username: null,
            },
            expires: new Date().toISOString(),
          };
        }

        if (token?.id) {
          session.user.id = token.id as string;
        }

        if ((token as any)?.username !== undefined) {
          session.user.username = (token as any).username || null;
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return {
          user: {
            id: (token?.id as string) || "",
            email: session?.user?.email || "",
            name: session?.user?.name || null,
            image: session?.user?.image || null,
            username: (token as any)?.username || null,
          },
          expires: new Date().toISOString(),
        };
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
