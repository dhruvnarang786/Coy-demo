import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, publicProfile } from './db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const DEMO_USER_ID = 'demo-user';
const here = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: '10kb' }));

app.get('/feed', (_req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.age, p.photo, p.bio, p.location, p.interests
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM swipes s WHERE s.user_id = ? AND s.profile_id = p.id
    )
    ORDER BY p.rowid
  `).all(DEMO_USER_ID);
  res.json({ profiles: rows.map(publicProfile) });
});

app.post('/swipe', (req, res, next) => {
  const { profileId, action } = req.body ?? {};
  if (typeof profileId !== 'string' || !profileId.trim() || !['LIKE', 'PASS'].includes(action)) {
    return res.status(400).json({ error: 'Provide a profileId and an action of LIKE or PASS.' });
  }
  const targetId = profileId.trim();

  try {
    const result = db.transaction(() => {
      const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(targetId);
      if (!profile) return { status: 404, body: { error: 'Profile not found.' } };

      const insert = db.prepare('INSERT INTO swipes (user_id, profile_id, action) VALUES (?, ?, ?)')
        .run(DEMO_USER_ID, targetId, action);
      if (action !== 'LIKE' || !profile.liked_demo) {
        return { status: 200, body: { matched: false } };
      }

      db.prepare('INSERT INTO matches (user_id, profile_id) VALUES (?, ?)').run(DEMO_USER_ID, targetId);
      return { status: 200, body: { matched: true, match: publicProfile(profile) } };
    })();
    return res.status(result.status).json(result.body);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'You have already swiped on this profile.' });
    }
    return next(error);
  }
});

app.get('/matches', (_req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.age, p.photo, p.bio, p.location, p.interests
    FROM matches m
    JOIN profiles p ON p.id = m.profile_id
    WHERE m.user_id = ?
    ORDER BY m.matched_at DESC, m.id DESC
  `).all(DEMO_USER_ID);
  res.json({ matches: rows.map(publicProfile) });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  res.status(500).json({ error: 'The server could not complete your request.' });
});

const dist = path.resolve(here, '..', 'dist');
app.use(express.static(dist));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (error) => {
    if (error) res.status(404).send('Frontend is not built. Run npm run build first.');
  });
});

app.listen(PORT, () => console.log(`Coy API listening on http://localhost:${PORT}`));
