import axios from 'axios';
import { TranscriptSegment } from '@/lib/types';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function getVideoTranscript(videoId: string) {
  try {
    console.log(await chromium.executablePath())
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin'),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Get video title
    const videoTitle = await page.evaluate(() => {
      const titleElement = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer');
      return titleElement ? titleElement.textContent?.trim() : 'Unknown Title';
    });

    // Get video duration
    const videoDuration = await page.evaluate(() => {
      // Look for the video duration in the player
      const videoElement = document.querySelector('video');
      if (videoElement && !isNaN(videoElement.duration)) {
        return Math.ceil(videoElement.duration);
      }
      
      // Alternative: try to find it in the page metadata
      const scriptTags = Array.from(document.querySelectorAll('script'));
      for (const script of scriptTags) {
        const content = script.textContent;
        if (content && content.includes('"lengthSeconds"')) {
          const match = content.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
          if (match && match[1]) {
            return parseInt(match[1]);
          }
        }
      }
      
      return 0;
    });

    // Extract caption track URL
    const captionUrl = await page.evaluate(() => {
      // First look for caption tracks in the page source
      const scriptTags = Array.from(document.querySelectorAll('script'));
      for (const script of scriptTags) {
        const content = script.textContent;
        if (content && content.includes('"captionTracks"')) {
          const match = content.match(/"captionTracks"\s*:\s*\[\s*{\s*"baseUrl"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            return match[1].replace(/\\u0026/g, '&');
          }
        }
      }
      return null;
    });

    if (!captionUrl) {
      await browser.close();
      throw new Error('Caption url not found!');
    }

    // const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    // const response = await axios.get(videoUrl);
    // const pageHtml = response.data;
    
    // const titleMatch = pageHtml.match(/<title>([^<]*)<\/title>/);
    // const videoTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';
    
    // let videoDuration = 0;
    // const durationMatch = pageHtml.match(/\"lengthSeconds\":\"(\d+)\"/);
    // if (durationMatch && durationMatch[1]) {
    //   videoDuration = parseInt(durationMatch[1]);
    // }
    
    // let captionUrl = '';
    // const timedTextMatch = pageHtml.match(/\"captionTracks\":\[\{\"baseUrl\":\"([^\"]+)\"/);
    
    // if (timedTextMatch && timedTextMatch[1]) {
    //   captionUrl = timedTextMatch[1].replace(/\\u0026/g, '&');
    // } else {
    //   throw new Error('Failed to find caption URL in the page' + videoDuration + videoTitle);
    // }
    
    const captionResponse = await axios.get(captionUrl);
    const xmlData = captionResponse.data;
    const originalSegments = parseXmlCaptions(xmlData);
    const segments = combineSegmentsIntoChunks(originalSegments);
    
    // if (videoDuration === 0 && segments.length > 0) {
    //   videoDuration = Math.ceil(segments[segments.length - 1].end);
    // }
    
    await browser.close();

    return {
      transcript: segments,
      videoId,
      videoTitle,
      videoDuration,
    };
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    throw new Error('Failed to get video transcript');
  }
}

function parseXmlCaptions(xmlData: string) {
  const segments: TranscriptSegment[] = [];
  let id = 0;
  
  // Regex-based parsing for <text start="..." dur="...">content</text>
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
