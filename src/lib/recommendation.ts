import { User } from "@prisma/client";

/**
 * Fields that naturally collaborate together
 * (Interdisciplinary research compatibility)
 */
export const COMPLEMENTARY_FIELDS: Record<string, string[]> = {
  "Computer Science": ["Biology", "Medicine", "Psychology", "Linguistics", "Economics", "Physics"],
  Biology: ["Computer Science", "Chemistry", "Mathematics", "Engineering", "Medicine"],
  Medicine: ["Computer Science", "Biology", "Psychology", "Chemistry", "Engineering"],
  Physics: ["Mathematics", "Engineering", "Computer Science", "Chemistry"],
  Mathematics: ["Physics", "Computer Science", "Economics", "Statistics"],
  Psychology: ["Neuroscience", "Computer Science", "Medicine", "Sociology"],
  Economics: ["Mathematics", "Computer Science", "Political Science", "Statistics"],
  Engineering: ["Physics", "Mathematics", "Computer Science", "Biology"],
  Chemistry: ["Biology", "Physics", "Medicine", "Engineering"],
  Sociology: ["Psychology", "Economics", "Political Science"],
};

/* ------------------------------------------------ */
/* ---------------- UTILITIES --------------------- */
/* ------------------------------------------------ */

function safeArray(arr?: string[]) {
  return Array.isArray(arr) ? arr : [];
}

function jaccardSimilarity(a?: string[], b?: string[]) {
  const setA = new Set(safeArray(a));
  const setB = new Set(safeArray(b));

  if (setA.size === 0 && setB.size === 0) return 0;

  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

function daysSince(date?: Date) {
  if (!date) return 999;

  return (
    (Date.now() - new Date(date).getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

/* ------------------------------------------------ */
/* ----------- PROFILE COMPLETENESS --------------- */
/* ------------------------------------------------ */

function profileStrength(user: Partial<User>) {
  let strength = 0;

  if (user.bio) strength++;
  if (user.googleScholarUrl) strength++;
  if (user.orcidUrl) strength++;
  if (user.researchGateUrl) strength++;
  if (user.personalWebsite) strength++;
  if (user.university) strength++;
  if (user.researchLines?.length) strength++;

  return strength;
}

/* ------------------------------------------------ */
/* -------- COMPATIBILITY SCORE ENGINE ------------ */
/* ------------------------------------------------ */

export function calculateCompatibilityScore(
  currentUser: Partial<User>,
  candidate: Partial<User>
): number {

  if (!currentUser.id || !candidate.id) return 0;
  if (currentUser.id === candidate.id) return 0;

  let score = 0;

  const currentField = currentUser.mainField;
  const candidateField = candidate.mainField;

  /* ---------- 1️⃣ FIELD RELATION (40 pts) ---------- */

  if (currentField && candidateField) {
    const complementary =
      COMPLEMENTARY_FIELDS[currentField] || [];

    if (complementary.includes(candidateField)) {
      score += 40;
    } else if (currentField === candidateField) {
      score += 20;
    }
  }

  /* ---------- 2️⃣ COLLABORATION INTERESTS (25 pts) ---------- */

  score +=
    jaccardSimilarity(
      currentUser.collaborationInterests,
      candidate.collaborationInterests
    ) * 25;

  /* ---------- 3️⃣ SECONDARY FIELDS (15 pts) ---------- */

  score +=
    jaccardSimilarity(
      currentUser.secondaryFields,
      candidate.secondaryFields
    ) * 15;

  /* ---------- 4️⃣ RESEARCH LINES MATCH (10 pts) ---------- */

  score +=
    jaccardSimilarity(
      currentUser.researchLines,
      candidate.researchLines
    ) * 10;

  /* ---------- 5️⃣ PROFILE QUALITY (7 pts) ---------- */

  score += profileStrength(candidate) * 1;

  /* ---------- 6️⃣ NEW USER BOOST (3 pts) ---------- */

  const age = daysSince(candidate.createdAt);
  if (age < 14) score += 3;

  /* ---------- FINAL NORMALIZATION ---------- */

  return Math.min(Math.round(score), 100);
}

/* ------------------------------------------------ */
/* ------------ SORT RECOMMENDATIONS -------------- */
/* ------------------------------------------------ */

export function sortByCompatibility<T extends Partial<User>>(
  currentUser: Partial<User>,
  candidates: T[]
): T[] {

  return [...candidates]
    .map((candidate) => ({
      user: candidate,
      score: calculateCompatibilityScore(
        currentUser,
        candidate
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.user);
}

/* ------------------------------------------------ */
/* --------- DEBUG / EXPLAIN MATCH SCORE ---------- */
/* ------------------------------------------------ */

export function explainCompatibility(
  currentUser: Partial<User>,
  candidate: Partial<User>
) {
  return {
    fieldScore: jaccardSimilarity(
      [currentUser.mainField || ""],
      [candidate.mainField || ""]
    ),

    collaborationOverlap: jaccardSimilarity(
      currentUser.collaborationInterests,
      candidate.collaborationInterests
    ),

    secondaryOverlap: jaccardSimilarity(
      currentUser.secondaryFields,
      candidate.secondaryFields
    ),

    researchOverlap: jaccardSimilarity(
      currentUser.researchLines,
      candidate.researchLines
    ),
  };
}
