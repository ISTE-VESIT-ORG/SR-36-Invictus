import { Timestamp } from 'firebase-admin/firestore';
import { eonetService } from '@/lib/backend/services/eonetService';
import { disasterRepo } from '@/lib/backend/firebase/disasterRepo';
import { fetchWithBackgroundRefresh } from '@/lib/backend/simpleCache';

export const disasterController = {

  // Fetch active disasters with fallback strategy
  async getActiveDisasters() {
    // Use in-process cache with background refresh to avoid making the EONET request
    // on every navigation. TTL: 5 minutes.
    try {
      const raw = await fetchWithBackgroundRefresh('eonet_active_disasters', 5 * 60_000, async () => {
        // fetch fresh events from EONET
        const apiEvents = await eonetService.fetchActiveDisasters();
        return apiEvents || [];
      });

      if (raw && raw.length > 0) {
        const normalizedEvents = raw
          .map((event: any) => eonetService.normalizeDisasterEvent(event))
          .filter((e: any) =>
            Array.isArray(e.coordinates) &&
            e.coordinates.length > 0 &&
            Number.isFinite(e.coordinates[0]?.lat) &&
            Number.isFinite(e.coordinates[0]?.lng)
          );

        // Save to Firestore asynchronously but don't block response
        (async () => {
          try {
            const eventsToSave = normalizedEvents.map((e: any) => ({ ...e, lastUpdated: Timestamp.now() }));
            await disasterRepo.saveBatch(eventsToSave);
          } catch (err) {
            console.warn('[disasterController] failed to save disasters to Firestore:', err);
          }
        })();

        return normalizedEvents;
      }

      // Fallback: return cached Firestore data if available
      const cachedEvents = await disasterRepo.getAll();
      if (cachedEvents.length === 0) {
        return [];
      }
      return cachedEvents;
    } catch (error) {
      console.error('Error fetching disasters (cached):', error);
      const cachedEvents = await disasterRepo.getAll();
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
