'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const TOTAL_FRAMES = 120; // Match your generated frame count
const FRAME_PATH = '/frames';

export default function HeroCanvasAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const frameIndex = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    // Lazy-load frames on-demand instead of preloading all 120
    useEffect(() => {
        // Load only initial frames (first 20), rest load on-demand
        const loadInitialFrames = async () => {
            const initialBatch = Array.from({ length: Math.min(20, TOTAL_FRAMES) }, (_, i) => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image();
                    img.src = `${FRAME_PATH}/frame_${i}.webp`;
                    img.onload = () => {
                        setLoadProgress((prev) => Math.min(prev + (100 / 20), 100));
                        resolve(img);
                    };
                    img.onerror = () => {
                        const placeholderImg = new Image();
                        placeholderImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect width="1920" height="1080" fill="%230A0E27"/%3E%3C/svg%3E';
                        placeholderImg.onload = () => {
                            setLoadProgress((prev) => Math.min(prev + (100 / 20), 100));
                            resolve(placeholderImg);
                        };
                    };
                });
            });
            const loadedInitial = await Promise.all(initialBatch);
            setImages(loadedInitial);
            setImagesLoaded(true);
            
            // Load remaining frames in background
            for (let i = 20; i < TOTAL_FRAMES; i++) {
                const img = new Image();
                img.src = `${FRAME_PATH}/frame_${i}.webp`;
                img.onload = () => {
                    setImages((prev) => {
                        const updated = [...prev];
                        updated[i] = img;
                        return updated;
                    });
                };
            }
        };
        loadInitialFrames();
    }, []);

    // Render canvas
    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderFrame = () => {
            const currentFrame = Math.round(frameIndex.get());
            const img = images[Math.max(0, Math.min(currentFrame, TOTAL_FRAMES - 1))];

            if (img) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
        };

        const unsubscribe = frameIndex.on('change', renderFrame);
        renderFrame();

        const handleResize = () => renderFrame();
        window.addEventListener('resize', handleResize);

        return () => {
            unsubscribe();
            window.removeEventListener('resize', handleResize);
        };
    }, [imagesLoaded, images, frameIndex]);

    // Text overlays with fade in/out
    const section1Opacity = useTransform(smoothProgress, [0, 0.15, 0.25, 0.3], [0, 1, 1, 0]);
    const section2Opacity = useTransform(smoothProgress, [0.35, 0.45, 0.55, 0.6], [0, 1, 1, 0]);
    const section3Opacity = useTransform(smoothProgress, [0.65, 0.75, 0.85, 0.9], [0, 1, 1, 0]);

    if (!imagesLoaded) {
        return (
            <div className="fixed inset-0 bg-space-black flex flex-col items-center justify-center z-50">
                <div className="w-64 h-2 bg-space-gray-700 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cosmic-purple to-galaxy-cyan"
                        initial={{ width: '0%' }}
                        animate={{ width: `${loadProgress}%` }}
                    />
                </div>
                <p className="text-star-white/70 text-lg font-display">Loading AstroView... {Math.round(loadProgress)}%</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative h-[500vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Text Overlays */}
                <div className="absolute inset-0 pointer-events-none flex items-center">
                    <div className="w-full max-w-7xl mx-auto px-8 lg:px-16">

                        {/* Section 1 */}
                        <motion.div style={{ opacity: section1Opacity }} className="mb-8">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-star-white font-display mb-4 leading-tight">
                                Explore the<br />Universe
                            </h1>
                            <p className="text-xl md:text-2xl text-space-gray-300 max-w-xl">
                                Real-time space data, simplified for everyone
                            </p>
                        </motion.div>

                        {/* Section 2 */}
                        <motion.div style={{ opacity: section2Opacity }} className="mb-8">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-star-white font-display mb-4 leading-tight">
                                Never Miss a<br />Sky Event
                            </h2>
                            <p className="text-lg md:text-xl text-space-gray-300 max-w-xl">
                                Location-based alerts for meteor showers, eclipses, and satellite passes
                            </p>
                        </motion.div>

                        {/* Section 3 */}
                        <motion.div style={{ opacity: section3Opacity }}>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-star-white font-display mb-6 leading-tight">
                                See Space<br />Impact Earth
                            </h2>
                            <p className="text-lg md:text-xl text-space-gray-300 mb-8 max-w-xl">
                                Discover how satellites monitor climate, agriculture, and disasters
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-full text-lg font-semibold shadow-2xl pointer-events-auto transition-all hover:shadow-cosmic-purple/50"
                            >
                                Start Exploring →
                            </motion.button>
                        </motion.div>

                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: scrollYProgress.get() > 0.1 ? 0 : 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-6 h-10 border-2 border-star-white/40 rounded-full flex items-start justify-center p-2"
                    >
                        <div className="w-1 h-3 bg-star-white/60 rounded-full" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
