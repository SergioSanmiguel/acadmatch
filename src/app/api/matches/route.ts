import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true, name: true, image: true, university: true, country: true,
          mainField: true, bio: true, collaborationInterests: true,
        },
      },
      user2: {
        select: {
          id: true, name: true, image: true, university: true, country: true,
          mainField: true, bio: true, collaborationInterests: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Normalize: always return the "other" user
  const normalized = matches.map((match) => ({
    id: match.id,
    createdAt: match.createdAt,
    otherUser: match.user1Id === userId ? match.user2 : match.user1,
    lastMessage: match.messages[0] || null,
  }));

  return NextResponse.json(normalized);
}
