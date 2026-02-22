import { Timestamp } from 'firebase-admin/firestore';
import { launchLibraryService } from '@/lib/backend/services/launchLibraryService';
import { getMarsRoverImages } from '@/lib/backend/space-data/marsRoverData';
import type { RoverName } from '@/lib/backend/space-data/marsRoverService';
import { missionsRepo } from '@/lib/backend/firebase/missionsRepo';
import { fetchWithBackgroundRefresh } from '@/lib/backend/simpleCache';

export const missionsController = {

  // Identify rover-specific missions and map to rover name
  getRoverNameForMission(mission: { mission_name: string; description?: string | null }): RoverName | null {
    const name = mission.mission_name.toLowerCase();
    const description = (mission.description || '').toLowerCase();
    const text = `${name} ${description}`;

    if (text.includes('perseverance')) return 'perseverance';
    if (text.includes('curiosity')) return 'curiosity';
    if (text.includes('opportunity')) return 'opportunity';
    if (text.includes('spirit')) return 'spirit';

    // For generic Mars rover mentions, default to a current rover
    if (text.includes('mars') || text.includes('rover')) return 'perseverance';

    return null;
  },

  // Fetch upcoming missions with fallback strategy
  async getUpcomingMissions() {
    const start = Date.now();
    try {
      // 1. Try fetching fresh data from Launch Library API (use in-process cache, TTL 1 hour)
      const apiMissions = await fetchWithBackgroundRefresh('launchlibrary_upcoming', 60 * 60_000, async () => {
        const fetched = await launchLibraryService.fetchUpcomingLaunches();
        return fetched;
      });

      const msFetch = Date.now() - start;
      console.info(`[missionsController] launch library fetch returned in ${msFetch}ms`);

      if (apiMissions && apiMissions.length > 0) {
        // 2. Normalize data
        const normalizedMissions = apiMissions.map(mission => launchLibraryService.normalizeMissionData(mission));

        // Fetch rover images for Mars rover missions only (parallelized)
        const roverNames = Array.from(new Set<RoverName>(
          normalizedMissions
            .map(m => missionsController.getRoverNameForMission(m))
            .filter(Boolean) as RoverName[]
        ));

        // Fetch images for each rover with limited concurrency to avoid many parallel requests
        const { runWithConcurrency } = await import('@/lib/backend/promisePool');

        const imageTasks = roverNames.map((roverName) => async () => {
          try {
            const images = await getMarsRoverImages(roverName);
            return [roverName, images[0]?.img_src || null] as const;
          } catch (err) {
            console.warn(`[missionsController] failed to fetch images for ${roverName}:`, err);
            return [roverName, null] as const;
          }
        });

        const roverImageResults = await runWithConcurrency(imageTasks, 3);
        const roverImagesByRover = new Map<RoverName, string | null>(
          (roverImageResults.filter(Boolean) as any[])
        );

        const enrichedMissions = normalizedMissions.map(mission => {
          const roverName = missionsController.getRoverNameForMission(mission);
          const roverImage = roverName ? roverImagesByRover.get(roverName) || null : null;
          return {
            ...mission,
            rover_image_url: roverImage
          };
        });

        // 3. Add Firestore Timestamp and save to Firestore
        const missionsToSave = enrichedMissions.map(m => ({
          ...m,
          lastUpdated: Timestamp.now()
        }));

        // Save to Firestore asynchronously so persistence issues don't block responses
        missionsRepo.saveBatch(missionsToSave).catch(err => {
          console.warn('[missionsController] missions saveBatch failed (non-blocking):', err);
        });

        const totalMs = Date.now() - start;
        console.info(`[missionsController] getUpcomingMissions total time ${totalMs}ms`);

        return missionsToSave;
      }

      // If API returns empty array but 200 OK
      return [];

    } catch (error) {
      const ms = Date.now() - start;
      console.warn(`[missionsController] API fetch failed after ${ms}ms. Falling back to Firestore cache.`);

      // 4. Fallback: Fetch from Firestore
      const cachedMissions = await missionsRepo.getAll();

      if (cachedMissions.length === 0) {
        console.error('No cached missions available in Firestore either.');
        return [];
      }

      return cachedMissions;
    }
  },

  // Fetch single mission by ID with fallback strategy
  async getMissionById(id: string) {
    try {
      // 1. Try fetching fresh data from Launch Library API
      const apiMission = await launchLibraryService.fetchMissionById(id);
      
      // 2. Normalize and save to Firestore
      const normalized = launchLibraryService.normalizeMissionData(apiMission);
      const roverName = missionsController.getRoverNameForMission(normalized);
      let roverImageUrl: string | null = null;

      if (roverName) {
        const images = await getMarsRoverImages(roverName);
        roverImageUrl = images[0]?.img_src || null;
      }

      const missionToSave = {
        ...normalized,
        rover_image_url: roverImageUrl,
        lastUpdated: Timestamp.now()
      };

      // Persist asynchronously to avoid blocking callers if Firestore is slow/misconfigured
      missionsRepo.saveBatch([missionToSave]).catch(err => {
        console.warn(`[missionsController] saveBatch for mission ${id} failed (non-blocking):`, err);
      });

      return missionToSave;

    } catch (error) {
      console.warn(`API failed for mission ${id}. Trying Firestore cache.`, error);
      
      // 3. Fallback: Fetch from Firestore
      const cachedMission = await missionsRepo.getById(id);
      return cachedMission;
    }
  }
};
