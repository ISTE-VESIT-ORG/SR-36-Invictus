import { Timestamp } from 'firebase-admin/firestore';
import { marsRoverService, type MarsRoverImage, type RoverName } from './marsRoverService';
import { marsRoverRepo } from '@/lib/backend/firebase/marsRoverRepo';

export async function getMarsRoverImages(roverName: RoverName): Promise<MarsRoverImage[]> {
  try {
    const images = await marsRoverService.fetchLatestPhotos(roverName);

    if (images.length > 0) {
      const toSave = images.map(image => ({
        ...image,
        lastUpdated: Timestamp.now()
      }));

      await marsRoverRepo.saveBatch(toSave);
      return images;
    }

    const cached = await marsRoverRepo.getByRover(roverName);
    return cached.map(({ lastUpdated, ...rest }) => rest);
  } catch (error) {
    console.error('NASA Mars Rover API failed, falling back to Firestore cache.', error);
    const cached = await marsRoverRepo.getByRover(roverName);
    return cached.map(({ lastUpdated, ...rest }) => rest);
  }
}
