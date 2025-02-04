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
            const decodedToken = jwtDecode<DecodedToken>(response.data.token);

          console.log("Login Response:", response.data);

          if (response.data) {
            const decodedToken = jwtDecode<DecodedToken>(response.data.token);
            return {
              token: response.data.token,
              id: decodedToken.userId, 
              username: credentials.username,
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
  pages: {
    signIn: "https://localhost:3000/login", // Custom login page
    error: "/error", // Error page
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      console.log('JWT callback triggered');
      if (user) {
        console.log('User ID:', user.id);
        token.accessToken = user.token; // Store the access token in the JWT token
        token.id = user.id; // Store the user ID in the JWT token
        token.username = user.username; // Store the username in the JWT token
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log('Session callback triggered');
      console.log('Token:', token);
      if (token) {
        console.log('Token ID:', token.id);
        session.accessToken = token.accessToken; 
        session.user = { ...session.user, id: token.id, username: token.username }; // Merge the user object with the id and username
      } else {
        console.log('Token is undefined');
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const, 
  },
  secret: process.env.JWT_SECRET, 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };