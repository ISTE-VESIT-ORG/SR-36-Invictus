export type RoverName = 'curiosity' | 'perseverance' | 'opportunity' | 'spirit';

export interface MarsRoverImage {
  id: string;
  rover: RoverName;
  camera: string;
  earth_date: string;
  sol: number;
  img_src: string;
  lastUpdated?: unknown;
}

interface MarsRoverApiPhoto {
  id: number;
  sol: number;
  camera: { name: string; full_name: string };
  img_src: string;
  earth_date: string;
  rover: { name: string };
}

interface MarsRoverApiResponse {
  latest_photos: MarsRoverApiPhoto[];
}

const NASA_API_KEY =
  process.env.NASA_NEO_API_KEY ||
  process.env.NASA_API_KEY ||
  'DEMO_KEY';

export const marsRoverService = {
  async fetchLatestPhotos(roverName: RoverName, maxImages: number = 6): Promise<MarsRoverImage[]> {
    const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/latest_photos?api_key=${NASA_API_KEY}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[NASA API] Fetching ${roverName} rover photos (max: ${maxImages})`);
    }

    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NASA Mars Rover API error: ${response.status} - ${errorText}`);
      throw new Error(`NASA Mars Rover API error: ${response.status}`);
    }

    const data = (await response.json()) as MarsRoverApiResponse;
    const photos = data.latest_photos || [];

    if (process.env.NODE_ENV === 'development') {
      console.log(`[NASA API] Received ${photos.length} photos for ${roverName}, limiting to ${maxImages}`);
    }

    const filteredImages = photos
      .filter(photo => photo.img_src)
      .slice(0, maxImages) // Limit to max images
      .map(photo => ({
        id: String(photo.id),
        rover: roverName,
        camera: photo.camera?.full_name || photo.camera?.name || 'Unknown',
        earth_date: photo.earth_date,
        sol: photo.sol,
        img_src: photo.img_src
      }));

    return filteredImages;
  }
};
