// Turns a 0-100 score into a gamer rank.
export function getRank(score) {
  if (score >= 90) return { letter: 'S', title: 'LEGENDARY', text: 'text-yellow-300', bar: 'bg-yellow-300' };
  if (score >= 75) return { letter: 'A', title: 'ELITE', text: 'text-lime-400', bar: 'bg-lime-400' };
  if (score >= 60) return { letter: 'B', title: 'VETERAN', text: 'text-cyan-300', bar: 'bg-cyan-300' };
  if (score >= 45) return { letter: 'C', title: 'ROOKIE', text: 'text-orange-400', bar: 'bg-orange-400' };
  if (score >= 30) return { letter: 'D', title: 'NOOB', text: 'text-red-400', bar: 'bg-red-400' };
  return { letter: 'F', title: 'RESPAWN NEEDED', text: 'text-red-500', bar: 'bg-red-500' };
}
