import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { swipeSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  /* ===============================
     AUTH
  =============================== */

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      profileComplete: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const fromUserId = dbUser.id;

  /* ===============================
     RATE LIMIT
  =============================== */

  const rateLimit = enforceRateLimit({
    key: `swipe:${fromUserId}`,
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many swipe requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSec ?? 60),
        },
      }
    );
  }

  /* ===============================
     ANTI BOT BURST
  =============================== */

  const recentSwipes = await prisma.swipe.count({
    where: {
      fromUserId,
      createdAt: {
        gte: new Date(Date.now() - 10_000),
      },
    },
  });

  if (recentSwipes > 15) {
    return NextResponse.json(
      { error: "Slow down" },
      { status: 429 }
    );
  }

  /* ===============================
     BODY VALIDATION
  =============================== */

  const body = await req.json();
  const parsed = swipeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { toUserId, type } = parsed.data;

  if (fromUserId === toUserId) {
    return NextResponse.json(
      { error: "Cannot swipe yourself" },
      { status: 400 }
    );
  }

  /* ===============================
     PROFILE CHECKS
  =============================== */

  if (!dbUser.profileComplete) {
    return NextResponse.json(
      { error: "Complete your profile before swiping" },
      { status: 403 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: toUserId },
    select: {
      id: true,
      profileComplete: true,
    },
  });

  if (!targetUser?.profileComplete) {
    return NextResponse.json(
      { error: "Target user not available" },
      { status: 404 }
    );
  }

  /* ===============================
     BLOCK CHECK
  =============================== */

  const blockExists = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: fromUserId, blockedId: toUserId },
        { blockerId: toUserId, blockedId: fromUserId },
      ],
    },
    select: { id: true },
  });

  if (blockExists) {
    return NextResponse.json(
      { error: "Cannot interact with this user" },
      { status: 403 }
    );
  }

  /* ===============================
     MAIN TRANSACTION
  =============================== */

  const result = await prisma.$transaction(async (tx) => {
    /* ---------- UPSERT SWIPE ---------- */

    const swipe = await tx.swipe.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId,
        },
      },
      update: { type },
      create: {
        fromUserId,
        toUserId,
        type,
      },
    });

    /* ---------- ACTIVITY SIGNAL ---------- */

    if (type === "LIKE") {
      await tx.user.update({
        where: { id: fromUserId },
        data: {
          lastActiveAt: new Date(), // ⚠ requires prisma field
        },
      });
    }

    /* ---------- ONLY LIKE CAN MATCH ---------- */

    if (type !== "LIKE") {
      return { swipe, match: null };
    }

    /* ---------- RECIPROCAL LIKE ---------- */

    const reciprocalLike = await tx.swipe.findFirst({
      where: {
        fromUserId: toUserId,
        toUserId: fromUserId,
        type: "LIKE",
      },
      select: { id: true },
    });

    if (!reciprocalLike) {
      return { swipe, match: null };
    }

    /* ---------- DETERMINISTIC ORDER ---------- */

    const [user1Id, user2Id] =
      fromUserId < toUserId
        ? [fromUserId, toUserId]
        : [toUserId, fromUserId];

    /* ---------- UPSERT MATCH (RACE SAFE) ---------- */

    const match = await tx.match.upsert({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      update: {},
      create: {
        user1Id,
        user2Id,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
            mainField: true,
            university: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
            mainField: true,
            university: true,
          },
        },
      },
    });

    return { swipe, match };
  });

  /* ===============================
     RESPONSE
  =============================== */

  return NextResponse.json({
    swipe: result.swipe,
    match: result.match,
    isMatch: !!result.match,
  });
}
