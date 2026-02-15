// Launch Library 2 API Service

interface LaunchLibraryResponse {
  results: any[];
}

export const launchLibraryService = {
  async fetchUpcomingLaunches(): Promise<any[]> {
    const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/';
    
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          // Add User-Agent if required by API to avoid blocks
          'User-Agent': 'SpaceMissionsApp/1.0'
        },
        next: { revalidate: 3600 } // Cache API reponse for 1 hour at Next.js level too
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Launch Library API Rate Limited (429)');
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data: LaunchLibraryResponse = await response.json();
      return data.results || [];
      
    } catch (error) {
      console.error('Error fetching from Launch Library API:', error);
      throw error; // Rethrow so controller handles fallback
    }
  },

  async fetchMissionById(id: string): Promise<any> {
    const API_URL = `https://ll.thespacedevs.com/2.2.0/launch/${id}/`;
    
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SpaceMissionsApp/1.0'
        },
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Launch Library API Rate Limited (429)');
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error(`Error fetching mission ${id} from Launch Library API:`, error);
      throw error;
    }
  },

  normalizeMissionData(apiMission: any): any {
    // Extract image from various possible fields in the API response
    let imageUrl = null;
    
    // Priority order: mission image > rocket image > program image > infographic
    if (apiMission.image) {
      imageUrl = apiMission.image;
    } else if (apiMission.rocket?.configuration?.image_url) {
      imageUrl = apiMission.rocket.configuration.image_url;
    } else if (apiMission.mission?.patch?.image_url) {
      imageUrl = apiMission.mission.patch.image_url;
    } else if (apiMission.infographic) {
      imageUrl = apiMission.infographic;
    } else if (apiMission.launch_service_provider?.logo_url) {
      imageUrl = apiMission.launch_service_provider.logo_url;
    }
    
    if (process.env.NODE_ENV === 'development' && imageUrl) {
      console.log(`[Launch Library] Image found for ${apiMission.name}: ${imageUrl}`);
    }

    return {
      id: apiMission.id,
      mission_name: apiMission.name || 'Unknown Mission',
      agency_name: apiMission.launch_service_provider?.name || 'Unknown Agency',
      launch_date: apiMission.net || new Date().toISOString(), // net = No Earlier Than
      mission_type: apiMission.mission?.type || 'Unknown Type',
      orbit_type: apiMission.mission?.orbit?.name || 'Unknown Orbit',
      mission_status: apiMission.status?.name || 'TBD',
      description: apiMission.mission?.description || 'No description available.',
      rocket_name: apiMission.rocket?.configuration?.name || 'Unknown Rocket',
      launch_site: apiMission.pad?.name || 'Unknown Launch Site',
      image_url: imageUrl,
      lastUpdated: new Date() // Will be converted to Firestore Timestamp in repo or controller if needed, but repo handles it
    };
  }
};
