import axios from 'axios';
import { TranscriptResponse } from './types';
import { getVideoDetails } from './youtube-api';

/**
 * Get transcript from YouTube video using API
 */
export async function getTranscriptFromVideo(videoId: string): Promise<TranscriptResponse> {
  try {
    // Get video details first
    const videoDetails = await getVideoDetails(videoId);
    
    if (!videoDetails) {
      throw new Error('Could not fetch video details');
    }
    
    // Use the transcript API to get the transcript
    const response = await axios.post('/api/transcript', { videoId });
    
    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to get transcript');
    }
    
    // Add video details to the transcript response
    return {
      ...response.data,
      videoTitle: videoDetails.title,
      videoDuration: videoDetails.duration,
    };
  } catch (error) {
    console.error('Error getting transcript:', error);
    throw new Error('Failed to get transcript from video');
  }
}