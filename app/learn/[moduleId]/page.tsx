'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen, Clock, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

interface LearningModule {
    id: string;
    title: string;
    icon: string;
    level: string;
    duration: string;
    topics: string[];
    description: string;
}

const learningModules: LearningModule[] = [
    {
        id: 'solar-system-basics',
        title: 'Solar System Basics',
        icon: '🪐',
        level: 'Beginner',
        duration: '30 min',
        topics: ['Planets', 'Moons', 'Asteroids', 'Comets'],
        description: 'Explore our cosmic neighborhood and learn about each planet.',
    },
    {
        id: 'satellite-technology',
        title: 'Satellite Technology',
        icon: '🛰️',
        level: 'Intermediate',
        duration: '45 min',
        topics: ['Orbits', 'Communication', 'GPS', 'Imaging'],
        description: 'Understand how satellites work and their applications.',
    },
    {
        id: 'space-exploration-history',
        title: 'Space Exploration History',
        icon: '🚀',
        level: 'Beginner',
        duration: '1 hour',
        topics: ['Apollo', 'ISS', 'Mars Rovers', 'Future Missions'],
        description: 'Journey through humanity\'s greatest space achievements.',
    },
    {
        id: 'astrophysics-fundamentals',
        title: 'Astrophysics Fundamentals',
        icon: '⭐',
        level: 'Advanced',
        duration: '2 hours',
        topics: ['Stars', 'Galaxies', 'Black Holes', 'Dark Matter'],
        description: 'Dive deep into the physics of the universe.',
    },
];

export default function ModulePage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const moduleId = params?.moduleId as string;
    const module = learningModules.find(m => m.id === moduleId);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!module) {
            setError('Module not found');
            setLoading(false);
            return;
        }

        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/learning-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        moduleTitle: module.title,
                        topics: module.topics,
                        level: module.level,
                    }),
                });
                if (!response.ok) {
                    const text = await response.text().catch(() => null);
                    console.error('API returned error', response.status, text);
                    throw new Error(`Failed to fetch content: ${response.status} ${text || ''}`);
                }

                const data = await response.json();
                setContent(data.content);
            } catch (err) {
                console.error('Error fetching content:', err);
                setError('Failed to load learning content. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [module]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-space-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cosmic-purple animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    if (!module) {
        return (
            <div className="min-h-screen bg-space-black pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-star-white mb-4">Module Not Found</h1>
                        <button
                            onClick={() => router.push('/learn')}
                            className="text-cosmic-purple hover:text-cosmic-purple/80 flex items-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Learning
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-space-black pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/learn')}
                        className="text-cosmic-purple hover:text-cosmic-purple/80 flex items-center gap-2 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Learning
                    </button>

                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-2xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="text-6xl">{module.icon}</div>
                            <div className="flex-1">
                                <h1 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-3">
                                    {module.title}
                                </h1>
                                <p className="text-space-gray-300 text-lg mb-4">
                                    {module.description}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-cosmic-purple/20 text-cosmic-purple rounded-full text-sm font-semibold">
                                        <Award className="w-4 h-4" />
                                        {module.level}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-space-gray-800 text-space-gray-300 rounded-full text-sm font-semibold">
                                        <Clock className="w-4 h-4" />
                                        {module.duration}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-space-gray-800 text-space-gray-300 rounded-full text-sm font-semibold">
                                        <BookOpen className="w-4 h-4" />
                                        {module.topics.length} Topics
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-space-gray-700">
                            <p className="text-xs text-space-gray-500 mb-2">Topics Covered:</p>
                            <div className="flex flex-wrap gap-2">
                                {module.topics.map((topic, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-space-gray-800 text-space-gray-300 rounded-lg text-sm"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-2xl p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-12 h-12 text-cosmic-purple animate-spin mb-4" />
                            <p className="text-space-gray-400">Generating personalized learning content...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-lg font-semibold transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-lg max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => (
                                        <h1 className="text-3xl font-bold text-star-white mb-4 mt-8" {...props} />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2 className="text-2xl font-bold text-star-white mb-3 mt-6" {...props} />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3 className="text-xl font-bold text-space-gray-200 mb-2 mt-4" {...props} />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="text-space-gray-300 mb-4 leading-relaxed" {...props} />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul className="list-disc list-inside text-space-gray-300 mb-4 space-y-2" {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol className="list-decimal list-inside text-space-gray-300 mb-4 space-y-2" {...props} />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li className="text-space-gray-300" {...props} />
                                    ),
                                    strong: ({ node, ...props }) => (
                                        <strong className="text-star-white font-semibold" {...props} />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote className="border-l-4 border-cosmic-purple pl-4 italic text-space-gray-400 my-4" {...props} />
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => router.push('/learn')}
                        className="flex-1 py-3 px-6 bg-space-gray-800 hover:bg-space-gray-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Back to All Modules
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 px-6 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-lg font-semibold transition-colors"
                    >
                        Save as PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
