import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import https from "https";

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

          if (response.data) {
            return response.data; // Ensure the API returns user data
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
      if (user) {
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
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
