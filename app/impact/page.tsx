
import Image from 'next/image';
import Link from 'next/link';
import { Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import ImpactClient from './ImpactClient';
import dynamic from 'next/dynamic';

const ImpactContentClient = dynamic(() => import('@/components/impact/ImpactContentClient'), { ssr: false, loading: () => null });

interface ImpactCardProps {
    title: string;
    description: string;
    imageUrl: string;
    icon: ReactNode;
    metrics: string[];
    link: string;
}

function ImpactCard({
    title,
    description,
    imageUrl,
    icon,
    metrics,
    link,
}: ImpactCardProps) {
    return (
        <div className="group relative bg-space-gray-900 border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] flex flex-col">
            {/* Image */}
            <div className="relative h-64 w-full bg-space-black">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-gray-900 via-space-gray-900/60 to-transparent" />

                {/* Icon Badge */}
                <div className="absolute top-4 left-4 p-3 rounded-xl bg-space-black/80 backdrop-blur-sm">
                    {icon}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-star-white font-display mb-3">
                    {title}
                </h3>

                <p className="text-space-gray-300 mb-6 flex-grow">
                    {description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {metrics.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-space-gray-800/80 border border-space-gray-700 rounded-lg p-3 text-center flex items-center justify-center min-h-[60px]"
                        >
                            <p className="text-sm font-bold text-star-white">{stat}</p>
                        </div>
                    ))}
                </div>

                <Link
                    href={link}
                    className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors text-center block"
                >
                    Learn More →
                </Link>
            </div>
        </div>
    );
}

export const revalidate = 3600; // Revalidate every hour

export default function ImpactPage() {
    return (
        <ImpactClient>
            <div className="min-h-screen bg-space-black">
                {/* Hero Section */}
                <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                    <Image
                        src="/images/satellite-network.png"
                        alt="Satellite network"
                        fill
                        className="object-cover opacity-80"
                        quality={85}
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

                {/* Client-driven content (fetches in background) */}
                <ImpactContentClient />
            </div>
        </ImpactClient>
    );
}
