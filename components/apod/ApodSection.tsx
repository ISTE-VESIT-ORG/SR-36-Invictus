'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, ExternalLink, PlayCircle } from 'lucide-react';
import { useState } from 'react';

export interface ApodData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

interface ApodSectionProps {
  apodData: ApodData | null;
  loading?: boolean;
  error?: string;
}

export function ApodSection({ apodData, loading = false, error }: ApodSectionProps) {
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Truncate explanation
  const getTruncatedExplanation = (text: string, maxWords: number = 45) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative z-10 py-20 px-8 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-space-gray-800 rounded w-64 mb-8 mx-auto"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-video bg-space-gray-800 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-space-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-space-gray-800 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-space-gray-800 rounded"></div>
                  <div className="h-4 bg-space-gray-800 rounded"></div>
                  <div className="h-4 bg-space-gray-800 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !apodData) {
    return (
      <section className="relative z-10 py-20 px-8 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-space-gray-400">
            {error || 'Unable to load today\'s space image. Please try again later.'}
          </p>
        </div>
      </section>
    );
  }

  // Get YouTube thumbnail if it's a video
  const getYouTubeThumbnail = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = null;
      
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const isVideo = apodData.media_type === 'video';
  const thumbnailUrl = isVideo ? getYouTubeThumbnail(apodData.url) : null;
  const displayUrl = thumbnailUrl || apodData.url;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative z-10 py-20 px-8 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-4">
            <span className="bg-gradient-to-r from-cosmic-purple via-nebula-pink to-aurora-green bg-clip-text text-transparent">
              Today From Space
            </span>
          </h2>
          <p className="text-space-gray-400 text-lg">NASA's Astronomy Picture of the Day</p>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          {/* Image/Video */}
          <div className="relative group">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-space-gray-900 border border-space-gray-700 shadow-2xl">
              <Image
                src={displayUrl}
                alt={apodData.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Video overlay */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <PlayCircle className="w-20 h-20 text-white drop-shadow-2xl" />
                </div>
              )}
              
              {/* Copyright badge */}
              {apodData.copyright && (
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs text-space-gray-300">
                  © {apodData.copyright}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Date & Source */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-cosmic-purple">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(apodData.date)}</span>
              </div>
              <div className="px-3 py-1 bg-space-gray-800 border border-space-gray-700 rounded-full text-space-gray-300 text-xs">
                NASA
              </div>
            </div>

            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-bold text-star-white font-display leading-tight">
              {apodData.title}
            </h3>

            {/* Explanation */}
            <div className="space-y-3">
              <p className="text-space-gray-300 text-lg leading-relaxed">
                {showFullExplanation 
                  ? apodData.explanation 
                  : getTruncatedExplanation(apodData.explanation)}
              </p>
              
              {apodData.explanation.split(' ').length > 45 && (
                <button
                  onClick={() => setShowFullExplanation(!showFullExplanation)}
                  className="text-cosmic-purple hover:text-nebula-pink transition-colors text-sm font-semibold"
                >
                  {showFullExplanation ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* CTA Button */}
            <motion.a
              href={isVideo ? apodData.url : apodData.hdurl || apodData.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-full font-semibold shadow-lg hover:shadow-cosmic-purple/50 transition-all"
            >
              {isVideo ? 'Watch Video' : 'View Full Image'}
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
