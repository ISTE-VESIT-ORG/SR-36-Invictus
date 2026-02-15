
import Image from 'next/image';
import Link from 'next/link';
import { Thermometer, Droplets, Wind, AlertTriangle, TrendingUp } from 'lucide-react';
import { getActiveDisasters } from '@/lib/backend';

export const revalidate = 3600; // Revalidate every hour

export default async function ImpactPage() {
    // 1. Fetch dynamic disaster data
    const activeDisasters = await getActiveDisasters();
    
    // 2. Calculate dynamic stats
    const totalActive = activeDisasters.length;
    
    // Simple keyword matching for stats
    const wildfireCount = activeDisasters.filter(d => 
        d.disaster_type.toLowerCase().includes('wildfire')
    ).length;
    
    const floodCount = activeDisasters.filter(d => 
        d.disaster_type.toLowerCase().includes('flood')
    ).length;

    const stormCount = activeDisasters.filter(d => 
        d.disaster_type.toLowerCase().includes('storm') || 
        d.disaster_type.toLowerCase().includes('cyclone')
    ).length;

    // Determine stats to show based on what's active (prioritize non-zero)
    const disasterStats = [];
    if (totalActive > 0) disasterStats.push(`${totalActive} Active Events`);
    else disasterStats.push('Calculating...');

    if (wildfireCount > 0) disasterStats.push(`${wildfireCount} Wildfires`);
    else if (stormCount > 0) disasterStats.push(`${stormCount} Storms`);
    
    if (floodCount > 0) disasterStats.push(`${floodCount} Floods`);
    else if (disasterStats.length < 3) disasterStats.push('Global Watch');

    // Ensure exactly 3 stats for layout consistency
    while (disasterStats.length < 3) {
        disasterStats.push('Monitoring...');
    }

    const impactShowcase = [
        {
            title: 'Agriculture Monitoring',
            image: '/images/agriculture-monitoring.png',
            icon: <Droplets className="w-8 h-8" />,
            color: 'text-aurora-green',
            stats: ['2.5B Acres', '85% Coverage', '20% Yield ↑'],
            description: 'Satellites monitor crop health, soil moisture, and predict yields using multispectral imaging.',
            link: '#' // Placeholder link
        },
        {
            title: 'Disaster Response',
            image: '/images/wildfire-monitoring.png',
            icon: <AlertTriangle className="w-8 h-8" />,
            color: 'text-meteor-orange',
            stats: disasterStats, // Dynamic!
            description: 'Real-time tracking of wildfires, floods, and earthquakes to coordinate emergency response.',
            link: '/impact/disaster-response' // Route to new module
        },
    ];

    return (
        <div className="min-h-screen bg-space-black">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/satellite-network.png"
                    alt="Satellite network"
                    fill
                    className="object-cover opacity-80"
                    quality={85}
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-space-black/90 via-space-black/70 to-space-black" />

                <div className="relative z-10 text-center px-8 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold text-star-white font-display mb-4 drop-shadow-2xl">
                        Real-World Impact
                    </h1>
                    <p className="text-xl md:text-2xl text-star-white drop-shadow-lg">
                        See how satellites monitor climate, agriculture, and disasters in real-time
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="py-16 px-8 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
                <div className="max-w-7xl mx-auto">

                    {/* Impact Showcase */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {impactShowcase.map((item, i) => (
                            <div
                                key={i}
                                className="group relative bg-space-gray-900 border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative h-64 w-full bg-space-black">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-space-gray-900 via-space-gray-900/60 to-transparent" />

                                    {/* Icon Badge */}
                                    <div className={`absolute top-4 left-4 p-3 rounded-xl bg-space-black/80 backdrop-blur-sm ${item.color}`}>
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-bold text-star-white font-display mb-3">
                                        {item.title}
                                    </h3>

                                    <p className="text-space-gray-300 mb-6 flex-grow">
                                        {item.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {item.stats.map((stat, j) => (
                                            <div
                                                key={j}
                                                className="bg-space-gray-800/80 border border-space-gray-700 rounded-lg p-3 text-center flex items-center justify-center min-h-[60px]"
                                            >
                                                <p className="text-sm font-bold text-star-white">{stat}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <Link 
                                        href={item.link}
                                        className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors text-center block"
                                    >
                                        Learn More →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Content Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                         <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-8 hover:border-aurora-green/30 transition-all">
                            <div className="inline-flex p-4 rounded-xl bg-meteor-orange/10 text-meteor-orange mb-4">
                                <Thermometer className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-star-white font-display mb-2">Climate Change</h3>
                            <p className="text-space-gray-300">
                                Tracking global temperature anomalies, ice cap melting rates, and sea level rise with millimeter precision.
                            </p>
                        </div>
                         <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-8 hover:border-galaxy-cyan/30 transition-all">
                            <div className="inline-flex p-4 rounded-xl bg-aurora-green/10 text-aurora-green mb-4">
                                <Wind className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-star-white font-display mb-2">Air Quality</h3>
                            <p className="text-space-gray-300">
                                Monitoring global aerosol optical depth, nitrogen dioxide levels, and pollution transport patterns.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
