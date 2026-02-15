import { Timestamp } from 'firebase-admin/firestore';
import { launchLibraryService } from '@/lib/backend/services/launchLibraryService';
import { getMarsRoverImages } from '@/lib/backend/space-data/marsRoverData';
import type { RoverName } from '@/lib/backend/space-data/marsRoverService';
import { missionsRepo } from '@/lib/backend/firebase/missionsRepo';

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
    try {
      // 1. Try fetching fresh data from Launch Library API
      const apiMissions = await launchLibraryService.fetchUpcomingLaunches();
      
      if (apiMissions && apiMissions.length > 0) {
        // 2. Normalize data
        const normalizedMissions = apiMissions.map(mission => launchLibraryService.normalizeMissionData(mission));

        // Fetch rover images for Mars rover missions only
        const roverNames = new Set<RoverName>();
        normalizedMissions.forEach(mission => {
          const roverName = missionsController.getRoverNameForMission(mission);
          if (roverName) roverNames.add(roverName);
        });

        const roverImagesByRover = new Map<RoverName, string | null>();
        for (const roverName of Array.from(roverNames)) {
          const images = await getMarsRoverImages(roverName);
          roverImagesByRover.set(roverName, images[0]?.img_src || null);
        }

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

        await missionsRepo.saveBatch(missionsToSave);

        return missionsToSave;
      }
      
      // If API returns empty array but 200 OK (unlikely for upcoming), fallback to cache just in case?
      // Or just return empty array if that's the truth.
      // But typically API failures throw.
      return []; 

    } catch (error) {
      console.warn('API fetch failed or rate-limited. Falling back to Firestore cache.');
      
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

      await missionsRepo.saveBatch([missionToSave]);

      return missionToSave;

    } catch (error) {
      console.warn(`API failed for mission ${id}. Trying Firestore cache.`, error);
      
      // 3. Fallback: Fetch from Firestore
      const cachedMission = await missionsRepo.getById(id);
      return cachedMission;
    }
  }
};
