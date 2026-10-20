const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS_URL = 'https://api.groq.com/openai/v1/models';

// Groq retires models from time to time, so instead of hard-coding one we ask
// Groq which models this API key can use and pick the best available.
// To force a specific model, set GROQ_MODEL in .env.local.
const PREFERRED = [
  'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-20b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-8b-instant',
  'qwen/qwen3-32b',
];
const NOT_CHAT = /whisper|tts|guard|embed|orpheus|playai|distil-whisper|safeguard/i;
let cachedModel = null;

async function pickModel(key, forceRefresh = false) {
  if (process.env.GROQ_MODEL && !forceRefresh) return process.env.GROQ_MODEL.trim();
  if (cachedModel && !forceRefresh) return cachedModel;

  const res = await fetch(MODELS_URL, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
  const ids = ((await res.json()).data || []).map((m) => m.id).filter((id) => !NOT_CHAT.test(id));
  if (!ids.length) throw new Error('Groq API error: no chat models available for this API key.');

  cachedModel = PREFERRED.find((id) => ids.includes(id)) || ids[0];
  console.log('Using Groq model:', cachedModel);
  return cachedModel;
}

// Some models wrap JSON in extra text or <think> tags; grab the JSON object.
function extractJson(text) {
  const cleaned = String(text || '').replace(/<think>[\s\S]*?<\/think>/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON found');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGroq(key, model, resumeText, playerName) {
  return fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
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
}
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

  let model = await pickModel(key);
  let res = await callGroq(key, model, resumeText, playerName);

  // Model got retired / not accessible: re-discover once and retry.
  if (res.status === 404 || res.status === 400) {
    const body = await res.text();
    if (/model/i.test(body)) {
      cachedModel = null;
      model = await pickModel(key, true);
      res = await callGroq(key, model, resumeText, playerName);
    } else {
      throw new Error(`Groq API error ${res.status}: ${body}`);
    }
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq API error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  let parsed;
  try {
    parsed = extractJson(data.choices[0].message.content);
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
