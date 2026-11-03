import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3005);
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

const app = express();

app.get('/healthcheck', (_request, response) => response.json({ status: 'ok' }));

app.use(express.static(DIST_DIR, { index: false, maxAge: '1y', immutable: true }));

app.use((_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.sendFile(INDEX_FILE);
});

app.listen(PORT, () => {
  console.log(`recruitment-portal serving ${DIST_DIR} on port ${PORT}`);
});
