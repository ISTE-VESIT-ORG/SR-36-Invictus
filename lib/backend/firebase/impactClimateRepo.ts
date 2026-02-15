import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface ClimateImpactSummary {
  summary: {
    avgTemperatureAnomaly: number;
    avgCO2: number;
    avgSeaLevelRise: number;
    avgIceLoss: number;
    totalRegions: number;
  };
  lastUpdated: Timestamp;
  cacheAgeHours?: number; // Computed hours since last update
}

const COLLECTION_NAME = 'climate_metrics';
const DOCUMENT_ID = 'summary';
const CACHE_TTL_HOURS = 6;

export const impactClimateRepo = {
  /**
   * Get cached climate impact summary
   * Returns null if no cache or expired
   */
  async getCached(): Promise<ClimateImpactSummary | null> {
    if (!firestore) {
      console.warn('[Impact Climate Repo] Firestore not available');
      return null;
    }

    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(DOCUMENT_ID);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as ClimateImpactSummary;

      // Check if cache is still valid (within TTL)
      const now = Timestamp.now();
      const cacheAge = now.seconds - data.lastUpdated.seconds;
      const cacheAgeHours = cacheAge / 3600;

      if (cacheAgeHours > CACHE_TTL_HOURS) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Impact Climate Repo] Cache expired (${cacheAgeHours.toFixed(1)}h old)`);
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Impact Climate Repo] Using cached summary (${cacheAgeHours.toFixed(1)}h old)`);
      }

      return {
        ...data,
        cacheAgeHours,
      };
    } catch (error) {
      console.error('[Impact Climate Repo] Error reading cache:', error);
      return null;
    }
  },

  /**
   * Save climate impact summary to cache
   */
  async save(summary: ClimateImpactSummary['summary']): Promise<void> {
    if (!firestore) {
      console.warn('[Impact Climate Repo] Firestore not available - skipping cache save');
      return;
    }

    try {
      const docRef = firestore.collection(COLLECTION_NAME).doc(DOCUMENT_ID);
      
      const data: ClimateImpactSummary = {
        summary,
        lastUpdated: Timestamp.now(),
      };

      await docRef.set(data);

      if (process.env.NODE_ENV === 'development') {
        console.log('[Impact Climate Repo] Saved summary to cache');
      }
    } catch (error) {
      console.error('[Impact Climate Repo] Error saving to cache:', error);
    }
  },
};
