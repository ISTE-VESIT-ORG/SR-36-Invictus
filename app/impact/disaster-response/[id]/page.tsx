
import { getDisasterById } from '@/lib/backend';
import { notFound } from 'next/navigation';
import DisasterDetailClient from './DisasterDetailClient';

export const revalidate = 3600;

export default async function DisasterDetailPage({ params }: { params: { id: string } }) {
  const event = await getDisasterById(params.id);

  if (!event) {
    notFound();
  }

  // Serialize timestamps for client
  const serializedEvent = {
        ...event,
        lastUpdated: event.lastUpdated.toDate().toISOString(),
        // Coordinates might be array or single obj depending on repo/service (service implies obj or array, let's normalize output here as well if needed)
        // Repo returns { lat, lng }[] usually based on repo interface, but controller might not enforce it strictly if service varies. 
        // My interface in DisasterRepo says { lat, lng }[]
        // My Service says: coordinates: { lat, lng } (single object)?
        // Let's check service again. 
        // Service: coordinates: geometry ? { lng: coords[0], lat: coords[1] } : { lat: 0, lng: 0 } -> Single Object.
        // Repo Interface: coordinates: { lat: number; lng: number }[]; -> Array.
        // Mismatch!
        
        // Let's fix the serialization to be safe locally.
        coordinates: Array.isArray(event.coordinates) 
            ? event.coordinates 
            : [event.coordinates] // Wrap single object in array if repo didn't catch it
  };

  return <DisasterDetailClient event={serializedEvent} />;
}
