const TONES = {
  good: { box: 'border-lime-400/50', title: 'text-lime-400', bullet: '▲' },
  bad: { box: 'border-red-500/50', title: 'text-red-400', bullet: '▼' },
  fix: { box: 'border-cyan-400/50', title: 'text-cyan-300', bullet: '►' },
};

export default function FeedbackCard({ title, items = [], tone = 'fix' }) {
  if (!items.length) return null;
  const t = TONES[tone];
  return (
    <section className={`panel ${t.box}`}>
      <h3 className={`mb-4 font-pixel text-[10px] leading-relaxed ${t.title}`}>{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className={`${t.title} text-sm`}>{t.bullet}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
