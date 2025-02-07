import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import https from "https";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  [key: string]: any;
}

export const authOptions = {
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

          if (!credentials) {
            throw new Error("Credentials are required");
          }

          const response = await axios.post(
            "https://localhost:8080/api/auth/login",
            {
              username: credentials.username,
              password: credentials.password,
            },
            { httpsAgent: agent, withCredentials: true }
          );

          console.log("Login Response:", response.data);

          if (response.data) {
            if (!response.data.accessToken) {
              throw new Error("Access token is missing in the response");
            }
            const decodedToken = jwtDecode<DecodedToken>(response.data.accessToken);
            return {
              token: response.data.accessToken,
              id: decodedToken.userId,
              username: credentials.username,
              refreshToken: response.data.refreshToken, // Assuming the response contains a refreshToken
            };
          }

          return null;
        } catch (error) {
          const err = error as any;
          if (err.response && err.response.status === 401) {
            console.error("Invalid credentials:", err.response.data);
          } else {
            console.error("Authentication failed:", err);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user?: any }) {
      console.log('JWT callback triggered');
      if (user) {
        console.log('User ID:', user.id);
        token.accessToken = user.token; // Store the access token in the JWT token
        token.id = user.id; // Store the user ID in the JWT token
        token.username = user.username; // Store the username in the JWT token
        token.refreshToken = user.refreshToken; // Store the refresh token in the JWT token
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      console.log('Session callback triggered');
      console.log('Token:', token);
      if (token) {
        console.log('Token ID:', token.id);
        session.accessToken = token.accessToken;
        session.user = { ...session.user, id: token.id, username: token.username, refreshToken: token.refreshToken }; // Merge the user object with the id, username, and refresh token
      } else {
        console.log('Token is undefined');
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };