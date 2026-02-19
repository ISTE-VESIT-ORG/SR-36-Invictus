// Climate Change Monitoring Service
// Data sources: NASA GISS, NOAA, IPCC indicators

export interface ClimateMetric {
  id: string;
  region: string;
  location: string;
  lat: number;
  lng: number;
  temperature_anomaly_c: number; // Temperature anomaly in Celsius
  co2_ppm: number; // CO2 concentration in parts per million
  sea_level_rise_mm: number; // Sea level rise in millimeters
  ice_mass_loss_gt: number; // Ice mass loss in gigatons
  year: number;
  lastUpdated: string;
  alerts?: string[]; // Optional climate alerts
}

// Global climate regions for monitoring
const CLIMATE_REGIONS = [
  { id: 'global', region: 'Global Average', location: 'Worldwide', lat: 0, lng: 0, baseTemp: 14.0 },
  { id: 'arctic', region: 'Arctic', location: 'Arctic Circle', lat: 75, lng: 0, baseTemp: -15.0 },
  { id: 'north-america', region: 'North America', location: 'Continental USA', lat: 40, lng: -100, baseTemp: 12.0 },
  { id: 'europe', region: 'Europe', location: 'Central Europe', lat: 50, lng: 10, baseTemp: 9.0 },
  { id: 'asia', region: 'Asia', location: 'Central Asia', lat: 35, lng: 100, baseTemp: 13.0 },
  { id: 'africa', region: 'Africa', location: 'Central Africa', lat: 0, lng: 20, baseTemp: 24.0 },
  { id: 'south-america', region: 'South America', location: 'Amazon Basin', lat: -10, lng: -60, baseTemp: 23.0 },
  { id: 'oceania', region: 'Oceania', location: 'Australia', lat: -25, lng: 135, baseTemp: 22.0 },
];

export const climateService = {
  /**
   * Fetch climate metrics with realistic data
   * In production, this would connect to NASA GISS, NOAA APIs
   */
  async fetchClimateMetrics(): Promise<ClimateMetric[]> {
    try {
      // For now, generate realistic climate data based on current trends
      // In production: fetch from NASA GISS Surface Temperature Analysis API
      const currentYear = new Date().getFullYear();

      const metrics = CLIMATE_REGIONS.map((region) => {
        // Realistic climate trends (2024-2026)
        const tempAnomaly =
          region.id === 'arctic'
            ? 2.5 + Math.random() * 0.5 // Arctic warming faster
            : region.id === 'global'
            ? 1.35 + Math.random() * 0.15 // Current global average ~1.35°C
            : 1.0 + Math.random() * 0.8;

        const co2 =
          region.id === 'global'
            ? 422 + Math.random() * 3 // Current CO2 levels ~422 ppm
            : 420 + Math.random() * 5;

        const seaLevelRise =
          region.id === 'global'
            ? 105 + Math.random() * 5 // ~105mm since 1993
            : 95 + Math.random() * 15;

        const iceMassLoss =
          region.id === 'arctic'
            ? 350 + Math.random() * 50 // Greenland/Arctic ice loss
            : region.id === 'global'
            ? 280 + Math.random() * 30
            : 50 + Math.random() * 200;

        // Generate alerts based on severity
        const alerts: string[] = [];
        if (tempAnomaly >= 1.5) {
          alerts.push('Critical warming detected - exceeds Paris Agreement targets');
        } else if (tempAnomaly >= 1.2 && region.id === 'arctic') {
          alerts.push('Accelerated Arctic warming - monitoring ice sheet stability');
        }

        return {
          id: `${region.id}-${currentYear}`,
          region: region.region,
          location: region.location,
          lat: region.lat,
          lng: region.lng,
          temperature_anomaly_c: Math.round(tempAnomaly * 100) / 100,
          co2_ppm: Math.round(co2 * 10) / 10,
          sea_level_rise_mm: Math.round(seaLevelRise),
          ice_mass_loss_gt: Math.round(iceMassLoss),
          year: currentYear,
          lastUpdated: new Date().toISOString(),
          alerts: alerts.length > 0 ? alerts : undefined,
        };
      });

      return metrics;
    } catch (error) {
      console.error('[Climate Service] Error fetching climate data:', error);
      return this.generateFallbackData();
    }
  },

  /**
   * Generate fallback climate data
   */
  generateFallbackData(): ClimateMetric[] {
    const currentYear = new Date().getFullYear();

    return CLIMATE_REGIONS.map((region) => ({
      id: `${region.id}-${currentYear}`,
      region: region.region,
      location: region.location,
      lat: region.lat,
      lng: region.lng,
      temperature_anomaly_c: region.id === 'global' ? 1.35 : 1.2,
      co2_ppm: 422,
      sea_level_rise_mm: 105,
      ice_mass_loss_gt: region.id === 'arctic' ? 350 : 280,
      year: currentYear,
      lastUpdated: new Date().toISOString(),
      alerts: undefined,
    }));
  },

  /**
   * Get historical climate data for trends (simplified)
   */
  async fetchHistoricalData(years: number = 5): Promise<ClimateMetric[]> {
    const currentYear = new Date().getFullYear();
    const historicalData: ClimateMetric[] = [];

    // Generate data for past N years
    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i;
      const baseAnomaly = 1.0 + (years - i) * 0.08; // Increasing trend

      const metric: ClimateMetric = {
        id: `global-${year}`,
        region: 'Global Average',
        location: 'Worldwide',
        lat: 0,
        lng: 0,
        temperature_anomaly_c: Math.round(baseAnomaly * 100) / 100,
        co2_ppm: Math.round((410 + (years - i) * 2.5) * 10) / 10,
        sea_level_rise_mm: Math.round(95 + (years - i) * 2),
        ice_mass_loss_gt: Math.round(250 + (years - i) * 6),
        year,
        lastUpdated: new Date().toISOString(),
        alerts: undefined,
      };

      historicalData.push(metric);
    }

    return historicalData;
  },
};
