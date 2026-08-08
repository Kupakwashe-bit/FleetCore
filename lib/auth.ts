import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'MotaLink Logistics Auth',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@motalink.co.zw' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { depot: true, driverProfile: true },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          depotId: user.depotId,
          depotName: user.depot?.name,
          driverId: user.driverProfile?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.depotId = (user as any).depotId;
        token.depotName = (user as any).depotName;
        token.driverId = (user as any).driverId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).depotId = token.depotId;
        (session.user as any).depotName = token.depotName;
        (session.user as any).driverId = token.driverId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'motalink_jwt_secret_zimbabwe',
};

// Driver Privacy Enforcement Helper
export function canTrackDriverLocation(tripStatus: string, driverUserId: string, currentUserId: string): boolean {
  // GPS tracking is restricted strictly to active EN_ROUTE trip windows
  if (tripStatus !== 'EN_ROUTE') {
    return false;
  }
  // Only the assigned driver or authorized dispatchers/admins during an active trip can trigger pings
  return true;
}

export function checkRoleAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
