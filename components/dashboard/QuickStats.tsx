'use client';

import { motion } from 'framer-motion';
import { Rocket, Satellite, Globe, Sparkles, TrendingUp, Users } from 'lucide-react';

export function EnhancedStats() {
    const stats = [
        {
            icon: Satellite,
            value: '5,000+',
            label: 'Active Satellites',
            color: 'from-galaxy-cyan to-cosmic-purple',
            iconColor: 'text-galaxy-cyan',
        },
        {
            icon: TrendingUp,
            value: '24/7',
            label: 'Real-Time Data',
            color: 'from-aurora-green to-galaxy-cyan',
            iconColor: 'text-aurora-green',
        },
        {
            icon: Users,
            value: '50K+',
            label: 'Space Enthusiasts',
            color: 'from-nebula-pink to-meteor-orange',
            iconColor: 'text-nebula-pink',
        },
        {
            icon: Globe,
            value: '195',
            label: 'Countries Covered',
            color: 'from-meteor-orange to-cosmic-purple',
            iconColor: 'text-meteor-orange',
        },
    ];

    return (
        <div className="py-20 px-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-space-black via-space-gray-900/50 to-space-black" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-4">
                        Powering Space Exploration
                    </h2>
                    <p className="text-lg text-space-gray-300">
                        Join thousands discovering the universe through real-time data
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="group relative bg-space-gray-900/50 backdrop-blur-sm border border-space-gray-800 hover:border-space-gray-600 rounded-2xl p-6 text-center transition-all duration-300"
                        >
                            {/* Gradient Glow on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className="inline-block mb-4"
                                >
                                    <stat.icon className={`w-10 h-10 ${stat.iconColor} mx-auto`} />
                                </motion.div>
                                <div className="text-4xl font-bold text-star-white font-display mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-space-gray-400">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
