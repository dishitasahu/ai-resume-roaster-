import fs from 'fs';
// Import the inner file: the package's index.js tries to read a test PDF
// when bundled by Next.js and crashes.
import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function parsePDF(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  const data = await pdf(buffer);
  return data.text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
