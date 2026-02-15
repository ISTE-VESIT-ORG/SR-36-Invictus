import { missionsController } from './controllers/missionsController';
import { disasterController } from './controllers/disasterController';
import { getMarsRoverImages } from './space-data/marsRoverData';
import { getRoverImagesByMission, getRoverImagesForMultipleRovers } from './space-data/missionRoverImages';
import { getApod, getTruncatedExplanation, getYouTubeVideoId } from './space-data/apodService';

export const getUpcomingMissions = missionsController.getUpcomingMissions;
export const getMissionById = missionsController.getMissionById;

export const getActiveDisasters = disasterController.getActiveDisasters;
export const getDisasterById = disasterController.getDisasterById;

export { getMarsRoverImages, getRoverImagesByMission, getRoverImagesForMultipleRovers };
export { getApod, getTruncatedExplanation, getYouTubeVideoId };
