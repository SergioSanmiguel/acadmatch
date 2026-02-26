import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  university: z.string().min(2).max(200),
  country: z.string().min(2).max(100),
  mainField: z.string().min(2).max(100),
  secondaryFields: z.array(z.string()).max(5),
  researchLines: z.array(z.string()).max(10),
  bio: z.string().max(1000).optional(),
  orcidUrl: z.string().url().optional().or(z.literal('')),
  googleScholarUrl: z.string().url().optional().or(z.literal('')),
  personalWebsite: z.string().url().optional().or(z.literal('')),
  researchGateUrl: z.string().url().optional().or(z.literal('')),
  collaborationInterests: z.array(z.string()).max(10),
});

export const swipeSchema = z.object({
  toUserId: z.string().cuid(),
  type: z.enum(['LIKE', 'PASS']),
});

export const messageSchema = z.object({
  matchId: z.string().cuid(),
  content: z.string().min(1).max(2000),
});

export const filtersSchema = z.object({
  country: z.string().optional(),
  university: z.string().optional(),
  mainField: z.string().optional(),
  collaborationInterest: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SwipeInput = z.infer<typeof swipeSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type FiltersInput = z.infer<typeof filtersSchema>;
