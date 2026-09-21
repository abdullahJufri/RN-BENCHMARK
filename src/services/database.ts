import SQLite from 'react-native-sqlite-storage';
import { PhotoItem } from '../types/PhotoItem';

// Enable promises
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabase({
    name: 'benchmark.db',
    location: 'default',
  });

  // Enable WAL mode & performance PRAGMAs (same as Android Room)
  try {
    await db.executeSql('PRAGMA journal_mode = WAL;');
    await db.executeSql('PRAGMA synchronous = NORMAL;');
  } catch {
    // Ignore if PRAGMA is not supported by platform
  }

  // Create table
  await db.executeSql(`
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
  const database = await getDatabase();
  const CHUNK_SIZE = 100;

  return new Promise<void>((resolve, reject) => {
    database.transaction(
      (tx) => {
        for (let i = 0; i < photos.length; i += CHUNK_SIZE) {
          const chunk = photos.slice(i, i + CHUNK_SIZE);
          const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(',');
          const sql = `INSERT OR REPLACE INTO photos (id, albumId, title, url, thumbnailUrl) VALUES ${placeholders}`;
          const params: (string | number)[] = [];
          for (let j = 0; j < chunk.length; j++) {
            const photo = chunk[j];
            params.push(photo.id, photo.albumId, photo.title, photo.url, photo.thumbnailUrl);
          }
          tx.executeSql(sql, params);
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

export const loadPhotos = async (): Promise<PhotoItem[]> => {
  const database = await getDatabase();
  const [results] = await database.executeSql('SELECT * FROM photos');

  // Fast-path: results.rows.raw() returns the array directly without 1,000 JNI calls
  if (typeof (results.rows as any).raw === 'function') {
    return (results.rows as any).raw() as PhotoItem[];
  }

  const photos: PhotoItem[] = [];
  const len = results.rows.length;
  for (let i = 0; i < len; i++) {
    photos.push(results.rows.item(i) as PhotoItem);
  }
  return photos;
};

export const searchPhotos = async (query: string): Promise<PhotoItem[]> => {
  const database = await getDatabase();
  const [results] = await database.executeSql(
    'SELECT * FROM photos WHERE title LIKE ?',
    [`%${query}%`]
  );

  if (typeof (results.rows as any).raw === 'function') {
    return (results.rows as any).raw() as PhotoItem[];
  }

  const photos: PhotoItem[] = [];
  const len = results.rows.length;
  for (let i = 0; i < len; i++) {
    photos.push(results.rows.item(i) as PhotoItem);
  }
  return photos;
};

export const clearPhotos = async (): Promise<void> => {
  const database = await getDatabase();
  await database.executeSql('DELETE FROM photos');
};

export const getPhotoCount = async (): Promise<number> => {
  const database = await getDatabase();
  const [results] = await database.executeSql('SELECT COUNT(*) as count FROM photos');
  return results.rows.item(0).count;
};

