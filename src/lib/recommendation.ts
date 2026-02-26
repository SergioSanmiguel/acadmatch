import { User } from '@prisma/client';

const COMPLEMENTARY_FIELDS: Record<string, string[]> = {
  'Computer Science': ['Biology', 'Medicine', 'Psychology', 'Linguistics', 'Economics', 'Physics'],
  'Biology': ['Computer Science', 'Chemistry', 'Mathematics', 'Engineering', 'Medicine'],
  'Medicine': ['Computer Science', 'Biology', 'Psychology', 'Chemistry', 'Engineering'],
  'Physics': ['Mathematics', 'Engineering', 'Computer Science', 'Chemistry', 'Biology'],
  'Mathematics': ['Physics', 'Computer Science', 'Economics', 'Statistics', 'Engineering'],
  'Psychology': ['Neuroscience', 'Computer Science', 'Medicine', 'Sociology', 'Biology'],
  'Economics': ['Mathematics', 'Computer Science', 'Psychology', 'Political Science', 'Statistics'],
  'Engineering': ['Physics', 'Mathematics', 'Computer Science', 'Biology', 'Chemistry'],
  'Chemistry': ['Biology', 'Physics', 'Medicine', 'Engineering', 'Environmental Science'],
  'Sociology': ['Psychology', 'Economics', 'Political Science', 'Statistics', 'Computer Science'],
};

function jaccardSimilarity(a: string[] = [], b: string[] = []) {
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;

  if (union === 0) return 0;
  return intersection / union;
}

export function calculateCompatibilityScore(
  currentUser: Partial<User>,
  candidateUser: Partial<User>
): number {
  let score = 0;

  const currentField = currentUser.mainField;
  const candidateField = candidateUser.mainField;

  if (!currentField || !candidateField) return 40;

  // 1️⃣ Complementarity
  const complementaryFields = COMPLEMENTARY_FIELDS[currentField] || [];
  if (complementaryFields.includes(candidateField)) {
    score += 35;
  } else if (currentField === candidateField) {
    score += 15; // same field less valuable than complementary
  }

  // 2️⃣ Collaboration interest similarity (Jaccard weighted)
  const interestSimilarity = jaccardSimilarity(
    currentUser.collaborationInterests,
    candidateUser.collaborationInterests
  );
  score += interestSimilarity * 30;

  // 3️⃣ Secondary field interdisciplinarity
  const secondarySimilarity = jaccardSimilarity(
    currentUser.secondaryFields,
    candidateUser.secondaryFields
  );
  score += secondarySimilarity * 15;

  // 4️⃣ Profile strength bonus
  let profileStrength = 0;
  if (candidateUser.bio) profileStrength += 1;
  if (candidateUser.googleScholarUrl) profileStrength += 1;
  if (candidateUser.orcidUrl) profileStrength += 1;
  if (candidateUser.researchGateUrl) profileStrength += 1;

  score += profileStrength * 3;

  // 5️⃣ Recency boost (new users slight priority)
  if (candidateUser.createdAt) {
    const daysOld =
      (Date.now() - new Date(candidateUser.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysOld < 14) {
      score += 5;
    }
  }

  return Math.min(Math.round(score), 100);
}

export function sortByCompatibility<T extends Partial<User>>(
  currentUser: Partial<User>,
  candidates: T[]
): T[] {
  return [...candidates].sort((a, b) => {
    const scoreA = calculateCompatibilityScore(currentUser, a);
    const scoreB = calculateCompatibilityScore(currentUser, b);
    return scoreB - scoreA;
  });
}
