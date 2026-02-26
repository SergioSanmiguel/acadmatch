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

  const fromUserId = session.user.id;

  const rateLimit = enforceRateLimit({
    key: `swipe:${fromUserId}`,
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many swipe requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSec ?? 60) },
      }
    );
  }

  const body = await req.json();
  const parsed = swipeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { toUserId, type } = parsed.data;

  if (fromUserId === toUserId) {
    return NextResponse.json(
      { error: 'Cannot swipe yourself' },
      { status: 400 }
    );
  }

  // Verificar que el usuario actual tenga perfil completo
  const currentUser = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { profileComplete: true },
  });

  if (!currentUser?.profileComplete) {
    return NextResponse.json(
      { error: 'Complete your profile before swiping' },
      { status: 403 }
    );
  }

  // Verificar que el usuario objetivo exista y esté disponible
  const target = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true, profileComplete: true },
  });

  if (!target?.profileComplete) {
    return NextResponse.json(
      { error: 'Target user is not available' },
      { status: 404 }
    );
  }

  // Verificar bloqueos en ambos sentidos
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
    return NextResponse.json(
      { error: 'Cannot interact with this user' },
      { status: 403 }
    );
  }

  let createdMatch = null;

  const result = await prisma.$transaction(async (tx) => {
    // Crear o actualizar swipe
    const swipe = await tx.swipe.upsert({
      where: {
        fromUserId_toUserId: { fromUserId, toUserId },
      },
      update: { type },
      create: { fromUserId, toUserId, type },
    });

    // Solo procesar match si es LIKE
    if (type !== 'LIKE') {
      return { swipe, match: null };
    }

    // Verificar reciprocidad
    const reciprocalLike = await tx.swipe.findFirst({
      where: {
        fromUserId: toUserId,
        toUserId: fromUserId,
        type: 'LIKE',
      },
      select: { id: true },
    });

    if (!reciprocalLike) {
      return { swipe, match: null };
    }

    // Ordenar IDs para evitar duplicados invertidos
    const [user1Id, user2Id] =
      fromUserId < toUserId
        ? [fromUserId, toUserId]
        : [toUserId, fromUserId];

    // Verificar si ya existe match
    const existingMatch = await tx.match.findUnique({
      where: {
        user1Id_user2Id: { user1Id, user2Id },
      },
    });

    if (existingMatch) {
      return { swipe, match: existingMatch };
    }

    // Crear match
    const match = await tx.match.create({
      data: { user1Id, user2Id },
    });

    return { swipe, match };
  });

  createdMatch = result.match;

  return NextResponse.json({
    swipe: result.swipe,
    match: createdMatch,
    isMatch: !!createdMatch,
  });
}
