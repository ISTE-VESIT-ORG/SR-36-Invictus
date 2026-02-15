import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import type { ClimateMetric } from '../services/climateService';

export interface ClimateMetricRecord extends Omit<ClimateMetric, 'lastUpdated'> {
  lastUpdated: Timestamp;
}

const COLLECTION_NAME = 'climate_metrics';

export const climateRepo = {
  /**
   * Get all climate metrics
   */
  async getAll(): Promise<ClimateMetricRecord[]> {
    if (!firestore) {
      console.warn('[Climate Cache] Firestore not available');
      return [];
    }

    try {
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .orderBy('year', 'desc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => doc.data() as ClimateMetricRecord);
    } catch (error) {
      console.error('Error fetching climate metrics cache:', error);
      return [];
    }
  },

  /**
   * Get climate metrics for current year
   */
  async getCurrentYear(): Promise<ClimateMetricRecord[]> {
    if (!firestore) return [];

    try {
      const currentYear = new Date().getFullYear();
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('year', '==', currentYear)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => doc.data() as ClimateMetricRecord);
    } catch (error) {
      console.error('Error fetching current year climate metrics:', error);
      return [];
    }
  },

  /**
   * Get metric by ID
   */
  async getById(id: string): Promise<ClimateMetricRecord | null> {
    if (!firestore) return null;

    try {
      const doc = await firestore.collection(COLLECTION_NAME).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as ClimateMetricRecord;
    } catch (error) {
      console.error(`Error fetching climate metric ${id}:`, error);
      return null;
    }
  },

  /**
   * Save batch of climate metrics
   */
  async saveBatch(metrics: ClimateMetricRecord[]): Promise<void> {
    if (!firestore) {
      console.warn('[Climate Cache] Firestore not available - skipping save');
      return;
    }

    try {
      const batch = firestore.batch();

      metrics.forEach((metric) => {
        if (firestore) {
          const docRef = firestore.collection(COLLECTION_NAME).doc(metric.id);
          batch.set(docRef, metric, { merge: true });
        }
      });

      await batch.commit();

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Climate Cache] Saved ${metrics.length} metrics to Firestore`
        );
      }
    } catch (error) {
      console.error('Error saving climate metrics to cache:', error);
    }
  },

  /**
   * Get historical data (last N years)
   */
  async getHistorical(years: number = 5): Promise<ClimateMetricRecord[]> {
    if (!firestore) return [];

    try {
      const cutoffYear = new Date().getFullYear() - years;
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('year', '>=', cutoffYear)
        .where('region', '==', 'Global Average')
        .orderBy('year', 'asc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => doc.data() as ClimateMetricRecord);
    } catch (error) {
      console.error('Error fetching historical climate data:', error);
      return [];
    }
  },

  /**
   * Cleanup old cache entries (maintenance utility)
   */
  async cleanupOldCache(yearsToKeep: number = 10): Promise<number> {
    if (!firestore) return 0;

    try {
      const cutoffYear = new Date().getFullYear() - yearsToKeep;

      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('year', '<', cutoffYear)
        .get();

      if (snapshot.empty) return 0;

      const batch = firestore.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Climate Cache] Cleaned up ${snapshot.size} old entries`
        );
      }

      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up climate cache:', error);
      return 0;
    }
  },
};
