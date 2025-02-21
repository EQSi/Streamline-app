import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import https from "https";
import { jwtDecode } from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";

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
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const agent = new https.Agent({ rejectUnauthorized: false });
          if (!credentials) throw new Error("Credentials are required");

          const response = await axios.post(
            "https://localhost:8080/api/auth/login",
            {
              username: credentials.username,
              password: credentials.password,
            },
            { httpsAgent: agent, withCredentials: true }
          );

          if (response.data) {
            if (!response.data.accessToken) throw new Error("Access token is missing");

            const decodedToken = jwtDecode<DecodedToken>(response.data.accessToken);
            const userId = decodedToken.userId;

            const userDetails = await axios.get(`https://localhost:8080/api/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${response.data.accessToken}`,
              },
              httpsAgent: agent,
            });

            return {
              token: response.data.accessToken,
              id: userId,
              username: credentials.username,
              role: userDetails.data.role,
              permissions: userDetails.data.permissions,
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user = {
          ...session.user,
          id: token.id,
          username: token.username,
          role: token.role,
          permissions: token.permissions,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };