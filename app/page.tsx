import dynamic from 'next/dynamic';

const AnimatedHero = dynamic(() => import('@/components/hero/AnimatedHero').then((m) => m.default), {
    ssr: false,
    loading: () => null,
});
import { ApodSection } from '@/components/apod/ApodSection';
import HomeAuthSections from '@/components/home/HomeAuthSections';

interface ApodData {
    date: string;
    title: string;
    explanation: string;
    url: string;
    hdurl?: string;
    media_type: 'image' | 'video';
    copyright?: string;
}

export default async function Home() {
    let apodData: ApodData | null = null;
    let apodError: string | null = null;

    try {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        const response = await fetch(new URL('/api/apod', base), { next: { revalidate: 86400 } });
        if (!response.ok) throw new Error('Failed to fetch APOD');
        apodData = await response.json();
    } catch (error) {
        console.error('Error fetching APOD on server:', error);
        apodError = "Unable to load today's space image";
    }

    return (
        <main className="bg-space-black min-h-screen">
            <AnimatedHero />

            {/* Auth-dependent UI moved to client component to keep this page a server component */}
            <HomeAuthSections />

            <ApodSection apodData={apodData} loading={false} error={apodError} />
        </main>
    );
}
