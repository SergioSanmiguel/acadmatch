# AcadMatch 🎓

> A Tinder-style platform for academic research collaboration between university professors and researchers.

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Prisma** + **PostgreSQL**
- **NextAuth** (Google OAuth)
- **Framer Motion** (swipe animations)
- **Zod** (validation)

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── feed/               # GET feed with filters & recommendations
│   │   ├── swipe/              # POST swipe (creates match if mutual)
│   │   ├── matches/            # GET matches
│   │   ├── messages/           # GET & POST messages
│   │   ├── favorites/          # GET & POST favorites (toggle)
│   │   └── filters/            # GET available filter options
│   ├── auth/
│   │   ├── signin/             # Google sign-in page
│   │   └── error/              # Auth error page
│   ├── dashboard/              # Main dashboard
│   ├── feed/                   # Swipe feed
│   ├── matches/                # Active matches
│   ├── messages/
│   │   └── [matchId]/          # Chat room
│   ├── profile/
│   │   └── setup/              # New user profile setup wizard
│   ├── favorites/              # Saved profiles
│   ├── layout.tsx
│   ├── page.tsx                # Landing page
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Main navigation sidebar
│   │   ├── AppLayout.tsx       # Layout wrapper
│   │   └── Providers.tsx       # Session provider
│   ├── cards/
│   │   └── ProfileCard.tsx     # Researcher profile card
│   ├── feed/
│   │   ├── FeedClient.tsx      # Main feed logic
│   │   ├── FiltersPanel.tsx    # Advanced filters
│   │   └── MatchModal.tsx      # Match celebration modal
│   ├── messaging/
│   │   └── ChatClient.tsx      # Real-time chat UI
│   └── profile/
│       └── ProfileEditClient.tsx
├── lib/
│   ├── auth.ts                 # NextAuth config + academic email validation
│   ├── prisma.ts               # Prisma singleton
│   ├── recommendation.ts       # Compatibility scoring algorithm
│   ├── utils.ts                # Helpers, constants
│   └── validations.ts          # Zod schemas
├── types/
│   └── index.ts                # TypeScript types
├── middleware.ts               # Route protection + profile redirect
prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Sample data
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud like Supabase/Railway)
- Google Cloud project with OAuth2 credentials

### 2. Clone & Install

```bash
git clone <repo>
cd acadmatch
npm install
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/acadmatch"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000/api/auth/callback/google` to Authorized Redirect URIs
6. Copy Client ID and Secret to `.env.local`

### 5. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Features

### Academic Email Gate
Only emails with domains like `.edu`, `.ac.uk`, `.ac.in`, etc. are allowed. Configured in `src/lib/auth.ts`.

### Recommendation Algorithm
Located in `src/lib/recommendation.ts`. Scores compatibility based on:
- **Complementary fields** (e.g., CS + Biology = high score)
- **Shared collaboration interests**
- **Secondary field overlap**
- **Profile completeness bonus**

### Matching System
- User A swipes LIKE on User B → stored as Swipe
- User B swipes LIKE on User A → Match automatically created
- Match modal appears with option to start messaging

### Route Protection
`src/middleware.ts` protects all `/dashboard`, `/feed`, `/matches`, `/messages`, `/profile`, `/favorites` routes. Incomplete profiles are redirected to `/profile/setup`.

---

## Production Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set all environment variables in Vercel dashboard. Use a managed PostgreSQL (Supabase, Neon, Railway).

### Docker

```bash
docker build -t acadmatch .
docker run -p 3000:3000 --env-file .env.local acadmatch
```

---

## Contributing

PRs welcome! Please follow the existing code style and add proper TypeScript types.
