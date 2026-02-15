
import { getActiveDisasters } from '@/lib/backend';
import DisasterClient from './DisasterClient';

export const revalidate = 3600;

export default async function DisasterResponsePage() {
  const events = await getActiveDisasters();

  // Serialization for Client Component
  const serializedEvents = events.map(e => ({
    ...e,
    lastUpdated: e.lastUpdated.toDate().toISOString(),
    // ensure coords are array for client map logic if normalized differently previously
    // Interface says coordinates: { lat, lng }[]
  }));

  return <DisasterClient initialEvents={serializedEvents} />;
}
