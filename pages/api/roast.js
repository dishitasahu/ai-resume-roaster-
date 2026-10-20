import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { roastResume } from '../../lib/groq';
import prisma from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Please sign in first' });

  const { text, fileName } = req.body || {};
  if (typeof text !== 'string' || text.length < 100) {
    return res.status(400).json({ error: 'Resume text is missing or too short' });
  }

  try {
    const firstName = (session.user.name || 'Player').split(' ')[0];
    const result = await roastResume(text, firstName);
    const saved = await prisma.roast.create({
      data: {
        userEmail: session.user.email,
        fileName: String(fileName || 'resume.pdf').slice(0, 200),
        ...result,
      },
    });
    return res.status(200).json({ id: saved.id });
  } catch (err) {
    console.error('ROAST ERROR:', err);
    const msg = String(err.message || '');
    let error = 'The roast failed. Please try again.';
    if (/GROQ_API_KEY|Groq API error 401/.test(msg)) error = 'Server setup problem: the Groq API key is missing or invalid. Check GROQ_API_KEY in .env.local.';
    else if (/Groq API error 429/.test(msg)) error = 'Groq rate limit hit. Wait a minute and try again.';
    else if (/Groq API error/.test(msg)) error = 'Groq rejected the request. See the server terminal for details.';
    else if (err.code && /^P\d+/.test(err.code)) error = 'Database error: could not save the roast. Check DATABASE_URL and run `npx prisma db push`.';
    return res.status(500).json({ error });
  }
}
