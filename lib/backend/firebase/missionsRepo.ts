import { firestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface Mission {
  id: string;
  mission_name: string;
  agency_name: string;
  launch_date: string; // ISO string
  mission_type: string;
  orbit_type: string;
  mission_status: string;
  description: string;
  rocket_name: string;
  launch_site: string;
  image_url: string | null;
  rover_image_url?: string | null;
  lastUpdated: Timestamp;
}

const COLLECTION_NAME = 'space_missions';

export const missionsRepo = {
  async getAll(): Promise<Mission[]> {
    if (!firestore) {
      console.warn('Firestore not available');
      return [];
    }
    
    try {
      const snapshot = await firestore.collection(COLLECTION_NAME)
        .orderBy('launch_date', 'asc')
        .get();
      
      return snapshot.docs.map(doc => doc.data() as Mission);
    } catch (error) {
      console.error('Error fetching missions from Firestore:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Mission | null> {
    if (!firestore) {
      console.warn('Firestore not available');
      return null;
    }
    
    try {
      const doc = await firestore.collection(COLLECTION_NAME).doc(id).get();
      if (!doc.exists) return null;
      return doc.data() as Mission;
    } catch (error) {
      console.error(`Error fetching mission ${id} from Firestore:`, error);
      return null;
    }
  },

  async saveBatch(missions: Mission[]): Promise<void> {
    if (!firestore) {
      console.warn('Firestore not available - skipping save');
      return;
    }
    
    try {
      const batch = firestore.batch();
      
      missions.forEach(mission => {
        const docRef = firestore!.collection(COLLECTION_NAME).doc(mission.id);
        batch.set(docRef, mission, { merge: true });
      });

      await batch.commit();
      console.log(`Successfully saved ${missions.length} missions to Firestore`);
    } catch (error) {
      console.error('Error saving batch to Firestore:', error);
    }
  }
};
