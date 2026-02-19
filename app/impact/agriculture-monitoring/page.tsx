import { getAgricultureZones, getAgricultureSummary } from '@/lib/backend';
import AgricultureClient from './AgricultureClient';

export const revalidate = 3600; // Revalidate every hour

export default async function AgricultureMonitoringPage() {
  // Fetch both zones and summary from the same data source
  const [zones, summary] = await Promise.all([
    getAgricultureZones(),
    getAgricultureSummary(),
  ]);

  // Serialize for client component
  const serializedZones = zones.map((z) => ({
    ...z,
    lastUpdated: z.lastUpdated.toDate().toISOString(),
  }));

  return (
    <AgricultureClient 
      initialZones={serializedZones}
      summary={summary}
    />
  );
}
