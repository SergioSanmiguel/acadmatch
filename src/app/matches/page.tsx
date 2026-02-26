import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Heart, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;
  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      user1: { select: { id: true, name: true, image: true, mainField: true, university: true, country: true, collaborationInterests: true } },
      user2: { select: { id: true, name: true, image: true, mainField: true, university: true, country: true, collaborationInterests: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const normalized = matches.map((m) => ({
    id: m.id,
    createdAt: m.createdAt,
    otherUser: m.user1Id === userId ? m.user2 : m.user1,
    lastMessage: m.messages[0] || null,
  }));

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Heart size={26} className="text-rose-400" />
            Your Matches
          </h1>
          <p className="text-slate-400">{normalized.length} researchers interested in collaborating</p>
        </div>

        {normalized.length === 0 ? (
          <div className="card p-12 text-center">
            <Heart size={40} className="mx-auto mb-4 text-slate-700" />
            <h3 className="font-display text-xl font-bold text-white mb-2">No matches yet</h3>
            <p className="text-slate-400 text-sm mb-6">Start swiping to find researchers who share your collaboration interests.</p>
            <Link href="/feed" className="btn-primary">Discover researchers</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalized.map((match) => (
              <div key={match.id} className="card-hover p-5">
                <div className="flex items-start gap-4 mb-4">
                  {match.otherUser.image ? (
                    <Image
                      src={match.otherUser.image}
                      alt={match.otherUser.name || ''}
                      width={52}
                      height={52}
                      className="rounded-full ring-2 ring-indigo-500/30 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-indigo-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                      {match.otherUser.name?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{match.otherUser.name}</p>
                    <p className="text-sm text-indigo-300">{match.otherUser.mainField}</p>
                    <p className="text-xs text-slate-500">{match.otherUser.university} · {match.otherUser.country}</p>
                  </div>
                </div>

                {match.otherUser.collaborationInterests?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {match.otherUser.collaborationInterests.slice(0, 2).map((i) => (
                      <span key={i} className="tag-emerald">{i}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={10} />
                    Matched {new Date(match.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/messages/${match.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors border border-indigo-500/20"
                  >
                    <MessageSquare size={12} />
                    {match.lastMessage ? 'Continue chat' : 'Start chatting'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
