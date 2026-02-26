import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const favoriteSchema = z.object({ favoritedId: z.string().cuid() });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      favorited: {
        select: {
          id: true, name: true, image: true, university: true, country: true,
          mainField: true, collaborationInterests: true, bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(favorites.map((f) => f.favorited));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const { favoritedId } = parsed.data;
  if (favoritedId === session.user.id) return NextResponse.json({ error: 'Cannot favorite yourself' }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_favoritedId: { userId: session.user.id, favoritedId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_favoritedId: { userId: session.user.id, favoritedId } },
    });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId: session.user.id, favoritedId } });
  return NextResponse.json({ favorited: true });
}
