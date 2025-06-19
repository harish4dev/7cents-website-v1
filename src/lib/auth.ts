// utils/auth.ts
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Upsert user in your backend
        const backendUrl = process.env.BACKEND_URL;
        const res = await axios.post(`${backendUrl}/api/user/createOrUpdate`, {
          email: user.email,
          name: user.name,
        });

        // Attach DB user ID to user object for next callback
        user.id = res.data.id;
      } catch (e) {
        console.error("User registration failed:", e);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId && session.user) {
        session.user.id = token.userId as string;
        console.log(session.user.id)
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
