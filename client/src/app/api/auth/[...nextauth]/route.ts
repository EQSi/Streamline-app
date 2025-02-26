// filepath: /Users/jtwellspring/repos/Streamline-app/client/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };