import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

const FEATURES = [
  { icon: '⚔️', title: 'SCORE', text: 'Get ranked from F to S tier.' },
  { icon: '🔥', title: 'ROAST', text: 'Savage AI commentary on every flaw.' },
  { icon: '🏆', title: 'LEVEL UP', text: 'A quest log of fixes to win.' },
];

export default function Home() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0];

  return (
    <div className="py-10 text-center">
      <p className="font-pixel text-[10px] text-lime-400 neon-text">
        {firstName ? `WELCOME BACK, ${firstName.toUpperCase()}` : '1 PLAYER'}
      </p>
      <h1 className="mt-6 font-pixel text-3xl leading-snug sm:text-4xl">
        <span className="text-cyan-300 neon-text">RESUME</span>
        <br />
        <span className="text-fuchsia-400 neon-text">ROASTER</span>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-xl text-slate-300">
        Your resume is the final boss. Upload it, face the roast, and level up.
      </p>

      <div className="mt-10">
        {session ? (
          <Link href="/upload" className="btn-arcade">
            ▶ Start Boss Fight
          </Link>
        ) : (
          <button onClick={() => signIn('google', { callbackUrl: '/upload' })} className="btn-arcade">
            ▶ Login with Google
          </button>
        )}
        <p className="mt-5 animate-blink font-pixel text-[9px] text-yellow-300">PRESS START</p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="panel">
            <p className="text-3xl">{f.icon}</p>
            <p className="mt-3 font-pixel text-[10px] text-cyan-300">{f.title}</p>
            <p className="mt-2 text-slate-300">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
