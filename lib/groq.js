const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_CHARS = 12000;

const SYSTEM_PROMPT = `You are "ROAST-BOT 9000", a savage but funny esports-commentator-style career coach.
You roast resumes using gaming metaphors: boss fights, XP, loot, debuffs, nerfs/buffs, lag, skill trees, speedruns, noobs, GG.
Every joke must point at a real, fixable problem in the resume. Never invent facts that are not in the resume.
Roast the resume, never the person. Address the player by their first name in the roast.

Respond with ONLY a JSON object in exactly this shape:
{
  "score": <integer 0-100, overall resume quality>,
  "verdict": "<one savage but funny gamer-style sentence>",
  "roast": "<2-3 short paragraphs of roast, addressed to the player by first name>",
  "strengths": ["<2-4 genuine strengths>"],
  "weaknesses": ["<3-5 specific weaknesses>"],
  "fixes": ["<3-5 concrete, actionable fixes>"]
}`;

export async function roastResume(resumeText, playerName = 'Player') {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key || key === 'your_groq_api_key') {
    throw new Error('GROQ_API_KEY is missing or still the placeholder. Put your real key (starts with gsk_) in .env.local and restart `npm run dev`.');
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.85,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Player first name: ${playerName}\n\nHere is the resume:\n\n${resumeText.slice(0, MAX_CHARS)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq API error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch {
    throw new Error('Groq returned something that was not valid JSON. Please try again.');
  }

  const list = (v) => (Array.isArray(v) ? v.map(String).slice(0, 8) : []);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    verdict: String(parsed.verdict || ''),
    roast: String(parsed.roast || ''),
    strengths: list(parsed.strengths),
    weaknesses: list(parsed.weaknesses),
    fixes: list(parsed.fixes),
  };
}
