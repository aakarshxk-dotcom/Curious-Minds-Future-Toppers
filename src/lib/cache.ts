const cache = new Map<string, { data: any; expiry: number }>();

export function setCache(key: string, data: any, ttlMs = 30000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

export function getCache(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

export function clearCache(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}
