import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import prisma from '../../lib/db';
import ScoreBoard from '../../components/ScoreBoard';
import FeedbackCard from '../../components/FeedbackCard';

export async function getServerSideProps({ req, res, params }) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return { redirect: { destination: '/', permanent: false } };

  // Only the owner can view a roast
  const roast = await prisma.roast.findFirst({
    where: { id: params.id, userEmail: session.user.email },
  });
  if (!roast) return { notFound: true };

  return {
    props: {
      firstName: (session.user.name || 'Player').split(' ')[0],
      roast: { ...roast, createdAt: roast.createdAt.toISOString() },
    },
  };
}

export default function FeedbackPage({ roast, firstName }) {
  const cleared = roast.score >= 60;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1
          className={`font-pixel text-2xl leading-relaxed neon-text ${
            cleared ? 'text-lime-400' : 'text-red-500'
          }`}
        >
          {cleared ? 'STAGE CLEAR!' : 'GAME OVER'}
        </h1>
        <p className="mt-2 font-pixel text-[9px] text-slate-400">
          PLAYER: {firstName.toUpperCase()} · {roast.fileName} · {new Date(roast.createdAt).toLocaleDateString()}
        </p>
      </div>

      <ScoreBoard score={roast.score} />

      <p className="text-center text-2xl font-bold italic text-yellow-300">“{roast.verdict}”</p>

      <section className="panel border-fuchsia-500/60">
        <h3 className="mb-3 font-pixel text-[10px] text-fuchsia-400">👾 BOSS DIALOGUE</h3>
        <p className="whitespace-pre-line">{roast.roast}</p>
      </section>

      <FeedbackCard title="⚡ POWER-UPS" items={roast.strengths} tone="good" />
      <FeedbackCard title="💥 DAMAGE TAKEN" items={roast.weaknesses} tone="bad" />
      <FeedbackCard title="📜 QUEST LOG" items={roast.fixes} tone="fix" />

      <div className="pt-4 text-center">
        <Link href="/upload" className="btn-arcade">
          {cleared ? '▶ Next Level' : '▶ Continue? Try Again'}
        </Link>
      </div>
    </div>
  );
}
