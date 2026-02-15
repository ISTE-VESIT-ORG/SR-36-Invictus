import { apodRepo } from '../firebase/apodRepo';

const NASA_API_KEY =
  typeof process !== 'undefined'
    ? process.env.NASA_API_KEY || process.env.NEXT_PUBLIC_NASA_API_KEY
    : '';

export interface ApodData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

/**
 * Fetch NASA Astronomy Picture of the Day (APOD)
 * Implements 24-hour TTL caching via Firestore
 */
export async function getApod(date?: string): Promise<ApodData | null> {
  try {
    // Use today's date if not specified
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check cache first
    const cached = await apodRepo.getByDate(targetDate);
    if (cached) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[APOD Service] Using cached data for ${targetDate}`);
      }
      return {
        date: cached.date,
        title: cached.title,
        explanation: cached.explanation,
        url: cached.url,
        hdurl: cached.hdurl,
        media_type: cached.media_type,
        copyright: cached.copyright,
      };
    }

    // Fetch from NASA API
    if (!NASA_API_KEY) {
      console.error('[APOD Service] NASA_API_KEY not configured');
      return null;
    }

    const apiUrl = date
      ? `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`
      : `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[APOD Service] Fetching from NASA API for ${targetDate}`);
    }

    const response = await fetch(apiUrl, {
      next: { revalidate: 0 }, // Don't use Next.js cache, we handle it ourselves
    });

    if (!response.ok) {
      console.error(`[APOD Service] API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Validate response
    if (!data.title || !data.url) {
      console.error('[APOD Service] Invalid API response', data);
      return null;
    }

    const apodData: ApodData = {
      date: data.date,
      title: data.title,
      explanation: data.explanation,
      url: data.url,
      hdurl: data.hdurl,
      media_type: data.media_type || 'image',
      copyright: data.copyright,
    };

    // Save to cache (fire and forget)
    apodRepo.saveCache(apodData).catch((err) => {
      console.error('[APOD Service] Failed to cache data:', err);
    });

    return apodData;
  } catch (error) {
    console.error('[APOD Service] Error fetching APOD:', error);
    return null;
  }
}

/**
 * Get a truncated version of the explanation (for preview)
 */
export function getTruncatedExplanation(explanation: string, maxLines: number = 3): string {
  const words = explanation.split(' ');
  const wordsPerLine = 15; // Approximate
  const maxWords = wordsPerLine * maxLines;
  
  if (words.length <= maxWords) {
    return explanation;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Get YouTube video ID from APOD video URL
 */
export function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}
