import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { ChatClient } from '@/components/messaging/ChatClient';

export default async function ChatPage({ params }: { params: { matchId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;
  const match = await prisma.match.findFirst({
    where: {
      id: params.matchId,
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: { select: { id: true, name: true, image: true, mainField: true, university: true } },
      user2: { select: { id: true, name: true, image: true, mainField: true, university: true } },
    },
  });

  if (!match) notFound();

  const otherUser = match.user1Id === userId ? match.user2 : match.user1;

  const messages = await prisma.message.findMany({
    where: { matchId: params.matchId },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <AppLayout>
      <ChatClient
        matchId={params.matchId}
        currentUserId={userId}
        otherUser={otherUser}
        initialMessages={messages}
      />
    </AppLayout>
  );
}
