import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Adapter } from 'next-auth/adapters';
import { prisma } from '@/lib/prisma';

const ACADEMIC_DOMAIN_SUFFIXES = [
  '.edu',
  '.ac.uk',
  '.ac.in',
  '.ac.jp',
  '.ac.za',
  '.ac.nz',
  '.ac.au',
  '.edu.au',
  '.edu.br',
  '.edu.mx',
  '.edu.ar',
  '.edu.co',
  '.edu.pe',
  '.edu.cn',
  '.edu.sg',
  '.edu.hk',
  '.edu.tw',
];

export function isAcademicEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  return ACADEMIC_DOMAIN_SUFFIXES.some((suffix) =>
    domain.endsWith(suffix)
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;

      if (!profile?.email_verified) {
        return '/auth/error?error=EmailNotVerified';
      }

      if (!isAcademicEmail(user.email)) {
        return '/auth/error?error=NotAcademic';
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (
        token.id &&
        (!('profileComplete' in token) || trigger === 'update')
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { profileComplete: true },
        });

        token.profileComplete = dbUser?.profileComplete ?? false;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.profileComplete = Boolean(token.profileComplete);
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
  },

  useSecureCookies: process.env.NODE_ENV === 'production',
};
