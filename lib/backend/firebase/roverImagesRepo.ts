import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface RoverImagesCacheRecord {
  missionId: string;
  roverName: string;
  images: string[]; // Array of image URLs (max 6)
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

const COLLECTION_NAME = 'rover_images';
const TTL_HOURS = 24; // 24-hour cache expiry

export const roverImagesRepo = {
  /**
   * Get cached rover images for a specific mission
   * Returns null if cache doesn't exist or is expired
   */
  async getByMission(
    missionId: string,
    roverName: string
  ): Promise<RoverImagesCacheRecord | null> {
    if (!firestore) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Cache Disabled] Firestore not available');
      }
      return null;
    }

    try {
      const docId = `${missionId}_${roverName}`;
      const doc = await firestore
        .collection(COLLECTION_NAME)
        .doc(docId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as RoverImagesCacheRecord;
      const now = Timestamp.now();

      // Check if cache is expired
      if (data.expiresAt.toMillis() < now.toMillis()) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Cache Expired] Mission ${missionId}, Rover ${roverName}`);
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache Hit] Mission ${missionId}, Rover ${roverName}`);
      }

      return data;
    } catch (error) {
      console.error(
        `Error fetching rover images cache for mission ${missionId}:`,
        error
      );
      return null;
    }
  },

  /**
   * Save or update rover images cache with TTL
   */
  async saveCache(
    missionId: string,
    roverName: string,
    imageUrls: string[]
  ): Promise<void> {
    if (!firestore) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Cache Disabled] Firestore not available - skipping cache save');
      }
      return;
    }

    try {
      const docId = `${missionId}_${roverName}`;
      const now = Timestamp.now();
      const expiresAt = new Timestamp(
        now.seconds + TTL_HOURS * 3600,
        now.nanoseconds
      );

      // Limit to max 6 images
      const limitedImages = imageUrls.slice(0, 6);

      const cacheRecord: RoverImagesCacheRecord = {
        missionId,
        roverName,
        images: limitedImages,
        cachedAt: now,
        expiresAt,
      };

      await firestore
        .collection(COLLECTION_NAME)
        .doc(docId)
        .set(cacheRecord, { merge: true });

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Cache Refresh] Mission ${missionId}, Rover ${roverName} - ${limitedImages.length} images cached until ${expiresAt.toDate().toISOString()}`
        );
      }
    } catch (error) {
      console.error(
        `Error saving rover images cache for mission ${missionId}:`,
        error
      );
    }
  },

  /**
   * Delete expired cache entries (optional cleanup utility)
   */
  async cleanupExpiredCache(): Promise<void> {
    if (!firestore) {
      return;
    }

    try {
      const now = Timestamp.now();
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('expiresAt', '<', now)
        .limit(100)
        .get();

      if (snapshot.empty) {
        return;
      }

      const batch = firestore.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.size} expired rover image cache entries`);
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
    }
  },
};
