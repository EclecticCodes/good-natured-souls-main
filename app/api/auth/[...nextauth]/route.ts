import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const result = await sql`
            SELECT * FROM customers WHERE email = ${credentials.email}
          `;
          const customer = result[0];
          if (!customer || !customer.password_hash) return null;
          const valid = await bcrypt.compare(credentials.password, customer.password_hash);
          if (!valid) return null;
          return {
            id: String(customer.id),
            email: customer.email,
            name: customer.name || customer.email.split("@")[0],
            image: customer.avatar || null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await sql`
            INSERT INTO customers (email, name, avatar, google_id)
            VALUES (${user.email}, ${user.name}, ${user.image}, ${account.providerAccountId})
            ON CONFLICT (email) DO UPDATE SET
              name = COALESCE(customers.name, ${user.name}),
              avatar = COALESCE(customers.avatar, ${user.image}),
              google_id = COALESCE(customers.google_id, ${account.providerAccountId}),
              updated_at = NOW()
          `;
        } catch (err) {
          console.error("Failed to upsert Google customer:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
