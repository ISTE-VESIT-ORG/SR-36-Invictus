import { Timestamp } from 'firebase-admin/firestore';
import { agricultureService } from '@/lib/backend/services/agricultureService';
import { agricultureRepo } from '@/lib/backend/firebase/agricultureRepo';
import { impactAgricultureRepo } from '@/lib/backend/firebase/impactAgricultureRepo';
import { fetchWithBackgroundRefresh } from '@/lib/backend/simpleCache';

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

        // Save cache in background to avoid blocking requests when Firestore credentials are missing
        (async () => {
          try {
            await agricultureRepo.saveBatch(zonesToSave);
          } catch (err) {
            console.warn('[Agriculture Controller] background saveBatch failed:', err);
          }
        })();

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
    // Use in-memory cache with 1 hour TTL to avoid recomputing per-request
    try {
      const ttlMs = 60 * 60_000; // 1 hour

      const summary = await fetchWithBackgroundRefresh<AgricultureSummary | null>(
        'impact.agriculture_summary',
        ttlMs,
        async () => {
          // Compute fresh summary
          if (process.env.NODE_ENV === 'development') {
            console.log('[Agriculture Controller] Computing fresh agriculture summary');
          }

          const zones = await agricultureController.getAgricultureZones();

          if (!zones || zones.length === 0) {
            const fallback: AgricultureSummary = {
              totalAreaAcres: 250_000_000,
              avgVegetationHealth: 72,
              avgSoilMoisture: 65,
              yieldTrendPercent: 8.5,
              activeZones: 0,
            };

            // Persist fallback to durable cache in background
            (async () => {
              try {
                await impactAgricultureRepo.save(fallback);
              } catch (err) {
                console.warn('[Agriculture Controller] background impact save failed:', err);
              }
            })();

            return fallback;
          }

          const totalAreaHectares = zones.reduce((sum, z) => sum + z.area_hectares, 0);
          const totalAreaAcres = totalAreaHectares * 2.47105;

          const avgVegetationHealth = zones.reduce((sum, z) => sum + z.vegetation_health, 0) / zones.length;
          const avgSoilMoisture = zones.reduce((sum, z) => sum + z.soil_moisture, 0) / zones.length;
          const avgYieldTrend = zones.reduce((sum, z) => sum + z.yield_trend, 0) / zones.length;

          const computed: AgricultureSummary = {
            totalAreaAcres: Math.round(totalAreaAcres),
            avgVegetationHealth: Math.round(avgVegetationHealth),
            avgSoilMoisture: Math.round(avgSoilMoisture),
            yieldTrendPercent: Math.round(avgYieldTrend * 10) / 10,
            activeZones: zones.length,
          };

          // Persist durable cache in background (non-blocking)
          (async () => {
            try {
              await impactAgricultureRepo.save(computed);
            } catch (err) {
              console.warn('[Agriculture Controller] background impact save failed:', err);
            }
          })();

          return computed;
        }
      );

      if (summary === null) {
        // As a safety, try to return durable cache
        const cached = await impactAgricultureRepo.getCached();
        return cached?.summary || {
          totalAreaAcres: 250_000_000,
          avgVegetationHealth: 72,
          avgSoilMoisture: 65,
          yieldTrendPercent: 8.5,
          activeZones: 0,
        };
      }

      return summary;
    } catch (error) {
      console.error('[Agriculture Controller] Error computing summary:', error);
      // Fallback to durable cache
      const cached = await impactAgricultureRepo.getCached();
      if (cached) return cached.summary;
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
