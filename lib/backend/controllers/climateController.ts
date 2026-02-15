import { Timestamp } from 'firebase-admin/firestore';
import { climateService } from '@/lib/backend/services/climateService';
import { climateRepo } from '@/lib/backend/firebase/climateRepo';
import { impactClimateRepo } from '@/lib/backend/firebase/impactClimateRepo';

export interface ClimateSummary {
  avgTemperatureAnomaly: number; // °C
  avgCO2: number; // ppm
  avgSeaLevelRise: number; // mm
  avgIceLoss: number; // Gt
  totalRegions: number;
  lastUpdated?: string; // ISO timestamp (for serialization)
  cacheAgeHours?: number; // Hours since last update
}

export const climateController = {
  /**
   * Fetch current climate metrics with fallback strategy
   */
  async getClimateMetrics() {
    try {
      // 1. Try fetching fresh data
      const metrics = await climateService.fetchClimateMetrics();

      if (metrics && metrics.length > 0) {
        // 2. Add Firestore Timestamp and save to cache
        const metricsToSave = metrics.map((m) => ({
          ...m,
          lastUpdated: Timestamp.now(),
        }));

        await climateRepo.saveBatch(metricsToSave);

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Climate Controller] Fetched ${metrics.length} climate metrics`
          );
        }

        return metricsToSave;
      }

      // Fallback to cache
      const cachedMetrics = await climateRepo.getCurrentYear();
      return cachedMetrics;
    } catch (error) {
      console.error(
        '[Climate Controller] Error fetching climate data:',
        error
      );

      // Fallback: Fetch from Firestore cache
      const cachedMetrics = await climateRepo.getCurrentYear();

      if (cachedMetrics.length === 0) {
        console.error(
          '[Climate Controller] No cached climate data available'
        );
        return [];
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Climate Controller] Using cached data: ${cachedMetrics.length} metrics`
        );
      }

      return cachedMetrics;
    }
  },

  /**
   * Get climate summary statistics for Impact page cards
   * Uses cached summary (6-hour TTL) for consistency and instant loading
   */
  async getClimateSummary(): Promise<ClimateSummary> {
    try {
      // 1. Try to get cached summary first (6-hour TTL)
      const cached = await impactClimateRepo.getCached();
      
      if (cached) {
        // Cache hit - return immediately with metadata for instant loading
        return {
          ...cached.summary,
          lastUpdated: cached.lastUpdated.toDate().toISOString(),
          cacheAgeHours: cached.cacheAgeHours,
        };
      }

      // 2. Cache miss or expired - compute fresh summary
      if (process.env.NODE_ENV === 'development') {
        console.log('[Climate Controller] Cache miss - computing fresh summary');
      }

      const metrics = await climateController.getClimateMetrics();

      if (metrics.length === 0) {
        // Return realistic fallback values based on current climate science
        const fallback: ClimateSummary = {
          avgTemperatureAnomaly: 1.35, // Current global average
          avgCO2: 422, // Current CO2 levels
          avgSeaLevelRise: 105, // mm since 1993
          avgIceLoss: 280, // Gt per year average
          totalRegions: 0,
        };

        // Save fallback to cache to prevent repeated failures
        await impactClimateRepo.save(fallback);
        return fallback;
      }

      // Calculate averages across all regions
      const avgTemperatureAnomaly =
        metrics.reduce((sum, m) => sum + m.temperature_anomaly_c, 0) /
        metrics.length;

      const avgCO2 =
        metrics.reduce((sum, m) => sum + m.co2_ppm, 0) / metrics.length;

      const avgSeaLevelRise =
        metrics.reduce((sum, m) => sum + m.sea_level_rise_mm, 0) /
        metrics.length;

      const avgIceLoss =
        metrics.reduce((sum, m) => sum + m.ice_mass_loss_gt, 0) /
        metrics.length;

      const summary: ClimateSummary = {
        avgTemperatureAnomaly: Math.round(avgTemperatureAnomaly * 100) / 100,
        avgCO2: Math.round(avgCO2 * 10) / 10,
        avgSeaLevelRise: Math.round(avgSeaLevelRise),
        avgIceLoss: Math.round(avgIceLoss),
        totalRegions: metrics.length,
      };

      // 3. Save to cache for future requests
      await impactClimateRepo.save(summary);

      return summary;
    } catch (error) {
      console.error('[Climate Controller] Error computing summary:', error);
      
      // Try to return stale cache as last resort
      const cached = await impactClimateRepo.getCached();
      if (cached) {
        console.warn('[Climate Controller] Using stale cache due to error');
        return cached.summary;
      }

      // Final fallback
      return {
        avgTemperatureAnomaly: 1.35,
        avgCO2: 422,
        avgSeaLevelRise: 105,
        avgIceLoss: 280,
        totalRegions: 0,
      };
    }
  },

  /**
   * Get historical climate data for trends
   */
  async getHistoricalData(years: number = 5) {
    try {
      // Check cache first
      const cachedData = await climateRepo.getHistorical(years);

      if (cachedData.length > 0) {
        return cachedData;
      }

      // Fetch fresh data
      const historicalData = await climateService.fetchHistoricalData(years);

      // Save to cache
      const dataToSave = historicalData.map((d) => ({
        ...d,
        lastUpdated: Timestamp.now(),
      }));

      await climateRepo.saveBatch(dataToSave);

      return dataToSave;
    } catch (error) {
      console.error(
        '[Climate Controller] Error fetching historical data:',
        error
      );
      return [];
    }
  },

  /**
   * Get metric by ID
   */
  async getMetricById(id: string) {
    try {
      const metric = await climateRepo.getById(id);
      if (metric) return metric;

      // If not in cache, refresh
      console.log(
        `[Climate Controller] Metric ${id} not in cache, refreshing...`
      );
      const allMetrics = await climateController.getClimateMetrics();
      return allMetrics.find((m) => m.id === id) || null;
    } catch (error) {
      console.error(`[Climate Controller] Error fetching metric ${id}:`, error);
      return null;
    }
  },
};
