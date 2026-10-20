import formidable from 'formidable';
import fs from 'fs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { parsePDF } from '../../lib/pdfParser';

// formidable needs the raw request body
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Please sign in first' });

  let filePath;
  try {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024, maxFiles: 1 });
    const [, files] = await form.parse(req);
    const file = files.resume?.[0];

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    filePath = file.filepath;

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const text = await parsePDF(filePath);
    console.log('--- Extracted PDF text (first 500 chars) ---\n', text.slice(0, 500));

    if (text.length < 100) {
      return res.status(422).json({
        error: 'Could not read enough text. Is this a scanned/image-only PDF?',
      });
    }

    return res.status(200).json({ fileName: file.originalFilename, text });
  } catch (err) {
    console.error(err);
    const tooBig = err.code === 1009;
    return res.status(tooBig ? 413 : 500).json({
      error: tooBig ? 'File is larger than 5MB' : 'Failed to read the PDF',
    });
  } finally {
    if (filePath) fs.promises.unlink(filePath).catch(() => {});
  }
}
