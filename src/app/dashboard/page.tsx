import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageSquare, Users, Layers, ArrowRight, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

async function getDashboardData(userId: string) {
  const [matchesCount, user, recentMatches] = await Promise.all([
    prisma.match.count({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, university: true, mainField: true, profileComplete: true },
    }),
    prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user1: { select: { id: true, name: true, image: true, mainField: true, university: true } },
        user2: { select: { id: true, name: true, image: true, mainField: true, university: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
  ]);

  return { matchesCount, user, recentMatches };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const { matchesCount, user, recentMatches } = await getDashboardData(session.user.id);

  const normalizedMatches = recentMatches.map((m) => ({
    id: m.id,
    createdAt: m.createdAt,
    otherUser: m.user1Id === session.user.id ? m.user2 : m.user1,
    lastMessage: m.messages[0] || null,
  }));

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400">
            {user?.university} · {user?.mainField}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Heart size={20} className="text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{matchesCount}</p>
                <p className="text-sm text-slate-400">Matches</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Layers size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">∞</p>
                <p className="text-sm text-slate-400">Profiles to discover</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Users size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Global</p>
                <p className="text-sm text-slate-400">Research network</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Matches */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <Heart size={18} className="text-rose-400" />
                Recent Matches
              </h2>
              <Link href="/matches" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-3">
              {normalizedMatches.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  <Heart size={24} className="mx-auto mb-2 opacity-30" />
                  No matches yet. Start discovering!
                </div>
              ) : (
                normalizedMatches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/messages/${match.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors"
                  >
                    {match.otherUser.image ? (
                      <Image
                        src={match.otherUser.image}
                        alt={match.otherUser.name || ''}
                        width={42}
                        height={42}
                        className="rounded-full ring-2 ring-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white">
                        {match.otherUser.name?.[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{match.otherUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{match.otherUser.mainField} · {match.otherUser.university}</p>
                    </div>
                    {match.lastMessage && (
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <Clock size={10} />
                        <span>{new Date(match.lastMessage.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Link href="/feed" className="card-hover p-5 flex items-center gap-4 block group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                <Layers size={22} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Discover Researchers</p>
                <p className="text-sm text-slate-400">Browse profiles and find collaborators</p>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link href="/messages" className="card-hover p-5 flex items-center gap-4 block group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-600/30 transition-colors">
                <MessageSquare size={22} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Messages</p>
                <p className="text-sm text-slate-400">Chat with your research matches</p>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link href="/profile" className="card-hover p-5 flex items-center gap-4 block group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-600/30 transition-colors">
                <Users size={22} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Edit Profile</p>
                <p className="text-sm text-slate-400">Update your research interests</p>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
