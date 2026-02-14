import Image from 'next/image';
import { Thermometer, Droplets, Wind, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ImpactPage() {
    const impactShowcase = [
        {
            title: 'Agriculture Monitoring',
            image: '/images/agriculture-monitoring.png',
            icon: <Droplets className="w-8 h-8" />,
            color: 'text-aurora-green',
            stats: ['2.5B Acres', '85% Coverage', '20% Yield ↑'],
            description: 'Satellites monitor crop health, soil moisture, and predict yields using multispectral imaging.',
        },
        {
            title: 'Disaster Response',
            image: '/images/wildfire-monitoring.png',
            icon: <AlertTriangle className="w-8 h-8" />,
            color: 'text-meteor-orange',
            stats: ['15min Response', '195 Countries', '1000+ Lives'],
            description: 'Real-time tracking of wildfires, floods, and earthquakes to coordinate emergency response.',
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
                    className="object-cover"
                    quality={85}
                    priority
                />
                {/* Strong overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-space-black/85 via-space-black/75 to-space-black" />

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
                                className="group relative bg-space-gray-900 border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl overflow-hidden transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Dark gradient overlay for text */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-space-gray-900 via-space-gray-900/60 to-transparent" />

                                    {/* Icon Badge */}
                                    <div className={`absolute top-4 left-4 p-3 rounded-xl bg-space-black/80 backdrop-blur-sm ${item.color}`}>
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-star-white font-display mb-3">
                                        {item.title}
                                    </h3>

                                    <p className="text-space-gray-300 mb-4">
                                        {item.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {item.stats.map((stat, j) => (
                                            <div
                                                key={j}
                                                className="bg-space-gray-800/80 border border-space-gray-700 rounded-lg p-3 text-center"
                                            >
                                                <p className="text-sm font-bold text-star-white">{stat}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors">
                                        Learn More →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Impact Areas */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-8">
                            <div className="inline-flex p-4 rounded-xl bg-meteor-orange/10 text-meteor-orange mb-4">
                                <Thermometer className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-star-white font-display mb-3">
                                Climate Monitoring
                            </h3>
                            <p className="text-space-gray-300 mb-4">
                                Track global temperature changes, ice sheet melting, and sea level rise with precision satellite data.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-space-gray-800/50 border border-space-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-space-gray-400">+1.1°C Global</p>
                                </div>
                                <div className="bg-space-gray-800/50 border border-space-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-space-gray-400">3.4mm/yr Rise</p>
                                </div>
                                <div className="bg-space-gray-800/50 border border-space-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-space-gray-400">13% Ice Loss</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-8">
                            <div className="inline-flex p-4 rounded-xl bg-galaxy-cyan/10 text-galaxy-cyan mb-4">
                                <Wind className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-star-white font-display mb-3">
                                Weather Forecasting
                            </h3>
                            <p className="text-space-gray-300 mb-4">
                                Real-time weather data helps predict storms, hurricanes, and extreme weather events with high accuracy.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-space-gray-800/50 border border-space-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-space-gray-400">90% Accuracy</p>
                                </div>
                                <div className="bg-space-gray-800/50 border border-space-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-space-gray-400">24/7 Monitor</p>
                                </div>
                                <div className="bg-space-gray-800/50 border border-space-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-space-gray-400">50+ Satellites</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className="bg-gradient-to-br from-cosmic-purple/10 to-nebula-pink/10 border border-cosmic-purple/30 rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-star-white font-display mb-6 text-center">
                            Who Benefits from Satellite Data?
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-5xl mb-3">🌾</div>
                                <h3 className="text-lg font-bold text-star-white mb-2">Farmers</h3>
                                <p className="text-sm text-space-gray-300">
                                    Optimize irrigation, detect crop diseases early, and increase yields by 20%
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl mb-3">🚨</div>
                                <h3 className="text-lg font-bold text-star-white mb-2">Emergency Teams</h3>
                                <p className="text-sm text-space-gray-300">
                                    Respond faster to disasters with real-time damage assessment
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl mb-3">🌍</div>
                                <h3 className="text-lg font-bold text-star-white mb-2">Scientists</h3>
                                <p className="text-sm text-space-gray-300">
                                    Track climate change and protect endangered ecosystems
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
