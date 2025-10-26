import 'server-only'; // ✅ client-с санамсаргүй импортлохоос хамгаална
import { promises as fs } from 'fs';
import path from 'path';

export type MediaInsert = { url: string; type: string; size: number; name: string };
type Bucket = 'photos' | 'videos';

type MediaRow = {
  id: number;
  bucket: Bucket;
  url: string;
  type: string;
  size: number;
  name: string;
  createdAt: string; // ISO
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    const initial = { photos: [] as MediaRow[], videos: [] as MediaRow[], _seq: 1 };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

async function readStore(): Promise<{ photos: MediaRow[]; videos: MediaRow[]; _seq: number }> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeStore(store: { photos: MediaRow[]; videos: MediaRow[]; _seq: number }) {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export async function addMedia(bucket: Bucket, data: MediaInsert): Promise<MediaRow> {
  const store = await readStore();
  const id = store._seq++;
  const row: MediaRow = { id, bucket, ...data, createdAt: new Date().toISOString() };
  store[bucket].push(row);
  await writeStore(store);
  return row;
}

export async function getAllMedia(bucket: Bucket): Promise<MediaRow[]> {
  const store = await readStore();
  return [...store[bucket]].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function deleteMedia(bucket: Bucket, id: number): Promise<void> {
  const store = await readStore();
  const idx = store[bucket].findIndex((r) => r.id === id);
  if (idx >= 0) {
    store[bucket].splice(idx, 1);
    await writeStore(store);
  }
}
