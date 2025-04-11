import axios from 'axios';
import { TranscriptSegment } from '@/lib/types';

export async function getVideoTranscript(videoId: string) {
  // Get video details
  const info = await ytdl.getInfo(videoId, {
    requestOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    },
  });
  
  if (!info || !info.videoDetails) {
     new Error('Failed to get video details');
  }
  
  const videoDetails = {
    id: videoId,
    title: info.videoDetails.title || 'Unknown Title',
    duration: parseInt(info.videoDetails.lengthSeconds) || 0,
  };

  const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer.captionTracks;

  if (!tracks || tracks.length === 0) {
    throw new Error('Failed to get video captions');
  }

  let captionTrack = tracks.find(track => track.languageCode === 'en');
  if (!captionTrack) {
    captionTrack = tracks[0];
  }
  
  // Get captions from youtube
  const captionUrl = captionTrack.baseUrl
  const response = await axios.get(captionUrl);
  const xmlData = response.data;
  const originalSegments = parseXmlCaptions(xmlData);
  const segments = combineSegmentsIntoChunks(originalSegments);

  return {
    transcript: segments,
    videoId,
    videoTitle: videoDetails.title,
    videoDuration: videoDetails.duration,
  };
}

function parseXmlCaptions(xmlData: string) {
  const segments: TranscriptSegment[] = [];
  let id = 0;
  
  // Simple regex-based parsing for <text start="..." dur="...">content</text>
  const regex = /<text start="([\d\.]+)" dur="([\d\.]+)"[^>]*>([\s\S]*?)<\/text>/gi;
  let match;
  
  while ((match = regex.exec(xmlData)) !== null) {
    const start = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const end = start + duration;
    
    // Decode HTML entities in the text
    const text = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    segments.push({
      id: id++,
      start,
      end,
      text,
    });
  }
  
  return segments;
}

function combineSegmentsIntoChunks(originalSegments: TranscriptSegment[]) {
  // First, handle overlapping segments in the input
  const nonOverlappingSegments = [];
  let lastEndTime = -1;
  
  // Sort by start time
  const sortedSegments = [...originalSegments].sort((a, b) => a.start - b.start);
  
  // Process each segment to remove overlaps
  for (const segment of sortedSegments) {
    // If this segment starts before the previous one ended, adjust
    if (segment.start < lastEndTime) {
      // Skip entirely overlapped segments
      if (segment.end <= lastEndTime) {
        continue;
      }
      
      // Partial overlap - trim the start
      nonOverlappingSegments.push({
        start: lastEndTime,
        end: segment.end,
        text: segment.text
      });
    } else {
      // No overlap
      nonOverlappingSegments.push({
        start: segment.start,
        end: segment.end,
        text: segment.text
      });
    }
    
    lastEndTime = Math.max(lastEndTime, segment.end);
  }
  
  // Now combine into chunks, respecting the 10-second guideline
  const CHUNK_DURATION = 10;
  const combinedSegments = [];
  let currentChunk = null;
  let segmentId = 0;
  
  for (const segment of nonOverlappingSegments) {
    // If segment is already longer than 10 seconds, keep as is
    if (segment.end - segment.start > CHUNK_DURATION) {
      if (currentChunk) {
        combinedSegments.push(currentChunk);
        currentChunk = null;
      }
      
      combinedSegments.push({
        id: segmentId++,
        start: segment.start,
        end: segment.end,
        text: segment.text
      });
      continue;
    }
    
    if (!currentChunk) {
      // Start a new chunk
      currentChunk = {
        id: segmentId++,
        start: segment.start,
        end: segment.end,
        text: segment.text
      };
    } 
    // If adding this segment would exceed 10 seconds from the start of the current chunk
    else if (segment.end - currentChunk.start > CHUNK_DURATION) {
      combinedSegments.push(currentChunk);
      currentChunk = {
        id: segmentId++,
        start: segment.start,
        end: segment.end,
        text: segment.text
      };
    } 
    // We can combine with the current chunk
    else {
      currentChunk.text += " " + segment.text;
      currentChunk.end = segment.end;
    }
  }
  
  // Add the last chunk if there is one
  if (currentChunk) {
    combinedSegments.push(currentChunk);
  }
  
  return combinedSegments;
}
