import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { FeedClient } from '@/components/feed/FeedClient';

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Discover Researchers</h1>
          <p className="text-slate-400">Find your next interdisciplinary collaborator</p>
        </div>
        <FeedClient />
      </div>
    </AppLayout>
  );
}
