import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { messageSchema } from '@/lib/validations';
import { sanitizeString } from '@/lib/utils';
import { enforceRateLimit } from '@/lib/security';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const matchId = req.nextUrl.searchParams.get('matchId');
  const cursor = req.nextUrl.searchParams.get('cursor');

  if (!matchId) {
    return NextResponse.json({ error: 'matchId required' }, { status: 400 });
  }

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      status: 'ACTIVE',
      OR: [
        { user1Id: session.user.id },
        { user2Id: session.user.id },
      ],
    },
    select: { id: true },
  });

  if (!match) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    take: 50,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: 'desc' }, // traer últimos primero
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({
    data: messages.reverse(), // devolver en orden cronológico
    nextCursor: messages.length
      ? messages[messages.length - 1].id
      : null,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = enforceRateLimit({
    key: `message:${session.user.id}`,
    limit: 40,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please wait.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSec ?? 60) },
      }
    );
  }

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { matchId, content } = parsed.data;

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      status: 'ACTIVE',
      OR: [
        { user1Id: session.user.id },
        { user2Id: session.user.id },
      ],
    },
    select: { id: true },
  });

  if (!match) {
    return NextResponse.json(
      { error: 'Not authorized for this match' },
      { status: 403 }
    );
  }

  // Sanitizar y limitar longitud final
  const cleanContent = sanitizeString(content).slice(0, 1000);

  if (!cleanContent.trim()) {
    return NextResponse.json(
      { error: 'Message cannot be empty' },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      matchId,
      senderId: session.user.id,
      content: cleanContent,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
