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
 * Format timestamp from seconds to MM:SS format
 */
export function formatTimestamp(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}