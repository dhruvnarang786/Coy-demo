import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(here, 'data', 'coy-demo.sqlite');
process.env.COY_DATABASE_PATH = databasePath;

const { db } = await import('./db.js');
db.transaction(() => {
  db.prepare('DELETE FROM matches').run();
  db.prepare('DELETE FROM swipes').run();
})();
db.close();

console.log(`Clean demo database ready: ${databasePath}`);
