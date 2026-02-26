import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { filtersSchema } from '@/lib/validations';
import { sortByCompatibility } from '@/lib/recommendation';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = filtersSchema.safeParse({
    country: searchParams.get('country') || undefined,
    university: searchParams.get('university') || undefined,
    mainField: searchParams.get('mainField') || undefined,
    collaborationInterest: searchParams.get('collaborationInterest') || undefined,
  });

  // Get already swiped user IDs
  const swipedIds = await prisma.swipe.findMany({
    where: { fromUserId: session.user.id },
    select: { toUserId: true },
  });
  const excludeIds = [session.user.id, ...swipedIds.map((s) => s.toUserId)];

  const whereClause: any = {
    id: { notIn: excludeIds },
    profileComplete: true,
  };

  if (filters.success && filters.data) {
    const { country, university, mainField, collaborationInterest } = filters.data;
    if (country) whereClause.country = { contains: country, mode: 'insensitive' };
    if (university) whereClause.university = { contains: university, mode: 'insensitive' };
    if (mainField) whereClause.mainField = { contains: mainField, mode: 'insensitive' };
    if (collaborationInterest) {
      whereClause.collaborationInterests = { has: collaborationInterest };
    }
  }

  const candidates = await prisma.user.findMany({
    where: whereClause,
    take: 50,
    select: {
      id: true, name: true, image: true, university: true, country: true,
      mainField: true, secondaryFields: true, researchLines: true, bio: true,
      orcidUrl: true, googleScholarUrl: true, personalWebsite: true,
      researchGateUrl: true, collaborationInterests: true, createdAt: true,
    },
  });

  // Get current user for recommendation
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mainField: true, secondaryFields: true, collaborationInterests: true },
  });

  const sorted = currentUser ? sortByCompatibility(currentUser, candidates) : candidates;

  return NextResponse.json(sorted);
}
