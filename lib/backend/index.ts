import { missionsController } from './controllers/missionsController';
import { disasterController } from './controllers/disasterController';
import { agricultureController } from './controllers/agricultureController';
import { climateController } from './controllers/climateController';
import { getMarsRoverImages } from './space-data/marsRoverData';
import { getRoverImagesByMission, getRoverImagesForMultipleRovers } from './space-data/missionRoverImages';
import { getApod, getTruncatedExplanation, getYouTubeVideoId } from './space-data/apodService';

export const getUpcomingMissions = missionsController.getUpcomingMissions;
export const getMissionById = missionsController.getMissionById;

export const getActiveDisasters = disasterController.getActiveDisasters;
export const getDisasterById = disasterController.getDisasterById;

export const getAgricultureZones = agricultureController.getAgricultureZones;
export const getAgricultureZoneById = agricultureController.getZoneById;
export const getAgricultureSummary = agricultureController.getAgricultureSummary;

export const getClimateMetrics = climateController.getClimateMetrics;
export const getClimateMetricById = climateController.getMetricById;
export const getClimateSummary = climateController.getClimateSummary;
export const getClimateHistoricalData = climateController.getHistoricalData;

export { getMarsRoverImages, getRoverImagesByMission, getRoverImagesForMultipleRovers };
export { getApod, getTruncatedExplanation, getYouTubeVideoId };
