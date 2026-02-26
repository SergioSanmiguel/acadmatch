import { User } from '@prisma/client';

// Fields that are complementary (different but likely to collaborate)
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

export function calculateCompatibilityScore(
  currentUser: Partial<User>,
  candidateUser: Partial<User>
): number {
  let score = 0;

  const currentField = currentUser.mainField;
  const candidateField = candidateUser.mainField;

  if (!currentField || !candidateField) return 50;

  // Base: complementary fields get higher score
  const complementaryFields = COMPLEMENTARY_FIELDS[currentField] || [];
  if (complementaryFields.includes(candidateField)) {
    score += 40;
  } else if (currentField === candidateField) {
    // Same field: lower complementarity score but still possible
    score += 20;
  }

  // Shared collaboration interests
  const currentInterests = currentUser.collaborationInterests || [];
  const candidateInterests = candidateUser.collaborationInterests || [];
  const sharedInterests = currentInterests.filter((i) => candidateInterests.includes(i));
  score += sharedInterests.length * 10;

  // Shared secondary fields (overlap = interdisciplinary potential)
  const currentSecondary = currentUser.secondaryFields || [];
  const candidateSecondary = candidateUser.secondaryFields || [];
  const sharedSecondary = currentSecondary.filter((f) => candidateSecondary.includes(f));
  score += sharedSecondary.length * 5;

  // Profile completeness bonus
  if (candidateUser.bio) score += 5;
  if (candidateUser.googleScholarUrl) score += 5;
  if (candidateUser.orcidUrl) score += 5;

  return Math.min(score, 100);
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
