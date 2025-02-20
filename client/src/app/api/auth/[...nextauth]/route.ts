import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import https from "https";
import { jwtDecode } from "jwt-decode";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    refreshToken?: string;
    accessToken?: string;
    user: {
      id: string;
      username: string;
      role: string;
      permissions: any;
    };
  }
}

interface DecodedToken {
  userId: string;
  [key: string]: any;
}

// Helper function to clean up the user ID if needed
function convertWString(wstr: string): string {
  return wstr.startsWith("L'") && wstr.endsWith("'") ? wstr.slice(2, -1) : wstr;
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) throw new Error("Missing credentials");

          // Allow self-signed certificates (for local dev)
          const agent = new https.Agent({ rejectUnauthorized: false });

          // Call your backend API to authenticate the user
          const response = await axios.post(
            "https://localhost:8080/api/auth/login",
            {
              username: credentials.username,
              password: credentials.password,
            },
            { httpsAgent: agent, withCredentials: true }
          );

          if (!response.data.accessToken) throw new Error("Access token missing");

          // Decode JWT to extract user ID
          const decodedToken = jwtDecode<DecodedToken>(response.data.accessToken);
          const userId = convertWString(decodedToken.userId);

          // Fetch user role and permissions from backend
          const userDetails = await axios.get(`https://localhost:8080/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${response.data.accessToken}`,
            },
            httpsAgent: agent,
          });

          return {
            id: userId,
            username: credentials.username,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            role: userDetails.data.role,
            permissions: userDetails.data.permissions,
          };
        } catch (error) {
          console.error("Authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      session.user = {
        id: token.id,
        username: token.username,
        role: token.role,
        permissions: token.permissions,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
