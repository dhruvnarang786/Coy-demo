# Coy

Coy is a mobile-first dating discovery demo with a React/Vite frontend, Tailwind CSS, Motion for React, Lucide icons, an Express REST API, and SQLite persistence. The demo has one fixed logged-in user and includes 32 seeded profiles; nine have already liked the demo user so mutual matches can be tested.

All 32 profile portraits are distinct, locally served 900 × 1200 JPEGs. The demo account has a separate local portrait as well. Image source and license details are recorded in `public/images/profiles/credits.json`.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). The API runs on `http://localhost:3001`.

To run the production build locally:

```powershell
npm run build
npm start
```

Open `http://localhost:3001`. SQLite data is stored in `server/data/coy.sqlite`; it is created and seeded on first start, and existing swipe and match data is retained on subsequent starts.

The API port can be changed with `PORT`. `COY_DATABASE_PATH` optionally selects a different SQLite file; without it, the database remains at `server/data/coy.sqlite`. For a separate local API proxy target, set `COY_API_TARGET` before starting Vite.

Run the backend integration tests with:

```powershell
npm test
```

## Demo

- Drag a profile card right to like or left to pass; desktop users can also use the circular action buttons.
- Swipe cards stack with spring transitions; the like/pass labels track the drag and return smoothly when released before the swipe threshold.
- Profiles Ananya, Meera, Riya, Kavya, Zoya, Avni, Simran, Ruhi, and Alia are seeded as prior admirers.
- A match appears only after liking a profile that previously liked the demo user.
- Refresh the page or restart the API to confirm swipe and match data persists.
- The Home tab is a simple landing screen. Discover and Matches are fully interactive.

### Clean recruiter demo

The default `server/data/coy.sqlite` remains persistent and is never reset by the demo command. To use a separate, reproducible database and replay the matching flow:

```powershell
npm run demo:reset
$env:COY_DATABASE_PATH = (Join-Path $PWD 'server\data\coy-demo.sqlite')
npm run dev
```

In Discover, like Ananya to show the match modal, continue and like Meera to show a second mutual match, then like Sana to show a normal like with no match. The Matches tab contains only Ananya and Meera.

To restore the clean demo state at any time, run `npm run demo:reset` and refresh the browser. It clears only the demo database’s swipes and matches; it preserves the seeded profiles and prior likes. Use a fresh terminal without `COY_DATABASE_PATH` to run against the normal persistent database.

The profile photos are bundled locally, so the app does not need an external image service at runtime.

## REST API

All endpoints use the single demo user (`demo-user`).

### `GET /feed`

Returns profiles the demo user has not swiped on. The internal prior-like flag is never included.

```json
{ "profiles": [{ "id": "ananya", "name": "Ananya", "age": 21, "photo": "...", "bio": "...", "location": "...", "interests": ["Coffee"] }] }
```

### `POST /swipe`

Request:

```json
{ "profileId": "ananya", "action": "LIKE" }
```

`action` must be `LIKE` or `PASS`. A successful first swipe returns `{ "matched": false }`, or `{ "matched": true, "match": { ... } }` for a mutual like. Invalid input returns `400`, unknown profiles `404`, and duplicate swipes `409`.

### `GET /matches`

Returns only persisted mutual matches:

```json
{ "matches": [{ "id": "ananya", "name": "Ananya", "age": 21, "photo": "...", "bio": "...", "location": "...", "interests": ["Coffee"] }] }
```
