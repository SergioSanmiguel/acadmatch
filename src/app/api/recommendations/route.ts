import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { sortByCompatibility } from "@/lib/recommendation";

/**
 * GET /api/recommendations
 *
 * Returns ranked academic recommendations
 */
export async function GET() {
  try {
    /* ---------------- AUTH ---------------- */

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ------------ CURRENT USER ------------ */

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* -------- USERS ALREADY SWIPED -------- */

    const swipes = await prisma.swipe.findMany({
      where: {
        fromUserId: currentUser.id,
      },
      select: {
        toUserId: true,
      },
    });

    const swipedUserIds = swipes.map(s => s.toUserId);

    /* ------------ BLOCKED USERS ------------ */

    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: currentUser.id },
          { blockedId: currentUser.id },
        ],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const blockedIds = blocks.flatMap(b => [
      b.blockerId,
      b.blockedId,
    ]);

    /* ------------ EXISTING MATCHES ------------ */

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    const matchedIds = matches.flatMap(m => [
      m.user1Id,
      m.user2Id,
    ]);

    /* ------------ EXCLUDED IDS ------------ */

    const excludedIds = new Set([
      currentUser.id,
      ...swipedUserIds,
      ...blockedIds,
      ...matchedIds,
    ]);

    /* ------------ CANDIDATES QUERY ------------ */

    const candidates = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...excludedIds],
        },
        profileComplete: true,
      },
      take: 100, // fetch pool
    });

    /* ------------ COMPATIBILITY SORT ------------ */

    const rankedUsers = sortByCompatibility(
      currentUser,
      candidates
    );

    /* ------------ LIMIT FINAL RESULT ------------ */

    const recommendations = rankedUsers.slice(0, 20);

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      users: recommendations,
    });

  } catch (error) {
    console.error("Recommendation error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}