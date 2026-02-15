'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';

interface LearnClientProps {
    children: React.ReactNode;
}

export default function LearnClient({ children }: LearnClientProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-space-black flex items-center justify-center">
                <Rocket className="w-12 h-12 text-cosmic-purple animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}
