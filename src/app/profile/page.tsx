import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileEditClient } from '@/components/profile/ProfileEditClient';
import AppLayout from '@/components/layout/AppLayout';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true, university: true, country: true,
      mainField: true, secondaryFields: true, researchLines: true, bio: true,
      orcidUrl: true, googleScholarUrl: true, personalWebsite: true, researchGateUrl: true,
      collaborationInterests: true, profileComplete: true,
    },
  });

  if (!user) redirect('/auth/signin');

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-slate-400">Manage your academic research profile</p>
        </div>
        <ProfileEditClient user={user} />
      </div>
    </AppLayout>
  );
}
