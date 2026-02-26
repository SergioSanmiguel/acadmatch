import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { swipeSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = swipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { toUserId, type } = parsed.data;
  const fromUserId = session.user.id;

  if (fromUserId === toUserId) {
    return NextResponse.json({ error: 'Cannot swipe yourself' }, { status: 400 });
  }

  // Upsert swipe
  const swipe = await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId, toUserId } },
    update: { type },
    create: { fromUserId, toUserId, type },
  });

  let match = null;

  // Check for mutual LIKE
  if (type === 'LIKE') {
    const reciprocalLike = await prisma.swipe.findFirst({
      where: { fromUserId: toUserId, toUserId: fromUserId, type: 'LIKE' },
    });

    if (reciprocalLike) {
      // Create match (ensure consistent ordering to avoid duplicates)
      const [user1Id, user2Id] = [fromUserId, toUserId].sort();
      match = await prisma.match.upsert({
        where: { user1Id_user2Id: { user1Id, user2Id } },
        update: {},
        create: { user1Id, user2Id },
      });
    }
  }

  return NextResponse.json({ swipe, match, isMatch: !!match });
}
