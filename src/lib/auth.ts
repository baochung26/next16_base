import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  getUserByEmailOrUsername,
  getUserByEmail,
  getUserByProviderId,
  createUser,
  updateUser,
  verifyPassword,
} from "./db";

// Build providers array conditionally
const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      identifier: { label: "Username or Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const user = getUserByEmailOrUsername(credentials.identifier);
        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        // Ensure all required fields are present
        const userData = {
          id: user.id,
          email: user.email || '',
          name: user.name || user.username || null,
          image: user.image || null,
          username: user.username || null,
        };
        
        // Validate required fields
        if (!userData.id || !userData.email) {
          return null;
        }
        
        return userData;
      } catch (error) {
        console.error('Error in authorize:', error);
        return null;
      }
    },
  }),
];

// Only add Google provider if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Check if user exists by provider ID
        let dbUser = getUserByProviderId("google", account.providerAccountId);
        
        if (!dbUser) {
          // Check if user exists by email
          if (user.email) {
            dbUser = getUserByEmail(user.email);
          }
          
          // Create new user if doesn't exist
          if (!dbUser) {
            dbUser = await createUser({
              email: user.email || "",
              name: user.name || profile?.name || undefined,
              image: user.image || profile?.picture || undefined,
              provider: "google",
              providerId: account.providerAccountId,
              emailVerified: new Date(),
            });
          } else {
            // Update existing user with Google provider info
            const { updateUser: updateUserFn } = await import("./db");
            dbUser = await updateUserFn(dbUser.id, {
              provider: "google",
              providerId: account.providerAccountId,
              image: user.image || profile?.picture || dbUser.image,
            });
          }
        }
        
        user.id = dbUser.id;
      }
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
        console.error('Error in jwt callback:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (!session || !session.user) {
          return {
            user: {
              id: '',
              email: '',
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
        console.error('Error in session callback:', error);
        // Return a minimal valid session
        return {
          user: {
            id: token?.id as string || '',
            email: session?.user?.email || '',
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
