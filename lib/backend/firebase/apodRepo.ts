import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface ApodCacheRecord {
  date: string; // YYYY-MM-DD format
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

const COLLECTION_NAME = 'apod_cache';
const TTL_HOURS = 24; // 24-hour cache expiry

export const apodRepo = {
  /**
   * Get cached APOD for a specific date
   * Returns null if cache doesn't exist or is expired
   */
  async getByDate(date: string): Promise<ApodCacheRecord | null> {
    if (!firestore) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[APOD Cache Disabled] Firestore not available');
      }
      return null;
    }

    try {
      const doc = await firestore
        .collection(COLLECTION_NAME)
        .doc(date)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as ApodCacheRecord;
      const now = Timestamp.now();

      // Check if cache is expired
      if (data.expiresAt.toMillis() < now.toMillis()) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[APOD Cache Expired] Date ${date}`);
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[APOD Cache Hit] Date ${date}`);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching APOD cache for date ${date}:`, error);
      return null;
    }
  },

  /**
   * Save or update APOD cache with TTL
   */
  async saveCache(apodData: Omit<ApodCacheRecord, 'cachedAt' | 'expiresAt'>): Promise<void> {
    if (!firestore) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[APOD Cache Disabled] Firestore not available - skipping cache save');
      }
      return;
    }

    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + TTL_HOURS * 60 * 60 * 1000
      );

      const cacheRecord: ApodCacheRecord = {
        ...apodData,
        cachedAt: now,
        expiresAt,
      };

      await firestore
        .collection(COLLECTION_NAME)
        .doc(apodData.date)
        .set(cacheRecord, { merge: true });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[APOD Cache Saved] Date ${apodData.date}, expires in ${TTL_HOURS}h`);
      }
    } catch (error) {
      console.error(`Error saving APOD cache for date ${apodData.date}:`, error);
    }
  },

  /**
   * Cleanup expired APOD cache entries (maintenance utility)
   */
  async cleanupExpiredCache(): Promise<number> {
    if (!firestore) return 0;

    try {
      const now = Timestamp.now();
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('expiresAt', '<', now)
        .get();

      if (snapshot.empty) return 0;

      const batch = firestore.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[APOD Cache Cleanup] Deleted ${snapshot.size} expired entries`);
      }

      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up expired APOD cache:', error);
      return 0;
    }
  },
};
