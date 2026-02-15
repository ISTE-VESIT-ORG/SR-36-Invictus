import { getUpcomingMissions } from '@/lib/backend';
import MissionsClient from './MissionsClient';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function MissionsPage() {
  const missions = await getUpcomingMissions();

  // Serialize and pass to client component
  return (
    <MissionsClient
      initialMissions={missions.map(m => ({
        ...m,
        lastUpdated: m.lastUpdated.toDate().toISOString(),
        description: m.description || 'No description available.',
        image_url: m.image_url || null,
        rover_image_url: m.rover_image_url || null
      }))}
    />
  );
}
