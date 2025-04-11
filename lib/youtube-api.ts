import axios from 'axios';
import { VideoDetails, YouTubeVideoData } from './types';

/**
 * Extract video ID from a YouTube URL
 */
export function extractVideoId(url: string): string | null {
  try {
    // Handle various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

/**
 * Validate if the URL is a valid YouTube video URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  try {
    const videoId = extractVideoId(url);
    return videoId !== null;
  } catch (error) {
    console.error(error)
    return false;
  }
}

/**
 * Get video details through server action
 */
export async function getVideoDetails(videoId: string): Promise<VideoDetails | null> {
  try {
    // For client-side, we'll use the API endpoint approach
    const response = await axios.get(`/api/video-details?videoId=${videoId}`);
    
    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to fetch video details');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return {
      id: videoId,
      title: `YouTube Video (${videoId})`,
      duration: 0,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}

/**
 * Process a YouTube URL and extract relevant information
 */
export async function processYouTubeUrl(url: string): Promise<YouTubeVideoData> {
  try {
    if (!isValidYouTubeUrl(url)) {
      return { 
        videoId: '',
        error: 'Invalid YouTube URL' 
      };
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return { 
        videoId: '',
        error: 'Could not extract video ID' 
      };
    }
    
    const videoDetails = await getVideoDetails(videoId);
    
    if (!videoDetails) {
      return { 
        videoId,
        error: 'Could not fetch video details' 
      };
    }
    
    return { 
      videoId,
      videoDetails
    };
  } catch (error) {
    console.error('Error processing YouTube URL:', error);
    return { 
      videoId: '',
      error: 'Failed to process YouTube URL' 
    };
  }
}

/**
 * Format timestamp from seconds to MM:SS format
 */
export function formatTimestamp(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}