import prisma from '../../lib/db';

// Open /api/health on your live site to see what is missing. Never shows secret values.
export default async function handler(req, res) {
  const names = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GROQ_API_KEY', 'DATABASE_URL', 'DIRECT_URL'];
  const env = {};
  for (const n of names) env[n] = process.env[n] ? 'set' : 'MISSING';

  const url = process.env.NEXTAUTH_URL || '';
  const hints = [];
  if (!url) hints.push('NEXTAUTH_URL is missing: set it to https://YOUR-APP.vercel.app (no trailing slash).');
  else if (url.includes('localhost')) hints.push('NEXTAUTH_URL points to localhost. Change it to your Vercel URL.');
  if (url.endsWith('/')) hints.push('NEXTAUTH_URL must not end with a slash.');
  if (!(process.env.GROQ_API_KEY || '').startsWith('gsk_')) hints.push('GROQ_API_KEY missing or does not start with gsk_.');

  let database = 'ok';
  try {
    await prisma.roast.count();
  } catch (e) {
    database = 'FAILED: ' + String(e.message).split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 300);
    hints.push('Database failed. On Vercel use the Supabase Session pooler connection string (IPv4), with @ in the password written as %40.');
  }

  res.status(200).json({ env, database, hints });
}
