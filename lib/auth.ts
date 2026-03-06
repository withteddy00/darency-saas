import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Debug logging in development
const isDev = process.env.NODE_ENV === 'development'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          if (isDev) console.log('[auth] Missing email or password')
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            organization: true,
            apartment: {
              include: {
                residence: true
              }
            },
            adminForResidence: true
          }
        })

        if (!user) {
          if (isDev) console.log('[auth] No user found with email:', credentials.email)
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          if (isDev) console.log('[auth] Invalid password for user:', credentials.email)
          throw new Error('Invalid password')
        }

        if (isDev) {
          console.log('[auth] Login success:', { email: user.email, role: user.role })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
          apartmentId: user.apartmentId ?? undefined,
          apartmentNumber: user.apartment?.number ?? undefined,
          residenceId: user.adminForResidenceId ?? undefined,
          residenceName: user.adminForResidence?.name ?? undefined
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
        token.apartmentId = user.apartmentId
        token.apartmentNumber = user.apartmentNumber
        token.residenceId = user.residenceId
        token.residenceName = user.residenceName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
        session.user.apartmentId = token.apartmentId as string | undefined
        session.user.apartmentNumber = token.apartmentNumber as string | undefined
        session.user.residenceId = token.residenceId as string | undefined
        session.user.residenceName = token.residenceName as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: '/fr/login',
    error: '/fr/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: isDev ? 'next-auth.session-token' : '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !isDev,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production'
}

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    organizationId: string
    organizationName: string
    apartmentId?: string
    apartmentNumber?: string
    residenceId?: string
    residenceName?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      organizationId: string
      organizationName: string
      apartmentId?: string
      apartmentNumber?: string
      residenceId?: string
      residenceName?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    organizationId: string
    organizationName: string
    apartmentId?: string
    apartmentNumber?: string
    residenceId?: string
    residenceName?: string
  }
}
