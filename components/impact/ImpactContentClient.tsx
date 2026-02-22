'use client';

import { useEffect, useState } from 'react';
import { EventGrid } from '@/components/events/EventGrid';
import { Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface AgricultureSummary {
  totalAreaAcres: number;
  avgVegetationHealth: number;
  activeZones: number;
  cacheAgeHours?: number;
}

export default function ImpactContentClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDisasters, setActiveDisasters] = useState<any[]>([]);
  const [agricultureSummary, setAgricultureSummary] = useState<AgricultureSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/impact/summary');
        if (!res.ok) throw new Error('Failed to load impact summary');
        const data = await res.json();
        if (!mounted) return;
        setActiveDisasters(data.activeDisasters || []);
        setAgricultureSummary(data.agricultureSummary || null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center text-space-gray-400">Loading impact data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center text-red-500">{error}</div>
      </div>
    );
  }

  // Minimal rendering similar to previous server page but client-driven
  const disasterStats = activeDisasters.length > 0 ? [`${activeDisasters.length} Active Events`] : ['No recent events'];
  const agricultureStats = agricultureSummary ? [
    `${agricultureSummary.totalAreaAcres.toLocaleString()} Acres`,
    `${agricultureSummary.avgVegetationHealth}% Health`,
    `${agricultureSummary.activeZones} Active Zones`,
  ] : ['No data', 'No data', 'No data'];

  const impactShowcase = [
    {
      title: 'Agriculture Monitoring',
      image: '/images/agriculture-monitoring.png',
      icon: <Droplets className="w-8 h-8 text-aurora-green" />,
      stats: agricultureStats,
      description: 'Satellites monitor crop health, soil moisture, and predict yields using multispectral imaging.',
      link: '/impact/agriculture-monitoring'
    },
    {
      title: 'Disaster Response',
      image: '/images/wildfire-monitoring.png',
      icon: <AlertTriangle className="w-8 h-8 text-meteor-orange" />,
      stats: disasterStats,
      description: 'Real-time tracking of wildfires, floods, and earthquakes to coordinate emergency response.',
      link: '/impact/disaster-response'
    },
  ];

  return (
    <div className="py-16 px-8 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {impactShowcase.map((item, i) => (
            <div key={i} className="group relative bg-space-gray-900 border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] flex flex-col">
              <div className="relative h-64 w-full bg-space-black">
                <img src={item.image} alt={item.title} className="object-cover w-full h-full opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-space-gray-900 via-space-gray-900/60 to-transparent" />
                <div className="absolute top-4 left-4 p-3 rounded-xl bg-space-black/80 backdrop-blur-sm">{item.icon}</div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-star-white font-display mb-3">{item.title}</h3>
                <p className="text-space-gray-300 mb-6 flex-grow">{item.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {item.stats.map((s: string, idx: number) => (
                    <div key={idx} className="bg-space-gray-800/80 border border-space-gray-700 rounded-lg p-3 text-center flex items-center justify-center min-h-[60px]">
                      <p className="text-sm font-bold text-star-white">{s}</p>
                    </div>
                  ))}
                </div>
                <Link href={item.link} className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors text-center block">Learn More →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
