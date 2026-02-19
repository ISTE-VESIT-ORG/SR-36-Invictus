import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface AgricultureImpactSummary {
  summary: {
    totalAreaAcres: number;
    avgVegetationHealth: number;
    avgSoilMoisture: number;
    yieldTrendPercent: number;
    activeZones: number;
  };
  lastUpdated: Timestamp;
  cacheAgeHours?: number; // Computed at read time
}

const COLLECTION_NAME = 'agriculture_metrics';
const DOCUMENT_ID = 'summary';
const CACHE_TTL_HOURS = 6;

export const impactAgricultureRepo = {
  /**
   * Get cached agriculture impact summary
   * Returns null if no cache or expired
   */
  async getCached(): Promise<AgricultureImpactSummary | null> {
    if (!firestore) {
      console.warn('[Impact Agriculture Repo] Firestore not available');
      return null;
    }

    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(DOCUMENT_ID);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as AgricultureImpactSummary;

      // Check if cache is still valid (within TTL)
      const now = Timestamp.now();
      const cacheAge = now.seconds - data.lastUpdated.seconds;
      const cacheAgeHours = cacheAge / 3600;

      if (cacheAgeHours > CACHE_TTL_HOURS) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Impact Agriculture Repo] Cache expired (${cacheAgeHours.toFixed(1)}h old)`);
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Impact Agriculture Repo] Using cached summary (${cacheAgeHours.toFixed(1)}h old)`);
      }

      // Include cache age in response for UI display
      return {
        ...data,
        cacheAgeHours,
      };
    } catch (error) {
      console.error('[Impact Agriculture Repo] Error reading cache:', error);
      return null;
    }
  },

  /**
   * Save agriculture impact summary to cache
   */
  async save(summary: AgricultureImpactSummary['summary']): Promise<void> {
    if (!firestore) {
      console.warn('[Impact Agriculture Repo] Firestore not available - skipping cache save');
      return;
    }

    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(DOCUMENT_ID);
      
      const data: AgricultureImpactSummary = {
        summary,
        lastUpdated: Timestamp.now(),
      };

      await docRef.set(data);

      if (process.env.NODE_ENV === 'development') {
        console.log('[Impact Agriculture Repo] Saved summary to cache');
      }
    } catch (error) {
      console.error('[Impact Agriculture Repo] Error saving to cache:', error);
    }
  },
};
