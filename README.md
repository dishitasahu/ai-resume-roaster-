# 🔥 AI Resume Roaster

Upload a PDF resume → get a score, a roast, and concrete fixes.

**Stack:** Next.js 14 (Pages Router) · NextAuth (Google) · pdf-parse · Groq (Llama 3.3 70B) · Prisma + Supabase Postgres · Tailwind CSS

## Setup

1. `npm install`
2. `cp .env.example .env.local` and fill in the values:
   - **GROQ_API_KEY**: https://console.groq.com/keys
   - **NEXTAUTH_SECRET**: run `openssl rand -base64 32`
   - **GOOGLE_CLIENT_ID / SECRET**: Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web).
     Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
   - **DATABASE_URL / DIRECT_URL**: Supabase → Project Settings → Database → Connection string
3. Prisma only reads `.env`, so also run: `cp .env.local .env` (or copy the two DB lines into `.env`)
4. `npx prisma db push` (creates the `Roast` table)
5. `npm run dev` → http://localhost:3000

## How it works

1. `pages/upload.js` posts the PDF to `/api/upload`, which extracts text with pdf-parse.
2. The text goes to `/api/roast`, which calls Groq (`lib/groq.js`), validates the JSON, and saves it with Prisma.
3. The user is redirected to `/feedback/[id]`, visible only to the account that created it.

## Deploy to Vercel

Add all env vars in the Vercel dashboard, set `NEXTAUTH_URL` to your production URL, and add
`https://YOUR-APP.vercel.app/api/auth/callback/google` to the Google OAuth redirect URIs.
