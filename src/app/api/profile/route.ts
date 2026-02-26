import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validations';
import { sanitizeString, sanitizeArray } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true, university: true,
      country: true, mainField: true, secondaryFields: true, researchLines: true,
      bio: true, orcidUrl: true, googleScholarUrl: true, personalWebsite: true,
      researchGateUrl: true, collaborationInterests: true, profileComplete: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: sanitizeString(data.name),
      university: sanitizeString(data.university),
      country: sanitizeString(data.country),
      mainField: sanitizeString(data.mainField),
      secondaryFields: sanitizeArray(data.secondaryFields),
      researchLines: sanitizeArray(data.researchLines),
      bio: data.bio ? sanitizeString(data.bio) : null,
      orcidUrl: data.orcidUrl || null,
      googleScholarUrl: data.googleScholarUrl || null,
      personalWebsite: data.personalWebsite || null,
      researchGateUrl: data.researchGateUrl || null,
      collaborationInterests: sanitizeArray(data.collaborationInterests),
      profileComplete: true,
    },
  });

  return NextResponse.json(updatedUser);
}
