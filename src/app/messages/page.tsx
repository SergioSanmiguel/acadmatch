import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      messages: { some: {} },
    },
    include: {
      user1: { select: { id: true, name: true, image: true, mainField: true } },
      user2: { select: { id: true, name: true, image: true, mainField: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const normalized = matches.map((m) => ({
    id: m.id,
    otherUser: m.user1Id === userId ? m.user2 : m.user1,
    lastMessage: m.messages[0],
  }));

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <MessageSquare size={26} className="text-emerald-400" />
            Messages
          </h1>
          <p className="text-slate-400">Your active research conversations</p>
        </div>

        {normalized.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare size={40} className="mx-auto mb-4 text-slate-700" />
            <h3 className="font-display text-xl font-bold text-white mb-2">No messages yet</h3>
            <p className="text-slate-400 text-sm mb-6">Start a conversation with one of your matches.</p>
            <Link href="/matches" className="btn-primary">View matches</Link>
          </div>
        ) : (
          <div className="card divide-y divide-slate-800">
            {normalized.map((item) => (
              <Link
                key={item.id}
                href={`/messages/${item.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                {item.otherUser.image ? (
                  <Image
                    src={item.otherUser.image}
                    alt={item.otherUser.name || ''}
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                    {item.otherUser.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{item.otherUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.lastMessage?.sender.name}: {item.lastMessage?.content}
                  </p>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} />
                  {item.lastMessage && new Date(item.lastMessage.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
