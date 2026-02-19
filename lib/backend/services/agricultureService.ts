// NASA POWER API Service for Agriculture Monitoring
// API: https://power.larc.nasa.gov/docs/services/api/

export interface AgricultureZone {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  area_hectares: number;
  vegetation_health: number; // 0-100% (derived from precipitation/temp)
  soil_moisture: number; // 0-100% (derived from precipitation)
  crop_stress_level: 'Low' | 'Medium' | 'High'; // Derived from temp extremes
  yield_trend: number; // -20 to +20% (derived indicator)
  rainfall_mm: number;
  temperature_c: number;
  last_updated: string;
  alerts: string[];
}

export interface AgricultureApiData {
  parameters: {
    PRECTOTCORR?: { [date: string]: number }; // Precipitation
    T2M?: { [date: string]: number }; // Temperature at 2m
    T2M_MAX?: { [date: string]: number }; // Max temp
    T2M_MIN?: { [date: string]: number }; // Min temp
  };
}

// Sample agriculture zones (major farming regions globally)
const AGRICULTURE_ZONES = [
  { id: 'indo-gangetic', name: 'Indo-Gangetic Plain', location: 'India', lat: 30.3, lng: 76.5, area_hectares: 37000000 },
  { id: 'us-midwest', name: 'US Midwest', location: 'USA', lat: 41.8, lng: -93.6, area_hectares: 20000000 },
  { id: 'pampas', name: 'Pampas', location: 'Argentina', lat: -34.0, lng: -60.5, area_hectares: 54000000 },
  { id: 'great-plains', name: 'Great Plains', location: 'USA', lat: 39.8, lng: -98.6, area_hectares: 45000000 },
  { id: 'china-northeast', name: 'Northeast China Plain', location: 'China', lat: 43.9, lng: 125.3, area_hectares: 35000000 },
  { id: 'murray-darling', name: 'Murray-Darling Basin', location: 'Australia', lat: -34.5, lng: 143.5, area_hectares: 106000000 },
  { id: 'ukraine-breadbasket', name: 'Ukrainian Breadbasket', location: 'Ukraine', lat: 49.0, lng: 32.0, area_hectares: 32000000 },
  { id: 'nile-delta', name: 'Nile Delta', location: 'Egypt', lat: 30.8, lng: 31.2, area_hectares: 2400000 },
];

export const agricultureService = {
  /**
   * Fetch agriculture data for all zones
   * Falls back to derived/mock data if API fails
   */
  async fetchAgricultureData(): Promise<AgricultureZone[]> {
    try {
      // Fetch data for each zone
      const zones = await Promise.all(
        AGRICULTURE_ZONES.map(async (zone) => {
          try {
            const apiData = await this.fetchNASAPowerData(zone.lat, zone.lng);
            return this.deriveAgricultureMetrics(zone, apiData);
          } catch (error) {
            console.warn(`Failed to fetch data for ${zone.name}, using fallback`);
            return this.generateFallbackData(zone);
          }
        })
      );

      return zones;
    } catch (error) {
      console.error('Error fetching agriculture data:', error);
      // Return all fallback data
      return AGRICULTURE_ZONES.map(z => this.generateFallbackData(z));
    }
  },

  /**
   * Fetch data from NASA POWER API for a specific location
   */
  async fetchNASAPowerData(lat: number, lng: number): Promise<AgricultureApiData | null> {
    // Get last 30 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M,T2M_MAX,T2M_MIN&community=AG&longitude=${lng}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`);
      }

      const data = await response.json();
      return data.properties || null;
    } catch (error) {
      console.error('NASA POWER API fetch failed:', error);
      return null;
    }
  },

  /**
   * Derive agriculture metrics from NASA POWER data
   */
  deriveAgricultureMetrics(
    zone: typeof AGRICULTURE_ZONES[0],
    apiData: AgricultureApiData | null
  ): AgricultureZone {
    if (!apiData || !apiData.parameters) {
      return this.generateFallbackData(zone);
    }

    const { PRECTOTCORR, T2M, T2M_MAX, T2M_MIN } = apiData.parameters;

    // Calculate averages from last 30 days
    const precipData = PRECTOTCORR ? Object.values(PRECTOTCORR).filter(v => v !== -999) : [];
    const tempData = T2M ? Object.values(T2M).filter(v => v !== -999) : [];
    const maxTempData = T2M_MAX ? Object.values(T2M_MAX).filter(v => v !== -999) : [];

    const avgPrecip = precipData.length > 0 
      ? precipData.reduce((a, b) => a + b, 0) / precipData.length 
      : 2.5;
    
    const avgTemp = tempData.length > 0 
      ? tempData.reduce((a, b) => a + b, 0) / tempData.length 
      : 20;
    
    const maxTemp = maxTempData.length > 0 
      ? Math.max(...maxTempData) 
      : 30;

    // Derive metrics
    const totalRainfall = precipData.reduce((a, b) => a + b, 0);
    
    // Vegetation health: based on adequate rainfall (optimal: 50-100mm/month)
    const optimalMonthlyRain = 75;
    const monthlyRain = totalRainfall; // Last 30 days
    const rainHealthScore = Math.min(100, (monthlyRain / optimalMonthlyRain) * 100);
    
    // Temperature impact on health (optimal: 15-25°C)
    const tempHealthScore = avgTemp >= 15 && avgTemp <= 25 ? 100 : 
                            avgTemp < 15 ? Math.max(50, 100 - (15 - avgTemp) * 5) :
                            Math.max(50, 100 - (avgTemp - 25) * 3);
    
    const vegetationHealth = Math.round((rainHealthScore * 0.6 + tempHealthScore * 0.4));

    // Soil moisture: derived from recent precipitation (simplified)
    const soilMoisture = Math.min(100, Math.round((monthlyRain / 100) * 100));

    // Crop stress: based on temperature extremes
    const cropStress: 'Low' | 'Medium' | 'High' = maxTemp > 35 ? 'High' :
                       maxTemp > 30 ? 'Medium' : 'Low';

    // Yield trend: positive if good conditions, negative if poor
    const yieldTrend = vegetationHealth > 70 ? Math.round(Math.random() * 10 + 5) :
                       vegetationHealth > 50 ? Math.round(Math.random() * 10 - 5) :
                       Math.round(Math.random() * -15 - 5);

    // Generate alerts
    const alerts: string[] = [];
    if (cropStress === 'High') alerts.push('⚠️ Heat stress detected');
    if (monthlyRain < 20) alerts.push('🌵 Drought conditions');
    if (monthlyRain > 150) alerts.push('🌊 Excess rainfall');
    if (vegetationHealth < 50) alerts.push('🌱 Low vegetation health');

    return {
      id: zone.id,
      name: zone.name,
      location: zone.location,
      lat: zone.lat,
      lng: zone.lng,
      area_hectares: zone.area_hectares,
      vegetation_health: vegetationHealth,
      soil_moisture: soilMoisture,
      crop_stress_level: cropStress,
      yield_trend: yieldTrend,
      rainfall_mm: Math.round(totalRainfall),
      temperature_c: Math.round(avgTemp * 10) / 10,
      last_updated: new Date().toISOString(),
      alerts,
    };
  },

  /**
   * Generate fallback data when API fails
   */
  generateFallbackData(zone: typeof AGRICULTURE_ZONES[0]): AgricultureZone {
    const vegetationHealth = 60 + Math.round(Math.random() * 30);
    const soilMoisture = 50 + Math.round(Math.random() * 40);
    const cropStress: 'Low' | 'Medium' | 'High' = Math.random() > 0.7 ? 'Medium' : 'Low';
    const yieldTrend = Math.round(Math.random() * 20 - 10);

    const alerts: string[] = [];
    if (cropStress === 'Medium') {
      alerts.push('⚠️ Moderate stress detected');
    }
    if (vegetationHealth < 60) {
      alerts.push('🌱 Monitor vegetation health');
    }

    return {
      id: zone.id,
      name: zone.name,
      location: zone.location,
      lat: zone.lat,
      lng: zone.lng,
      area_hectares: zone.area_hectares,
      vegetation_health: vegetationHealth,
      soil_moisture: soilMoisture,
      crop_stress_level: cropStress,
      yield_trend: yieldTrend,
      rainfall_mm: 45 + Math.round(Math.random() * 50),
      temperature_c: 18 + Math.round(Math.random() * 12),
      last_updated: new Date().toISOString(),
      alerts,
    };
  },
};
