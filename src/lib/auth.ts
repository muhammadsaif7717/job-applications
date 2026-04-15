import { getServerSession } from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { NextResponse } from 'next/server'

type JwtCallbackParams = {
  token: Record<string, unknown> & {
    id?: string
    email?: string | null
    sub?: string | null
  }
  user?: {
    id?: string | null
    email?: string | null
  }
}

type SessionCallbackParams = {
  session: {
    expires: string
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
  token: {
    [key: string]: unknown
    id?: string
    email?: string | null
    sub?: string | null
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: '/auth/sign-in'
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    jwt({ token, user }: JwtCallbackParams) {
      if (user?.id) {
        token.id = user.id
      }

      if (user?.email) {
        token.email = user.email
      }

      return token
    },
    session({ session, token }: SessionCallbackParams) {
      if (session.user) {
        session.user.id =
          typeof token.id === 'string'
            ? token.id
            : typeof token.sub === 'string'
              ? token.sub
              : undefined
        session.user.email = typeof token.email === 'string' ? token.email : session.user.email
      }

      return session
    },
  },
}

export async function getAuthenticatedUser() {
  const session = (await getServerSession(authOptions as never)) as
    | {
        user?: {
          id?: string
          email?: string | null
        }
      }
    | null

  if (!session?.user?.email) {
    return null
  }

  return {
    session,
    userId: session.user.id ?? null,
    userEmail: session.user.email,
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: 'Authentication required' },
    { status: 401 }
  )
}

export function buildOwnerFilter(userId: string | null, userEmail: string) {
  if (userId) {
    return {
      $or: [{ userId }, { userEmail }],
    }
  }

  return { userEmail }
}
