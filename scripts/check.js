// Run with: npm run check
// Tests your Groq key and database connection and tells you exactly what's wrong.
const fs = require('fs');
const path = require('path');

for (const f of ['.env', '.env.local']) {
  const p = path.join(__dirname, '..', f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const ok = (m) => console.log('  ✅ ' + m);
const bad = (m) => { console.log('  ❌ ' + m); failed = true; };
let failed = false;

(async () => {
  console.log('\n1) Environment variables');
  const key = process.env.GROQ_API_KEY || '';
  if (!key.startsWith('gsk_')) bad('GROQ_API_KEY must start with gsk_ (yours starts with "' + key.slice(0, 4) + '")');
  else ok('GROQ_API_KEY looks right');
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === 'your_random_secret') bad('NEXTAUTH_SECRET is missing or placeholder');
  else ok('NEXTAUTH_SECRET set');
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) bad('Google OAuth keys missing');
  else ok('Google OAuth keys set');

  console.log('\n2) Groq API');
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: 'Bearer ' + key } });
    if (r.ok) ok('Groq accepted your key');
    else bad('Groq said ' + r.status + ': ' + (await r.text()).slice(0, 200) + '  -> create a new key at console.groq.com/keys');
  } catch (e) { bad('Could not reach Groq (internet/VPN/firewall?): ' + e.message); }

  console.log('\n3) Database');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const n = await prisma.roast.count();
    ok('Database connected, Roast table exists (' + n + ' saved roasts)');
    await prisma.$disconnect();
  } catch (e) {
    bad('Database problem: ' + String(e.message).split('\n').filter(Boolean).slice(-3).join(' '));
    console.log('     Fixes: 1) run `npx prisma db push`  2) if it says "Can\'t reach database server", use the Supabase');
    console.log('     "Session pooler" connection string (IPv4) from Supabase > Connect, in DATABASE_URL and DIRECT_URL.');
  }

  console.log(failed ? '\nFix the ❌ items above, then run npm run check again.\n' : '\nAll good. Run npm run dev and test the upload.\n');
})();
