import { Timestamp } from 'firebase-admin/firestore';
import { agricultureService } from '@/lib/backend/services/agricultureService';
import { agricultureRepo } from '@/lib/backend/firebase/agricultureRepo';
import { impactAgricultureRepo } from '@/lib/backend/firebase/impactAgricultureRepo';

export interface AgricultureSummary {
  totalAreaAcres: number; // Total area in acres
  avgVegetationHealth: number; // Average vegetation health %
  avgSoilMoisture: number; // Average soil moisture %
  yieldTrendPercent: number; // Average yield trend %
  activeZones: number; // Number of active monitoring zones
  lastUpdated?: string; // ISO timestamp (for serialization)
  cacheAgeHours?: number; // Hours since last update
}

export const agricultureController = {
  /**
   * Fetch agriculture zones with fallback strategy
   */
  async getAgricultureZones() {
    try {
      // 1. Try fetching fresh data from NASA POWER API
      const apiZones = await agricultureService.fetchAgricultureData();

      if (apiZones && apiZones.length > 0) {
        // 2. Add Firestore Timestamp and save to cache
        const zonesToSave = apiZones.map((zone) => ({
          ...zone,
          lastUpdated: Timestamp.now(),
        }));

        await agricultureRepo.saveBatch(zonesToSave);

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Agriculture Controller] Fetched ${apiZones.length} zones from NASA POWER API`);
        }

        return zonesToSave;
      }

      // Should not reach here since fetchAgricultureData has internal fallback
      console.warn('[Agriculture Controller] No data from API, checking cache');
      const cachedZones = await agricultureRepo.getAll();
      return cachedZones;

    } catch (error) {
      console.error('[Agriculture Controller] Error fetching agriculture data:', error);

      // 3. Fallback: Fetch from Firestore cache
      const cachedZones = await agricultureRepo.getAll();

      if (cachedZones.length === 0) {
        console.error('[Agriculture Controller] No cached agriculture data available');
        // Return empty or minimal fallback
        return [];
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Agriculture Controller] Using cached data: ${cachedZones.length} zones`);
      }

      return cachedZones;
    }
  },

  /**
   * Get agriculture summary statistics for Impact page cards
   * Uses cached summary (6-hour TTL) for consistency and instant loading
   */
  async getAgricultureSummary(): Promise<AgricultureSummary> {
    try {
      // 1. Try to get cached summary first (6-hour TTL)
      const cached = await impactAgricultureRepo.getCached();
      
      if (cached) {
        // Cache hit - return immediately for instant loading
        return {
          ...cached.summary,
          lastUpdated: cached.lastUpdated.toDate().toISOString(),
          cacheAgeHours: cached.cacheAgeHours,
        };
      }

      // 2. Cache miss or expired - compute fresh summary
      if (process.env.NODE_ENV === 'development') {
        console.log('[Agriculture Controller] Cache miss - computing fresh summary');
      }

      const zones = await agricultureController.getAgricultureZones();

      if (zones.length === 0) {
        // Return default fallback values
        const fallback: AgricultureSummary = {
          totalAreaAcres: 250_000_000, // 250M acres fallback
          avgVegetationHealth: 72,
          avgSoilMoisture: 65,
          yieldTrendPercent: 8.5,
          activeZones: 0,
        };

        // Save fallback to cache to prevent repeated failures
        await impactAgricultureRepo.save(fallback);
        return fallback;
      }

      // Calculate aggregates
      const totalAreaHectares = zones.reduce((sum, z) => sum + z.area_hectares, 0);
      const totalAreaAcres = totalAreaHectares * 2.47105; // Convert hectares to acres

      const avgVegetationHealth =
        zones.reduce((sum, z) => sum + z.vegetation_health, 0) / zones.length;

      const avgSoilMoisture =
        zones.reduce((sum, z) => sum + z.soil_moisture, 0) / zones.length;

      const avgYieldTrend =
        zones.reduce((sum, z) => sum + z.yield_trend, 0) / zones.length;

      const summary: AgricultureSummary = {
        totalAreaAcres: Math.round(totalAreaAcres),
        avgVegetationHealth: Math.round(avgVegetationHealth),
        avgSoilMoisture: Math.round(avgSoilMoisture),
        yieldTrendPercent: Math.round(avgYieldTrend * 10) / 10, // 1 decimal place
        activeZones: zones.length,
      };

      // 3. Save to cache for future requests
      await impactAgricultureRepo.save(summary);

      return summary;
    } catch (error) {
      console.error('[Agriculture Controller] Error computing summary:', error);
      
      // Try to return stale cache as last resort
      const cached = await impactAgricultureRepo.getCached();
      if (cached) {
        console.warn('[Agriculture Controller] Using stale cache due to error');
        return cached.summary;
      }

      // Final fallback
      return {
        totalAreaAcres: 250_000_000,
        avgVegetationHealth: 72,
        avgSoilMoisture: 65,
        yieldTrendPercent: 8.5,
        activeZones: 0,
      };
    }
  },

  /**
   * Get single zone by ID
   */
  async getZoneById(id: string) {
    try {
      // Check cache first
      let zone = await agricultureRepo.getById(id);
      if (zone) return zone;

      // If not in cache, refresh all zones
      console.log(`[Agriculture Controller] Zone ${id} not in cache, refreshing...`);
      const allZones = await agricultureController.getAgricultureZones();
      return allZones.find((z) => z.id === id) || null;
    } catch (error) {
      console.error(`[Agriculture Controller] Error fetching zone ${id}:`, error);
      return null;
    }
  },
};
