import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(here, 'data');
fs.mkdirSync(dataDirectory, { recursive: true });

export const db = new Database(path.join(dataDirectory, 'coy.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    photo TEXT NOT NULL,
    bio TEXT NOT NULL,
    location TEXT NOT NULL,
    interests TEXT NOT NULL,
    liked_demo INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (action IN ('LIKE', 'PASS')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, profile_id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    matched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, profile_id)
  );
`);

const stalePhotoId = 'photo-1524503033411-f6b2cf0d2f3c';
const stablePhotoId = 'photo-1534528741775-53994a69daeb';
db.prepare('UPDATE profiles SET photo = REPLACE(photo, ?, ?) WHERE photo LIKE ?')
  .run(stalePhotoId, stablePhotoId, `%${stalePhotoId}%`);

const profiles = [
  ['ananya', 'Ananya', 21, 'photo-1534528741775-53994a69daeb', 'Coffee lover, bookworm and always up for new adventures! ✨', 'Delhi University', ['Coffee', 'Books', 'Travel', 'Art'], 1],
  ['meera', 'Meera', 22, 'photo-1524504388940-b1c1722653e1', 'Collecting little moments, playlists, and places with good chai.', 'Mumbai', ['Music', 'Chai', 'Travel', 'Movies'], 1],
  ['sana', 'Sana', 23, 'photo-1529139574466-a303027c1d8b', 'Part-time foodie, full-time overthinker. Let’s find the best ramen?', 'Bengaluru', ['Food', 'Design', 'Hiking', 'Dogs'], 0],
  ['riya', 'Riya', 20, 'photo-1524250502761-1ac6f2e30d43', 'Sunsets, second-hand bookstores and saying yes to plans.', 'St. Xavier’s College', ['Books', 'Sunsets', 'Dancing', 'Coffee'], 1],
  ['isha', 'Isha', 24, 'photo-1517841905240-472988babdf9', 'Trying to make my sourdough starter as reliable as my playlists.', 'Pune', ['Baking', 'Music', 'Plants', 'Yoga'], 0],
  ['tara', 'Tara', 21, 'photo-1526510747491-58f928ec870f', 'Big fan of tiny cafes and very long walks.', 'Delhi', ['Cafes', 'Walking', 'Art', 'Podcasts'], 0],
  ['kavya', 'Kavya', 22, 'photo-1512316609839-ce289d3eba0a', 'Weekend trekker. Weekday dreamer. Always has snacks.', 'Mumbai University', ['Trekking', 'Food', 'Photography', 'Books'], 1],
  ['naina', 'Naina', 23, 'photo-1508214751196-bcfd4ca60f91', 'Here for deep conversations and absolutely unserious memes.', 'Hyderabad', ['Memes', 'Movies', 'Music', 'Cats'], 0],
  ['aisha', 'Aisha', 20, 'photo-1531123897727-8f129e1688ce', 'Making a playlist for every occasion, including this one.', 'Christ University', ['Music', 'Fashion', 'Coffee', 'Travel'], 0],
  ['diya', 'Diya', 22, 'photo-1524041255072-7da0525d6b34', 'I will ask to pet your dog. It’s a love language.', 'Jaipur', ['Dogs', 'Cooking', 'Books', 'Nature'], 0],
  ['zoya', 'Zoya', 24, 'photo-1534528741775-53994a69daeb', 'Art museums and street food: my two kinds of dates.', 'Mumbai', ['Art', 'Street food', 'Museums', 'Travel'], 1],
  ['aanya', 'Aanya', 21, 'photo-1534751516642-a1af1ef26a56', 'Currently learning guitar. Currently bad at guitar.', 'Delhi University', ['Guitar', 'Comedy', 'Tea', 'Films'], 0],
  ['myra', 'Myra', 23, 'photo-1534528741775-53994a69daeb', 'Ocean person living in a city. Let’s plan an escape?', 'Chennai', ['Beach', 'Swimming', 'Travel', 'Food'], 0],
  ['sanya', 'Sanya', 22, 'photo-1529139574466-a303027c1d8b', 'Designing things by day, searching for the best tacos by night.', 'Bengaluru', ['Design', 'Tacos', 'Books', 'Running'], 0],
  ['avni', 'Avni', 20, 'photo-1524504388940-b1c1722653e1', 'My plants are thriving. I’m taking full credit.', 'Ashoka University', ['Plants', 'Yoga', 'Coffee', 'Sustainability'], 1],
  ['pari', 'Pari', 21, 'photo-1524250502761-1ac6f2e30d43', 'Will beat you at board games and then make you dessert.', 'Pune', ['Board games', 'Dessert', 'Movies', 'Chess'], 0],
  ['noor', 'Noor', 24, 'photo-1517841905240-472988babdf9', 'I take my film camera everywhere. Yes, even here.', 'Kolkata', ['Photography', 'Films', 'Jazz', 'Books'], 0],
  ['lavanya', 'Lavanya', 23, 'photo-1512316609839-ce289d3eba0a', 'Looking for someone to split a plate of momos with.', 'Delhi', ['Momos', 'Comedy', 'Hiking', 'Coffee'], 0],
  ['simran', 'Simran', 22, 'photo-1508214751196-bcfd4ca60f91', 'Dance breaks between meetings are non-negotiable.', 'Mumbai', ['Dancing', 'Fitness', 'Music', 'Brunch'], 1],
  ['kiara', 'Kiara', 21, 'photo-1531123897727-8f129e1688ce', 'Tell me your most niche fun fact. I have several.', 'Bengaluru', ['Trivia', 'Podcasts', 'Travel', 'Cooking'], 0],
  ['priya', 'Priya', 23, 'photo-1524041255072-7da0525d6b34', 'Happiest with a book in one hand and chai in the other.', 'Delhi University', ['Books', 'Chai', 'Poetry', 'Museums'], 0],
  ['isha2', 'Ishita', 20, 'photo-1534751516642-a1af1ef26a56', 'New in town and looking for my favorite little corner.', 'Hyderabad', ['Exploring', 'Photography', 'Coffee', 'Art'], 0],
  ['mahi', 'Mahi', 24, 'photo-1534528741775-53994a69daeb', 'If the playlist is good, I’m staying for one more song.', 'Pune', ['Music', 'Live shows', 'Books', 'Travel'], 0],
  ['ruhi', 'Ruhi', 22, 'photo-1526510747491-58f928ec870f', 'Can recommend a comfort movie for any mood.', 'Mumbai University', ['Movies', 'Snacks', 'Cats', 'Crafts'], 1],
  ['tanya', 'Tanya', 21, 'photo-1534528741775-53994a69daeb', 'A little competitive at badminton, a lot competitive at Uno.', 'Chennai', ['Badminton', 'Games', 'Beach', 'Food'], 0],
  ['nidhi', 'Nidhi', 23, 'photo-1529139574466-a303027c1d8b', 'Collecting recipes I will definitely make someday.', 'Jaipur', ['Cooking', 'Travel', 'Plants', 'Brunch'], 0],
  ['farah', 'Farah', 22, 'photo-1517841905240-472988babdf9', 'I make a very good playlist and a questionable pasta.', 'Kolkata', ['Music', 'Pasta', 'Comedy', 'Art'], 0],
  ['shreya', 'Shreya', 24, 'photo-1524250502761-1ac6f2e30d43', 'Ask me about the tiny bookstore I found on my last trip.', 'Delhi', ['Books', 'Travel', 'Tea', 'Architecture'], 0],
  ['alia', 'Alia', 20, 'photo-1524504388940-b1c1722653e1', 'Currently accepting recs for a new comfort podcast.', 'Bengaluru', ['Podcasts', 'Dogs', 'Baking', 'Nature'], 1],
  ['prisha', 'Prisha', 22, 'photo-1508214751196-bcfd4ca60f91', 'Morning person, but only after my first cup of coffee.', 'St. Xavier’s College', ['Coffee', 'Running', 'Photography', 'Sushi'], 0],
  ['suhana', 'Suhana', 23, 'photo-1531123897727-8f129e1688ce', 'A spontaneous road trip is always a good idea.', 'Pune', ['Road trips', 'Music', 'Hiking', 'Food'], 0],
  ['tara2', 'Tara', 20, 'photo-1524041255072-7da0525d6b34', 'Somewhere between an introvert and the life of the party.', 'Hyderabad', ['Dancing', 'Art', 'Books', 'Coffee'], 0],
];

const insertProfile = db.prepare(`
  INSERT OR IGNORE INTO profiles (id, name, age, photo, bio, location, interests, liked_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const seed = db.transaction(() => {
  profiles.forEach(([id, name, age, photo, bio, location, interests, likedDemo]) => {
      insertProfile.run(id, name, age, `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=88`, bio, location, JSON.stringify(interests), likedDemo);
  });
});
seed();

export function publicProfile(row) {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    location: row.location,
    interests: JSON.parse(row.interests),
  };
}
