import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import prisma from '../lib/db';
import { getRank } from '../lib/rank';
import UploadDropzone from '../components/UploadDropzone';

export async function getServerSideProps({ req, res }) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return { redirect: { destination: '/', permanent: false } };

  const past = await prisma.roast.findMany({
    where: { userEmail: session.user.email },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, fileName: true, score: true, createdAt: true },
  });

  return {
    props: {
      firstName: (session.user.name || 'Player').split(' ')[0],
      past: past.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    },
  };
}

export default function UploadPage({ firstName, past }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('idle'); // idle | reading | roasting
  const busy = stage !== 'idle';

  async function readJson(res) {
    try {
      return await res.json();
    } catch {
      return { error: `Server error (${res.status}). Check the terminal running npm run dev.` };
    }
  }

  async function handleRoast() {
    if (!file) return setError('No cartridge inserted. Choose a PDF first.');
    setError('');

    try {
      setStage('reading');
      const body = new FormData();
      body.append('resume', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body });
      const uploaded = await readJson(uploadRes);
      if (!uploadRes.ok) throw new Error(uploaded.error || 'Upload failed');

      setStage('roasting');
      const roastRes = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: uploaded.text, fileName: uploaded.fileName }),
      });
      const roast = await readJson(roastRes);
      if (!roastRes.ok) throw new Error(roast.error || 'Roast failed');

      router.push(`/feedback/${roast.id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setStage('idle');
    }
  }

  return (
    <div>
      <p className="font-pixel text-[10px] text-lime-400 neon-text">PLAYER 1: {firstName.toUpperCase()}</p>
      <h1 className="mt-4 font-pixel text-xl leading-relaxed text-cyan-300 neon-text">SELECT YOUR RESUME</h1>
      <p className="mb-6 mt-2 text-slate-400">Only the roast gets saved, never your resume text.</p>

      <UploadDropzone file={file} onFile={setFile} onError={setError} disabled={busy} />

      {error && (
        <p className="mt-4 border-2 border-red-500/60 bg-red-500/10 p-3 font-semibold text-red-400">⚠ {error}</p>
      )}

      <button onClick={handleRoast} disabled={!file || busy} className="btn-arcade mt-6 w-full">
        {stage === 'reading' && 'Loading save data...'}
        {stage === 'roasting' && 'Boss is charging attack... 🔥'}
        {stage === 'idle' && '▶ Start Boss Fight'}
      </button>

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 font-pixel text-[10px] text-fuchsia-400">💾 SAVE FILES</h2>
          <div className="space-y-2">
            {past.map((r) => {
              const rank = getRank(r.score);
              return (
                <Link
                  key={r.id}
                  href={`/feedback/${r.id}`}
                  className="panel flex items-center justify-between !p-3 transition hover:border-fuchsia-400/70"
                >
                  <span className="truncate pr-3">
                    {r.fileName}
                    <span className="ml-2 text-sm text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                    </span>
                  </span>
                  <span className={`font-pixel text-[10px] ${rank.text}`}>
                    {rank.letter} · {r.score}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
