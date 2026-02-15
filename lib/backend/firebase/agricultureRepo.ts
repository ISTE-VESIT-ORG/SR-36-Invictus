import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import type { AgricultureZone } from '../services/agricultureService';

export interface AgricultureCacheRecord extends Omit<AgricultureZone, 'last_updated'> {
  lastUpdated: Timestamp;
}

const COLLECTION_NAME = 'agriculture_zones';

export const agricultureRepo = {
  /**
   * Get all cached agriculture zones
   */
  async getAll(): Promise<AgricultureCacheRecord[]> {
    if (!firestore) {
      console.warn('[Agriculture Cache] Firestore not available');
      return [];
    }

    try {
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .orderBy('name')
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => doc.data() as AgricultureCacheRecord);
    } catch (error) {
      console.error('Error fetching agriculture cache:', error);
      return [];
    }
  },

  /**
   * Get single zone by ID
   */
  async getById(id: string): Promise<AgricultureCacheRecord | null> {
    if (!firestore) return null;

    try {
      const doc = await firestore
        .collection(COLLECTION_NAME)
        .doc(id)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as AgricultureCacheRecord;
    } catch (error) {
      console.error(`Error fetching agriculture zone ${id}:`, error);
      return null;
    }
  },

  /**
   * Save batch of agriculture zones
   */
  async saveBatch(zones: AgricultureCacheRecord[]): Promise<void> {
    if (!firestore) {
      console.warn('[Agriculture Cache] Firestore not available - skipping save');
      return;
    }

    try {
      const batch = firestore.batch();

      zones.forEach((zone) => {
        if (firestore) {
          const docRef = firestore.collection(COLLECTION_NAME).doc(zone.id);
          batch.set(docRef, zone, { merge: true });
        }
      });

      await batch.commit();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Agriculture Cache] Saved ${zones.length} zones to Firestore`);
      }
    } catch (error) {
      console.error('Error saving agriculture zones to cache:', error);
    }
  },

  /**
   * Update single zone
   */
  async updateZone(zone: AgricultureCacheRecord): Promise<void> {
    if (!firestore) return;

    try {
      await firestore
        .collection(COLLECTION_NAME)
        .doc(zone.id)
        .set(zone, { merge: true });
    } catch (error) {
      console.error(`Error updating agriculture zone ${zone.id}:`, error);
    }
  },

  /**
   * Delete old cache entries (maintenance utility)
   */
  async cleanupOldCache(daysOld: number = 7): Promise<number> {
    if (!firestore) return 0;

    try {
      const cutoffDate = Timestamp.fromMillis(
        Date.now() - daysOld * 24 * 60 * 60 * 1000
      );

      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('lastUpdated', '<', cutoffDate)
        .get();

      if (snapshot.empty) return 0;

      const batch = firestore.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Agriculture Cache] Cleaned up ${snapshot.size} old entries`);
      }

      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up agriculture cache:', error);
      return 0;
    }
  },
};
