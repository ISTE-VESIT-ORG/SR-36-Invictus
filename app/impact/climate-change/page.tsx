import { getClimateMetrics, getClimateHistoricalData, getClimateSummary } from '@/lib/backend';
import ClimateClient from './ClimateClient';

export const revalidate = 3600; // Revalidate every hour

export default async function ClimateChangePage() {
  const [metrics, historicalData, summary] = await Promise.all([
    getClimateMetrics(),
    getClimateHistoricalData(5), // Last 5 years
    getClimateSummary(), // Fetch cached summary for consistency with Impact card
  ]);

  // Serialize for client component
  const serializedMetrics = metrics.map((m) => ({
    ...m,
    lastUpdated: m.lastUpdated.toDate().toISOString(),
  }));

  const serializedHistorical = historicalData.map((h) => ({
    ...h,
    lastUpdated: h.lastUpdated.toDate().toISOString(),
  }));

  return (
    <ClimateClient 
      initialMetrics={serializedMetrics}
      historicalData={serializedHistorical}
      summary={summary}
    />
  );
}
