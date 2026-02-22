
import { getActiveDisasters } from '@/lib/backend';
import DisasterClient from './DisasterClient';

export const revalidate = 3600;

export default async function DisasterResponsePage() {
  const events = await getActiveDisasters();

  // Serialization for Client Component
  const serializedEvents = events.map(e => ({
    ...e,
    lastUpdated: (e.lastUpdated && typeof (e.lastUpdated as any).toDate === 'function')
      ? (e.lastUpdated as any).toDate().toISOString()
      : e.lastUpdated || new Date().toISOString(),
    // ensure coords are array for client map logic if normalized differently previously
    // Interface says coordinates: { lat, lng }[]
  }));

  return <DisasterClient initialEvents={serializedEvents} />;
}
