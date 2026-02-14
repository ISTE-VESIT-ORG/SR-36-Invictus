import Image from 'next/image';
import { Rocket, Calendar, MapPin, TrendingUp } from 'lucide-react';

export default function MissionsPage() {
    const activeMissions = [
        {
            name: 'Artemis III',
            agency: 'NASA',
            status: 'Planned',
            launch: '2026',
            description: 'First crewed lunar landing since Apollo 17. Will land near the lunar south pole.',
            objective: 'Establish sustainable lunar presence',
            icon: '🌙',
        },
        {
            name: 'Mars Sample Return',
            agency: 'NASA / ESA',
            status: 'In Progress',
            launch: '2027-2028',
            description: 'Retrieve samples collected by Perseverance rover and return them to Earth.',
            objective: 'Search for signs of ancient life',
            icon: '🔴',
        },
        {
            name: 'Europa Clipper',
            agency: 'NASA',
            status: 'Active',
            launch: 'October 2024',
            description: 'Studying Jupiter\'s moon Europa to determine if it could support life.',
            objective: 'Investigate habitability',
            icon: '🪐',
        },
        {
            name: 'Gaganyaan',
            agency: 'ISRO',
            status: 'Planned',
            launch: '2026',
            description: 'India\'s first crewed orbital spaceflight mission.',
            objective: 'Demonstrate human spaceflight capability',
            icon: '🚀',
        },
        {
            name: 'Starship',
            agency: 'SpaceX',
            status: 'Testing',
            launch: 'Ongoing',
            description: 'Fully reusable super heavy-lift launch vehicle for Mars colonization.',
            objective: 'Enable interplanetary travel',
            icon: '🛸',
        },
        {
            name: 'James Webb Space Telescope',
            agency: 'NASA / ESA / CSA',
            status: 'Active',
            launch: 'December 2021',
            description: 'Observing the universe in infrared, studying early galaxies and exoplanets.',
            objective: 'Understand universe origins',
            icon: '🔭',
        },
    ];

    return (
        <div className="min-h-screen bg-space-black pt-24 pb-16">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/iss.png"
                    alt="International Space Station"
                    fill
                    className="object-cover opacity-20"
                    quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-space-black via-space-black/80 to-space-black" />
            </div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-star-white font-display mb-4">
                        Space Missions
                    </h1>
                    <p className="text-xl text-space-gray-300 max-w-2xl mx-auto">
                        Follow active missions from NASA, ISRO, SpaceX, and space agencies worldwide.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-cosmic-purple mb-1">127</div>
                        <div className="text-sm text-space-gray-400">Active Missions</div>
                    </div>
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-galaxy-cyan mb-1">23</div>
                        <div className="text-sm text-space-gray-400">Upcoming Launches</div>
                    </div>
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-aurora-green mb-1">8</div>
                        <div className="text-sm text-space-gray-400">Space Agencies</div>
                    </div>
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-nebula-pink mb-1">450+</div>
                        <div className="text-sm text-space-gray-400">Astronauts</div>
                    </div>
                </div>

                {/* Missions Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeMissions.map((mission, i) => (
                        <div
                            key={i}
                            className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl p-6 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-4xl mb-2">{mission.icon}</div>
                                    <h3 className="text-xl font-bold text-star-white font-display">
                                        {mission.name}
                                    </h3>
                                    <p className="text-sm text-cosmic-purple font-medium">{mission.agency}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mission.status === 'Active' ? 'bg-aurora-green/20 text-aurora-green' :
                                        mission.status === 'In Progress' ? 'bg-galaxy-cyan/20 text-galaxy-cyan' :
                                            mission.status === 'Testing' ? 'bg-meteor-orange/20 text-meteor-orange' :
                                                'bg-nebula-pink/20 text-nebula-pink'
                                    }`}>
                                    {mission.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-space-gray-300">
                                    <Calendar className="w-4 h-4 text-galaxy-cyan" />
                                    <span className="text-sm">Launch: {mission.launch}</span>
                                </div>
                                <div className="flex items-center gap-2 text-space-gray-300">
                                    <TrendingUp className="w-4 h-4 text-aurora-green" />
                                    <span className="text-sm">{mission.objective}</span>
                                </div>
                            </div>

                            <p className="text-space-gray-300 text-sm mb-4">
                                {mission.description}
                            </p>

                            <button className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors">
                                View Details →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
