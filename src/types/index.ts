import { User, Match, Message, Swipe } from '@prisma/client';

export type SafeUser = Omit<User, 'emailVerified'>;

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  university: string | null;
  country: string | null;
  mainField: string | null;
  secondaryFields: string[];
  researchLines: string[];
  bio: string | null;
  orcidUrl: string | null;
  googleScholarUrl: string | null;
  personalWebsite: string | null;
  researchGateUrl: string | null;
  collaborationInterests: string[];
  profileComplete: boolean;
  createdAt: Date;
};

export type MatchWithUsers = Match & {
  user1: UserProfile;
  user2: UserProfile;
  messages: Message[];
};

export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'name' | 'image'>;
};

export type SwipeAction = 'LIKE' | 'PASS';

export type FeedProfile = UserProfile & {
  compatibilityScore?: number;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profileComplete?: boolean;
    };
  }
}
