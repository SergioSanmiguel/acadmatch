import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { swipeSchema } from '@/lib/validations';
import { enforceRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = enforceRateLimit({
    key: `swipe:${session.user.id}`,
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many swipe requests' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec ?? 60) } });
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

  const target = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true, profileComplete: true },
  });

  if (!target?.profileComplete) {
    return NextResponse.json({ error: 'Target user is not available' }, { status: 404 });
  }

  const existingBlock = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: fromUserId, blockedId: toUserId },
        { blockerId: toUserId, blockedId: fromUserId },
      ],
    },
    select: { id: true },
  });

  if (existingBlock) {
    return NextResponse.json({ error: 'Cannot interact with this user' }, { status: 403 });
  }

  const swipe = await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId, toUserId } },
    update: { type },
    create: { fromUserId, toUserId, type },
  });

  let match = null;

  if (type === 'LIKE') {
    const reciprocalLike = await prisma.swipe.findFirst({
      where: { fromUserId: toUserId, toUserId: fromUserId, type: 'LIKE' },
    });

    if (reciprocalLike) {
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
