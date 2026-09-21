import { open, DB } from '@op-engineering/op-sqlite';
import { PhotoItem } from '../types/PhotoItem';

let db: DB | null = null;

export const getDatabase = (): DB => {
  if (db) return db;

  db = open({
    name: 'benchmark.db',
  });

  // Enable WAL mode & performance PRAGMAs (instant JSI execution)
  try {
    db.executeSync('PRAGMA journal_mode = WAL;');
    db.executeSync('PRAGMA synchronous = NORMAL;');
  } catch (e) {
    console.warn('Failed to set PRAGMAs', e);
  }

  // Create table
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY,
      albumId INTEGER,
      title TEXT,
      url TEXT,
      thumbnailUrl TEXT
    )
  `);

  return db;
};

export const savePhotos = async (photos: PhotoItem[]): Promise<void> => {
  const database = getDatabase();
  const CHUNK_SIZE = 100;

  await database.transaction(async (tx) => {
    for (let i = 0; i < photos.length; i += CHUNK_SIZE) {
      const chunk = photos.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(',');
      const sql = `INSERT OR REPLACE INTO photos (id, albumId, title, url, thumbnailUrl) VALUES ${placeholders}`;
      const params: (string | number)[] = [];
      for (let j = 0; j < chunk.length; j++) {
        const photo = chunk[j];
        params.push(photo.id, photo.albumId, photo.title, photo.url, photo.thumbnailUrl);
      }
      await tx.execute(sql, params);
    }
  });
};

export const loadPhotos = async (): Promise<PhotoItem[]> => {
  const database = getDatabase();
  const result = await database.execute('SELECT * FROM photos');
  return (result.rows || []) as unknown as PhotoItem[];
};

export const searchPhotos = async (query: string): Promise<PhotoItem[]> => {
  const database = getDatabase();
  const result = await database.execute(
    'SELECT * FROM photos WHERE title LIKE ?',
    [`%${query}%`]
  );
  return (result.rows || []) as unknown as PhotoItem[];
};

export const clearPhotos = async (): Promise<void> => {
  const database = getDatabase();
  await database.execute('DELETE FROM photos');
};

export const getPhotoCount = async (): Promise<number> => {
  const database = getDatabase();
  const result = await database.execute('SELECT COUNT(*) as count FROM photos');
  return (result.rows?.[0]?.count as number) || 0;
};
