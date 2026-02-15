import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface DisasterEvent {
  id: string;
  title: string;
  disaster_type: string;
  description: string;
  coordinates: { lat: number; lng: number }[];
  magnitude_value: number | null;
  magnitude_unit: string | null;
  event_date: string; // ISO String
  source_url: string | null;
  lastUpdated: Timestamp;
}

const COLLECTION_NAME = 'disaster_events';

export const disasterRepo = {
  async getAll(): Promise<DisasterEvent[]> {
    if (!firestore) {
      console.warn('Firestore not available');
      return [];
    }
    
    try {
      const snapshot = await firestore.collection(COLLECTION_NAME)
        .orderBy('event_date', 'desc')
        .get();
      
      return snapshot.docs.map(doc => doc.data() as DisasterEvent);
    } catch (error) {
      console.error('Error fetching disasters from Firestore:', error);
      return [];
    }
  },

  async getById(id: string): Promise<DisasterEvent | null> {
    if (!firestore) {
      console.warn('Firestore not available');
      return null;
    }
    
    try {
      // EONET IDs can act as document IDs
      const doc = await firestore.collection(COLLECTION_NAME).doc(id).get();
      if (!doc.exists) return null;
      return doc.data() as DisasterEvent;
    } catch (error) {
      console.error(`Error fetching disaster ${id} from Firestore:`, error);
      return null;
    }
  },

  async saveBatch(events: DisasterEvent[]): Promise<void> {
    if (!firestore) {
      console.warn('Firestore not available - skipping save');
      return;
    }
    
    try {
      if (events.length === 0) return;

      const batch = firestore.batch();
      
      // Batch limit is 500, but let's assume valid chunks for now or slice
      const chunks = [];
      for (let i = 0; i < events.length; i += 400) {
          chunks.push(events.slice(i, i + 400));
      }

      for (const chunk of chunks) {
          const batch = firestore.batch();
          chunk.forEach(event => {
            const docRef = firestore!.collection(COLLECTION_NAME).doc(event.id);
            batch.set(docRef, event, { merge: true });
          });
          await batch.commit();
      }
      
      console.log(`Successfully saved ${events.length} disaster events to Firestore`);
    } catch (error) {
      console.error('Error saving disaster batch:', error);
    }
  }
};
