
import { getMissionById, getRoverImagesForMultipleRovers } from '@/lib/backend';
import type { RoverName } from '@/lib/backend/space-data/marsRoverService';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Rocket, TrendingUp, ArrowLeft, Clock, Info, ExternalLink } from 'lucide-react';

export const revalidate = 60;

export default async function MissionDetailsPage({ params }: { params: { id: string } }) {
  const mission = await getMissionById(params.id);

  if (!mission) {
    notFound();
  }

    // Format date
  const launchDate = new Date(mission.launch_date);
  const formattedDate = launchDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = launchDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const isMarsRoverMission = () => {
        const name = mission.mission_name.toLowerCase();
        const description = (mission.description || '').toLowerCase();
        const text = `${name} ${description}`;
        return (
            text.includes('mars') ||
            text.includes('rover') ||
            text.includes('curiosity') ||
            text.includes('perseverance') ||
            text.includes('opportunity') ||
            text.includes('spirit')
        );
    };

    // Fetch rover images with TTL caching (max 6 images)
    let roverImageUrls: string[] = [];
    if (isMarsRoverMission()) {
        const rovers: RoverName[] = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
        roverImageUrls = await getRoverImagesForMultipleRovers(params.id, rovers, 6);
    }

  return (
    <div className="min-h-screen bg-space-black text-white pt-24 pb-16">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0 h-[60vh]">
        {mission.rover_image_url ? (
             <Image
                src={mission.rover_image_url}
                alt={mission.mission_name}
                fill
                className="object-cover opacity-30"
                priority
            />
        ) : mission.image_url ? (
             <Image
                src={mission.image_url}
                alt={mission.mission_name}
                fill
                className="object-cover opacity-30"
                priority
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-b from-space-gray-900 to-space-black opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-space-black/50 via-space-black/80 to-space-black" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <Link href="/missions" className="inline-flex items-center text-cosmic-purple hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Missions
        </Link>
        
        <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
                <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                        mission.mission_status === 'Active' ? 'bg-aurora-green/20 text-aurora-green' :
                        mission.mission_status === 'Go for Launch' ? 'bg-galaxy-cyan/20 text-galaxy-cyan' :
                        mission.mission_status === 'TBD' ? 'bg-meteor-orange/20 text-meteor-orange' :
                        'bg-nebula-pink/20 text-nebula-pink'
                    }`}>
                        {mission.mission_status}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-2 text-star-white">{mission.mission_name}</h1>
                    <p className="text-xl text-galaxy-cyan font-medium flex items-center">
                        {mission.agency_name}
                    </p>
                </div>

                <div className="bg-space-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-space-gray-700">
                    <h2 className="text-2xl font-bold font-display mb-4 flex items-center">
                        <Info className="w-6 h-6 mr-3 text-cosmic-purple" />
                        Mission Overview
                    </h2>
                    <p className="text-lg text-space-gray-300 leading-relaxed">
                        {mission.description || 'No detailed description available for this mission.'}
                    </p>
                </div>

                {isMarsRoverMission() && (
                    <div className="bg-space-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-space-gray-700">
                        <h2 className="text-2xl font-bold font-display mb-6 flex items-center">
                            <Info className="w-6 h-6 mr-3 text-cosmic-purple" />
                            Mars Rover Gallery
                        </h2>

                        {roverImageUrls.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-space-gray-400 mb-2">Rover imagery temporarily unavailable.</p>
                                <p className="text-space-gray-500 text-sm">Images from NASA Mars rovers will appear here when available.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {roverImageUrls.slice(0, 6).map((imageUrl, index) => (
                                        <div key={`rover-image-${index}`} className="bg-space-gray-800/60 border border-space-gray-700 rounded-xl overflow-hidden hover:border-cosmic-purple transition-colors group">
                                            <div className="relative w-full h-48">
                                                <Image
                                                    src={imageUrl}
                                                    alt={`Mars Rover photo ${index + 1}`}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <Link
                                    href="https://mars.nasa.gov/mars-exploration/missions/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-cosmic-purple hover:text-white transition-colors font-medium"
                                >
                                    View more on NASA Mars Exploration
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                     <div className="bg-space-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-space-gray-700">
                        <h3 className="text-sm uppercase tracking-wider text-space-gray-500 font-bold mb-1">Rocket</h3>
                        <div className="flex items-center text-lg md:text-xl font-bold text-white">
                            <Rocket className="w-5 h-5 mr-3 text-meteor-orange" />
                            {mission.rocket_name}
                        </div>
                    </div>
                     <div className="bg-space-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-space-gray-700">
                        <h3 className="text-sm uppercase tracking-wider text-space-gray-500 font-bold mb-1">Orbit</h3>
                        <div className="flex items-center text-lg md:text-xl font-bold text-white">
                            <TrendingUp className="w-5 h-5 mr-3 text-aurora-green" />
                            {mission.orbit_type}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
                <div className="bg-space-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-space-gray-700 sticky top-24">
                     <h3 className="text-xl font-bold font-display mb-6 pb-4 border-b border-space-gray-700">Launch Details</h3>
                     
                     <div className="space-y-6">
                        <div>
                             <h4 className="text-sm text-space-gray-500 font-bold uppercase mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" /> Launch Date
                             </h4>
                             <p className="text-lg text-white font-medium">{formattedDate}</p>
                        </div>
                        
                        <div>
                             <h4 className="text-sm text-space-gray-500 font-bold uppercase mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> Launch Time
                             </h4>
                             <p className="text-lg text-white font-medium">{formattedTime}</p>
                        </div>

                         <div>
                             <h4 className="text-sm text-space-gray-500 font-bold uppercase mb-2 flex items-center">
                                <MapPin className="w-4 h-4 mr-2" /> Launch Site
                             </h4>
                             <p className="text-lg text-white font-medium">{mission.launch_site}</p>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
