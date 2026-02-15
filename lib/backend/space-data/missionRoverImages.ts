import { marsRoverService, type RoverName } from './marsRoverService';
import { roverImagesRepo } from '@/lib/backend/firebase/roverImagesRepo';

/**
 * Get Mars Rover images by mission with TTL-based caching
 * 
 * @param missionId - Unique mission identifier
 * @param roverName - Name of the Mars rover (curiosity, perseverance, etc.)
 * @param maxImages - Maximum number of images to return (default: 6)
 * @returns Array of image URLs (max 6)
 * 
 * Behavior:
 * - Checks Firestore cache first
 * - If cache exists AND not expired: returns cached images
 * - If cache expired OR missing: fetches from NASA API and updates cache
 * - Falls back to cached data on API failure
 * - Never crashes the UI - returns empty array on total failure
 */
export async function getRoverImagesByMission(
  missionId: string,
  roverName: RoverName,
  maxImages: number = 6
): Promise<string[]> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Rover Images] Fetching for mission ${missionId}, rover ${roverName}`);
  }
  try {
    // Step 1: Check cache with TTL validation
    const cached = await roverImagesRepo.getByMission(missionId, roverName);
    
    if (cached) {
      // Cache hit - return cached images
      return cached.images.slice(0, maxImages);
    }

    // Step 2: Cache miss or expired - fetch from NASA API
    const images = await marsRoverService.fetchLatestPhotos(roverName, maxImages);
    const imageUrls = images.map((img) => img.img_src);

    if (imageUrls.length > 0) {
      // Save to cache with TTL
      await roverImagesRepo.saveCache(missionId, roverName, imageUrls);
      return imageUrls.slice(0, maxImages);
    }

    // Step 3: No new images from API - try loading any existing cache (even if expired)
    const fallbackCache = await roverImagesRepo.getByMission(missionId, roverName);
    if (fallbackCache) {
      console.warn(
        `[Fallback] Using expired cache for mission ${missionId}, rover ${roverName}`
      );
      return fallbackCache.images.slice(0, maxImages);
    }

    // Step 4: No data available
    return [];
  } catch (error) {
    console.error(
      `Error fetching rover images for mission ${missionId}, rover ${roverName}:`,
      error
    );

    // Final fallback: try to get any cached data
    try {
      const fallbackCache = await roverImagesRepo.getByMission(missionId, roverName);
      if (fallbackCache) {
        return fallbackCache.images.slice(0, maxImages);
      }
    } catch (fallbackError) {
      console.error('Fallback cache retrieval failed:', fallbackError);
    }

    // Return empty array to prevent UI crash
    return [];
  }
}

/**
 * Get rover images for multiple rovers by mission
 * Useful for missions that could use images from any available rover
 * 
 * @param missionId - Unique mission identifier
 * @param roverNames - Array of rover names to fetch from
 * @param maxImagesPerRover - Maximum images per rover (default: 6)
 * @returns Combined array of image URLs from all rovers
 */
export async function getRoverImagesForMultipleRovers(
  missionId: string,
  roverNames: RoverName[],
  maxImagesPerRover: number = 6
): Promise<string[]> {
  const results = await Promise.allSettled(
    roverNames.map((roverName) =>
      getRoverImagesByMission(missionId, roverName, maxImagesPerRover)
    )
  );

  const allImages: string[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allImages.push(...result.value);
    } else {
      console.error(
        `Failed to fetch images for rover ${roverNames[index]}:`,
        result.reason
      );
    }
  });

  return allImages;
}
