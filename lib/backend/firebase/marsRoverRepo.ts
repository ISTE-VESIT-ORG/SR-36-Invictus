import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import type { MarsRoverImage, RoverName } from '@/lib/backend/space-data/marsRoverService';

export interface MarsRoverImageRecord extends MarsRoverImage {
  lastUpdated: Timestamp;
}

const COLLECTION_NAME = 'mars_rover_images';

export const marsRoverRepo = {
  async getByRover(rover: RoverName): Promise<MarsRoverImageRecord[]> {
    if (!firestore) {
      console.warn('Firestore not available');
      return [];
    }
    
    try {
      const snapshot = await firestore
        .collection(COLLECTION_NAME)
        .where('rover', '==', rover)
        .orderBy('earth_date', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as MarsRoverImageRecord);
    } catch (error) {
      console.error(`Error fetching rover images for ${rover} from Firestore:`, error);
      return [];
    }
  },

  async saveBatch(images: MarsRoverImageRecord[]): Promise<void> {
    if (!firestore) {
      console.warn('Firestore not available - skipping save');
      return;
    }
    
    try {
      if (images.length === 0) return;

      const chunks = [] as MarsRoverImageRecord[][];
      for (let i = 0; i < images.length; i += 400) {
        chunks.push(images.slice(i, i + 400));
      }

      for (const chunk of chunks) {
        const batch = firestore.batch();
        chunk.forEach(image => {
          const docId = `${image.rover}_${image.id}`;
          const docRef = firestore!.collection(COLLECTION_NAME).doc(docId);
          batch.set(docRef, image, { merge: true });
        });
        await batch.commit();
      }

      console.log(`Successfully saved ${images.length} rover images to Firestore`);
    } catch (error) {
      console.error('Error saving rover images batch:', error);
    }
  }
};
