import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Video, Award, Users } from 'lucide-react';
import LearnClient from './LearnClient';

export default function LearnPage() {
    const learningModules = [
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

    return (
        <LearnClient>
            <div className="min-h-screen bg-space-black pt-24 pb-16">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/solar-system.png"
                    alt="Solar system"
                    fill
                    className="object-cover opacity-20"
                    quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-space-black via-space-black/80 to-space-black" />
            </div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-star-white font-display mb-4">
                        Learn About Space
                    </h1>
                    <p className="text-xl text-space-gray-300 max-w-2xl mx-auto">
                        Interactive lessons, 3D visualizations, and educational content for all ages.
                    </p>
                </div>

                {/* Learning Paths */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-xl p-4 text-center">
                        <BookOpen className="w-8 h-8 text-cosmic-purple mx-auto mb-2" />
                        <div className="text-2xl font-bold text-star-white mb-1">150+</div>
                        <div className="text-sm text-space-gray-400">Lessons</div>
                    </div>
                    <div className="bg-galaxy-cyan/10 border border-galaxy-cyan/30 rounded-xl p-4 text-center">
                        <Video className="w-8 h-8 text-galaxy-cyan mx-auto mb-2" />
                        <div className="text-2xl font-bold text-star-white mb-1">50+</div>
                        <div className="text-sm text-space-gray-400">Videos</div>
                    </div>
                    <div className="bg-aurora-green/10 border border-aurora-green/30 rounded-xl p-4 text-center">
                        <Award className="w-8 h-8 text-aurora-green mx-auto mb-2" />
                        <div className="text-2xl font-bold text-star-white mb-1">25</div>
                        <div className="text-sm text-space-gray-400">Certificates</div>
                    </div>
                    <div className="bg-nebula-pink/10 border border-nebula-pink/30 rounded-xl p-4 text-center">
                        <Users className="w-8 h-8 text-nebula-pink mx-auto mb-2" />
                        <div className="text-2xl font-bold text-star-white mb-1">10K+</div>
                        <div className="text-sm text-space-gray-400">Students</div>
                    </div>
                </div>

                {/* Learning Modules */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {learningModules.map((module, i) => (
                        <div
                            key={i}
                            className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl p-6 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-5xl mb-3">{module.icon}</div>
                                    <h3 className="text-2xl font-bold text-star-white font-display mb-2">
                                        {module.title}
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple rounded-full text-xs font-semibold">
                                            {module.level}
                                        </span>
                                        <span className="px-3 py-1 bg-space-gray-800 text-space-gray-300 rounded-full text-xs font-semibold">
                                            {module.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-space-gray-300 mb-4">
                                {module.description}
                            </p>

                            <div className="mb-4">
                                <p className="text-xs text-space-gray-500 mb-2">Topics Covered:</p>
                                <div className="flex flex-wrap gap-2">
                                    {module.topics.map((topic, j) => (
                                        <span
                                            key={j}
                                            className="px-2 py-1 bg-space-gray-800 text-space-gray-300 rounded text-xs"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href={`/learn/${module.id}`}
                                className="w-full py-2 px-4 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-lg font-semibold text-sm transition-colors block text-center"
                            >
                                Start Learning →
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Virtual Tour Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 mb-12 border border-white/10 group">
                    <div className="absolute inset-0 bg-[url('/images/solar-system.png')] opacity-30 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-purple/30 text-cosmic-purple text-xs font-semibold mb-4 border border-cosmic-purple/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cosmic-purple opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cosmic-purple"></span>
                                </span>
                                New Feature
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
                                Virtual Solar System Tour
                            </h2>
                            <p className="text-space-gray-300 text-lg mb-0">
                                Embark on an immersive journey through our celestial neighborhood. Explore planets, moons, and stars in a fully interactive experience.
                            </p>
                        </div>

                        <a
                            href="/learn/solar-tour"
                            className="px-8 py-4 bg-white text-space-black rounded-full font-bold hover:bg-space-gray-100 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 whitespace-nowrap"
                        >
                            Start Tour 🚀
                        </a>
                    </div>
                </div>

                {/* Interactive Tools */}
                <div className="bg-gradient-to-br from-space-gray-900 to-space-gray-800 border border-space-gray-700 rounded-2xl p-8">
                    <h2 className="text-3xl font-bold text-star-white font-display mb-6 text-center">
                        Interactive Learning Tools
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-space-gray-800/50 rounded-xl p-6 text-center">
                            <div className="text-4xl mb-3">🌍</div>
                            <h3 className="text-lg font-bold text-star-white mb-2">3D Solar System</h3>
                            <p className="text-sm text-space-gray-400 mb-4">
                                Explore planets in 3D with real-time positions
                            </p>
                            <button className="text-cosmic-purple hover:text-cosmic-purple/80 text-sm font-semibold">
                                Launch Tool →
                            </button>
                        </div>

                        <div className="bg-space-gray-800/50 rounded-xl p-6 text-center">
                            <div className="text-4xl mb-3">⭐</div>
                            <h3 className="text-lg font-bold text-star-white mb-2">Sky Map</h3>
                            <p className="text-sm text-space-gray-400 mb-4">
                                Identify constellations and stars in real-time
                            </p>
                            <button className="text-cosmic-purple hover:text-cosmic-purple/80 text-sm font-semibold">
                                Launch Tool →
                            </button>
                        </div>

                        <div className="bg-space-gray-800/50 rounded-xl p-6 text-center">
                            <div className="text-4xl mb-3">🎮</div>
                            <h3 className="text-lg font-bold text-star-white mb-2">Space Quizzes</h3>
                            <p className="text-sm text-space-gray-400 mb-4">
                                Test your knowledge with fun quizzes
                            </p>
                            <button className="text-cosmic-purple hover:text-cosmic-purple/80 text-sm font-semibold">
                                Start Quiz →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </LearnClient>
    );
}
