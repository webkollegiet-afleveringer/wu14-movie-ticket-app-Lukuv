// cache.js - Utility til caching af API data
const CACHE_DURATION = 60 * 60 * 1000; // 1 time i millisekunder

export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Tjek om data er for gammel
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

export const setCachedData = (key, data) => {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

export const clearCache = () => {
  try {
    // Ryd kun TMDB-relaterede cache keys
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('tmdb_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};