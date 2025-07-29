// Memory-based cache sistemi
interface CacheData {
  data: unknown;
  timestamp: number;
  ttl: number; // Time to live (ms)
}

class SimpleCache {
  private cache = new Map<string, CacheData>();
  
  set<T>(key: string, data: T, ttlMs: number = 300000) { // 5 dakika default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // TTL kontrolü
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Cache temizliği (eski verileri sil)
  cleanup() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new SimpleCache();

// Her 10 dakikada bir temizlik yap
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);
