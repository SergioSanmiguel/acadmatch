import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [countries, universities, fields] = await Promise.all([
    prisma.user.findMany({
      where: { profileComplete: true, country: { not: null } },
      select: { country: true },
      distinct: ['country'],
    }),
    prisma.user.findMany({
      where: { profileComplete: true, university: { not: null } },
      select: { university: true },
      distinct: ['university'],
    }),
    prisma.user.findMany({
      where: { profileComplete: true, mainField: { not: null } },
      select: { mainField: true },
      distinct: ['mainField'],
    }),
  ]);

  return NextResponse.json({
    countries: countries.map((c) => c.country).filter(Boolean).sort(),
    universities: universities.map((u) => u.university).filter(Boolean).sort(),
    fields: fields.map((f) => f.mainField).filter(Boolean).sort(),
  });
}
