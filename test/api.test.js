import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import Database from 'better-sqlite3';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function availablePort() {
  const listener = net.createServer();
  await new Promise((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolve);
  });
  const { port } = listener.address();
  await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function startServer(port, databasePath) {
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), COY_DATABASE_PATH: databasePath },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });

  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`API exited before startup: ${output}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/feed`);
      if (response.ok) return child;
    } catch {}
    await wait(50);
  }
  child.kill();
  throw new Error(`API did not start in time: ${output}`);
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  const exited = once(child, 'exit');
  child.kill();
  await Promise.race([exited, wait(3000)]);
}

async function request(base, route, options) {
  return fetch(`${base}${route}`, options);
}

test('API validates swipes, matches mutually, and persists state across restarts', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-api-test-'));
  const databasePath = path.join(directory, 'coy.sqlite');
  const port = await availablePort();
  const base = `http://127.0.0.1:${port}`;
  let server;
  t.after(async () => {
    await stopServer(server);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  server = await startServer(port, databasePath);
  const initialFeed = await (await request(base, '/feed')).json();
  assert.equal(initialFeed.profiles.length, 32);
  assert.equal(new Set(initialFeed.profiles.map((profile) => profile.id)).size, 32);
  assert.equal(new Set(initialFeed.profiles.map((profile) => profile.name)).size, 32);
  assert.equal(new Set(initialFeed.profiles.map((profile) => profile.photo)).size, 32);
  const photoHashes = initialFeed.profiles.map((profile) => {
    assert.equal(profile.photo, `/images/profiles/${profile.id}.jpg`);
    const photo = fs.readFileSync(path.join(root, 'public', profile.photo.slice(1)));
    assert.deepEqual([...photo.subarray(0, 2)], [0xff, 0xd8]);
    return createHash('sha256').update(photo).digest('hex');
  });
  assert.equal(new Set(photoHashes).size, 32);
  assert.ok(initialFeed.profiles.some((profile) => profile.id === 'ananya'));
  assert.ok(initialFeed.profiles.every((profile) =>
    profile.id && profile.name && Number.isInteger(profile.age) && profile.age >= 18
    && profile.bio && profile.location
    && Array.isArray(profile.interests) && profile.interests.length > 0));
  assert.ok(!JSON.stringify(initialFeed).includes('liked_demo'));
  assert.ok(!JSON.stringify(initialFeed).includes('likedDemo'));

  const matchesInitially = await (await request(base, '/matches')).json();
  assert.deepEqual(matchesInitially.matches, []);

  const postSwipe = (body) => request(base, '/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const nonMutual = await postSwipe({ profileId: 'sana', action: 'LIKE' });
  assert.equal(nonMutual.status, 200);
  assert.deepEqual(await nonMutual.json(), { matched: false });

  const passed = await postSwipe({ profileId: 'tara', action: 'PASS' });
  assert.equal(passed.status, 200);
  assert.deepEqual(await passed.json(), { matched: false });

  const mutual = await postSwipe({ profileId: 'ananya', action: 'LIKE' });
  assert.equal(mutual.status, 200);
  const matchResult = await mutual.json();
  assert.equal(matchResult.matched, true);
  assert.equal(matchResult.match.id, 'ananya');
  assert.ok(!Object.hasOwn(matchResult.match, 'liked_demo'));

  assert.equal((await postSwipe({ profileId: 'sana', action: 'LIKE' })).status, 409);
  assert.equal((await postSwipe({ action: 'LIKE' })).status, 400);
  assert.equal((await postSwipe({ profileId: 'sana', action: 'MAYBE' })).status, 400);
  assert.equal((await postSwipe({ profileId: 'not-a-profile', action: 'LIKE' })).status, 404);
  assert.equal((await request(base, '/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid',
  })).status, 400);

  const afterSwipes = await (await request(base, '/feed')).json();
  assert.equal(afterSwipes.profiles.length, 29);
  assert.ok(!afterSwipes.profiles.some((profile) => ['sana', 'tara', 'ananya'].includes(profile.id)));
  const mutualOnly = await (await request(base, '/matches')).json();
  assert.deepEqual(mutualOnly.matches.map((profile) => profile.id), ['ananya']);

  let database = new Database(databasePath, { readonly: true });
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM profiles').get().n, 32);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM swipes').get().n, 3);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM matches').get().n, 1);
  assert.ok(database.prepare('PRAGMA index_list(swipes)').all().some((index) => index.unique));
  assert.ok(database.prepare('PRAGMA index_list(matches)').all().some((index) => index.unique));
  database.close();

  database = new Database(databasePath);
  assert.throws(
    () => database.prepare('INSERT INTO swipes (user_id, profile_id, action) VALUES (?, ?, ?)').run('demo-user', 'sana', 'PASS'),
    /UNIQUE constraint failed/,
  );
  assert.throws(
    () => database.prepare('INSERT INTO matches (user_id, profile_id) VALUES (?, ?)').run('demo-user', 'ananya'),
    /UNIQUE constraint failed/,
  );
  database.close();

  await stopServer(server);
  server = await startServer(port, databasePath);
  const afterRestart = await (await request(base, '/feed')).json();
  assert.ok(!afterRestart.profiles.some((profile) => ['sana', 'tara', 'ananya'].includes(profile.id)));
  assert.deepEqual((await (await request(base, '/matches')).json()).matches.map((profile) => profile.id), ['ananya']);

  for (const profile of afterRestart.profiles) {
    const response = await postSwipe({ profileId: profile.id, action: 'PASS' });
    assert.equal(response.status, 200);
  }
  assert.deepEqual((await (await request(base, '/feed')).json()).profiles, []);
  assert.deepEqual((await (await request(base, '/matches')).json()).matches.map((profile) => profile.id), ['ananya']);

  await stopServer(server);
  server = await startServer(port, databasePath);
  assert.deepEqual((await (await request(base, '/feed')).json()).profiles, []);
  assert.deepEqual((await (await request(base, '/matches')).json()).matches.map((profile) => profile.id), ['ananya']);
});
