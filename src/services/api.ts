import { PhotoItem } from '../types/PhotoItem';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const fetchPhotos = async (limit: number = 1000): Promise<PhotoItem[]> => {
  const response = await fetch(`${BASE_URL}/photos?_limit=${limit}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: PhotoItem[] = await response.json();

  // In-place mutation to eliminate 1,000 object allocations & GC overhead
  const len = data.length;
  for (let i = 0; i < len; i++) {
    const item = data[i];
    if (item.thumbnailUrl && item.thumbnailUrl.includes('via.placeholder.com')) {
      item.thumbnailUrl = item.thumbnailUrl.replace('via.placeholder.com', 'dummyimage.com');
    }
    if (item.url && item.url.includes('via.placeholder.com')) {
      item.url = item.url.replace('via.placeholder.com', 'dummyimage.com');
    }
  }

  return data;
};

