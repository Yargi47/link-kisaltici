import fs from 'fs/promises';
import path from 'path';
import { cache } from './cache';

export interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  customerId: string; // Hangi müşteri oluşturdu
  createdAt: string;
  expiresAt?: string;
  customCode?: boolean;
  affiliateCode?: string; // Affiliate tracking için
  affiliateCommission?: number; // Komisyon oranı
}

export interface ClickData {
  timestamp: string;
  ip: string;
  userAgent: string;
  referer?: string;
  country?: string;
  city?: string;
}

export interface Database {
  links: Record<string, LinkData>;
  stats: Record<string, ClickData[]>;
}

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');
const DB_CACHE_KEY = 'database';
const CACHE_TTL = 30000; // 30 saniye

export async function readDatabase(): Promise<Database> {
  try {
    // Önce cache'den dene
    const cached = cache.get(DB_CACHE_KEY);
    if (cached && typeof cached === 'object' && 'links' in cached && 'stats' in cached) {
      return cached as Database;
    }

    // Cache'de yoksa dosyadan oku
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    // Cache'e kaydet
    cache.set(DB_CACHE_KEY, db, CACHE_TTL);
    return db as Database;
  } catch {
    const defaultDb: Database = { links: {}, stats: {} };
    cache.set(DB_CACHE_KEY, defaultDb, CACHE_TTL);
    return defaultDb;
  }
}

export async function writeDatabase(data: Database): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    
    // Cache'i güncelle
    cache.set(DB_CACHE_KEY, data, CACHE_TTL);
  } catch (error) {
    console.error('Database yazma hatası:', error);
    throw error;
  }
}

// Sadece link okuma için optimize edilmiş fonksiyon
export async function readLinkData(shortCode: string): Promise<LinkData | null> {
  try {
    const linkCacheKey = `link_${shortCode}`;
    // Önce cache'den dene
    const cached = cache.get(linkCacheKey);
    if (
      cached &&
      typeof cached === 'object' &&
      'id' in cached &&
      'originalUrl' in cached &&
      'shortCode' in cached &&
      'customerId' in cached &&
      'createdAt' in cached
    ) {
      return cached as LinkData;
    }

    // Cache'de yoksa tüm database'i oku
    const db = await readDatabase();
    const linkData = db.links[shortCode] || null;
    // Bulunan linki cache'e kaydet (daha uzun süre)
    if (linkData) {
      cache.set(linkCacheKey, linkData, 600000); // 10 dakika
    }
    return linkData;
  } catch (error) {
    console.error('Link okuma hatası:', error);
    return null;
  }
}

// Click kaydı için batch işlemi
let clickQueue: Array<{ shortCode: string; clickData: ClickData }> = [];
let flushTimeout: NodeJS.Timeout | null = null;

export async function queueClick(shortCode: string, clickData: ClickData): Promise<void> {
  // Click'i kuyruğa ekle
  clickQueue.push({ shortCode, clickData });
  
  // 5 saniye sonra veya 10 click biriktikten sonra flush et
  if (clickQueue.length >= 10) {
    await flushClicks();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushClicks, 5000);
  }
}

async function flushClicks(): Promise<void> {
  if (clickQueue.length === 0) return;
  
  try {
    const db = await readDatabase();
    
    // Kuyruktaki tüm click'leri işle
    for (const { shortCode, clickData } of clickQueue) {
      if (!db.stats[shortCode]) {
        db.stats[shortCode] = [];
      }
      db.stats[shortCode].push(clickData);
    }
    
    await writeDatabase(db);
    
    // Kuyruğu temizle
    clickQueue = [];
    
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }
  } catch (error) {
    console.error('Click flush hatası:', error);
  }
}

export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidShortCode(code: string): boolean {
  // Sadece alfanumerik karakterler, 3-20 karakter arası
  return /^[a-zA-Z0-9]{3,20}$/.test(code);
}
