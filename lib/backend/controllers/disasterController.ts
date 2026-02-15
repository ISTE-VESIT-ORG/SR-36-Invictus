import { Timestamp } from 'firebase-admin/firestore';
import { eonetService } from '@/lib/backend/services/eonetService';
import { disasterRepo } from '@/lib/backend/firebase/disasterRepo';

export const disasterController = {

  // Fetch active disasters with fallback strategy
  async getActiveDisasters() {
    try {
      // 1. Try fetching fresh data from NASA EONET API
      const apiEvents = await eonetService.fetchActiveDisasters();
      
      if (apiEvents && apiEvents.length > 0) {
        // 2. Normalize data
        const normalizedEvents = apiEvents
          .map(event => eonetService.normalizeDisasterEvent(event))
          .filter(e =>
            Array.isArray(e.coordinates) &&
            e.coordinates.length > 0 &&
            Number.isFinite(e.coordinates[0]?.lat) &&
            Number.isFinite(e.coordinates[0]?.lng)
          );

        // 3. Add Firestore Timestamp and save to Firestore
        const eventsToSave = normalizedEvents.map(e => ({
          ...e,
          lastUpdated: Timestamp.now()
        }));

        await disasterRepo.saveBatch(eventsToSave);

        return eventsToSave;
      }
      
      return []; 

    } catch (error) {
      console.warn('EONET API fetch failed or rate-limited. Falling back to Firestore cache.');
      
      // 4. Fallback: Fetch from Firestore
      const cachedEvents = await disasterRepo.getAll();
      
      if (cachedEvents.length === 0) {
        console.error('No cached disaster events available in Firestore either.');
        return []; 
      }
      
      return cachedEvents;
    }
  },

  // Fetch single disaster by ID
  async getDisasterById(id: string) {
    try {
        // EONET doesn't have a great single-event endpoint that is guaranteed to be fast or different from the list.
        // Given we likely cache the list often, we can check our cache first or fetch the list if needed.
        // Efficiency: Check cache first via repo.
        
        let event = await disasterRepo.getById(id);
        if (event) return event;

        // If not in cache, maybe our cache is stale or it's a new event direct link. 
        // We could fetch the whole list to refresh cache.
        console.log(`Event ${id} not in cache, refreshing all active disasters...`);
        const allEvents = await disasterController.getActiveDisasters();
        return allEvents.find(e => e.id === id) || null;

    } catch (error) {
      console.error(`Error fetching disaster ${id}:`, error);
      return null;
    }
  }
};
