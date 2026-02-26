import { prisma } from '@/lib/prisma';

const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

const MAX_ENTRIES = 10000;

export function enforceRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();

  // Limpieza ocasional para evitar crecimiento infinito
  if (rateLimitStore.size > MAX_ENTRIES) {
    const cutoff = now - windowMs;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.windowStart < cutoff) {
        rateLimitStore.delete(k);
      }
    }
  }

  const current = rateLimitStore.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (current.count >= limit) {
    const retryAfterSec = Math.ceil(
      (windowMs - (now - current.windowStart)) / 1000
    );
    return { allowed: false, retryAfterSec };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return { allowed: true };
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  });

  return blocks.map((b) =>
    b.blockerId === userId ? b.blockedId : b.blockerId
  );
}
