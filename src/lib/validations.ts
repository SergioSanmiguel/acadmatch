import { z } from 'zod';

const safeTextField = z.string().trim().min(2).max(200);

const httpsUrlField = z
  .string()
  .trim()
  .url()
  .refine((url) => url.startsWith('https://'), 'URL must start with https://')
  .optional()
  .or(z.literal(''));

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  university: safeTextField,
  country: safeTextField,
  mainField: safeTextField,
  secondaryFields: z.array(z.string().trim().min(1).max(100)).max(5),
  researchLines: z.array(z.string().trim().min(1).max(120)).max(10),
  bio: z.string().trim().max(1000).optional(),
  orcidUrl: httpsUrlField,
  googleScholarUrl: httpsUrlField,
  personalWebsite: httpsUrlField,
  researchGateUrl: httpsUrlField,
  collaborationInterests: z.array(z.string().trim().min(1).max(100)).max(10),
});

export const swipeSchema = z.object({
  toUserId: z.string().cuid(),
  type: z.enum(['LIKE', 'PASS']),
});

export const messageSchema = z.object({
  matchId: z.string().cuid(),
  content: z.string().trim().min(1).max(2000),
});

export const filtersSchema = z.object({
  country: z.string().trim().max(100).optional(),
  university: z.string().trim().max(150).optional(),
  mainField: z.string().trim().max(100).optional(),
  collaborationInterest: z.string().trim().max(100).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SwipeInput = z.infer<typeof swipeSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type FiltersInput = z.infer<typeof filtersSchema>;
