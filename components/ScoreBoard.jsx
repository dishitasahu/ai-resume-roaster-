import { getRank } from '../lib/rank';

export default function ScoreBoard({ score = 0 }) {
  const rank = getRank(score);
  const filled = Math.round(score / 5); // 20 segments

  return (
    <div className="panel w-full text-center">
      <p className="font-pixel text-[9px] text-slate-400">FINAL RANK</p>
      <p className={`mt-3 font-pixel text-6xl neon-text ${rank.text}`}>{rank.letter}</p>
      <p className={`mt-3 font-pixel text-[10px] ${rank.text}`}>{rank.title}</p>

      <div className="mx-auto mt-5 max-w-md">
        <div className="mb-1 flex justify-between font-pixel text-[9px]">
          <span className="text-slate-400">RESUME HP</span>
          <span className={rank.text}>{score}/100</span>
        </div>
        <div className="flex gap-[3px] border-2 border-slate-600 bg-black p-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`h-4 flex-1 ${i < filled ? rank.bar : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
