import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  ...authConfig,

  callbacks: {
  async signIn({ user, profile }) {
    if (profile?.login) {
      await prisma.user.update({
        where: { id: user.id },
        data: { githubUsername: profile.login as string },
      })
    }
    return true
  },

  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
    }
    return token
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string
    }
    return session
  },
},
})