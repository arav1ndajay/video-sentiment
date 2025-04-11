import { TranscriptSegment } from '@/lib/types';
import axios from 'axios';

import { Innertube } from 'youtubei.js';

export async function getVideoTranscript(videoId: string) {
  try {
    // Initialize the Innertube client
    const youtube = await Innertube.create();
    
    // Get video info
    const video = await youtube.getInfo(videoId);
    
    const videoTitle = video.basic_info.title || 'Unknown Title';
    const videoDuration = video.basic_info.duration || 0;
    const captions = video.captions;

    console.log(captions);
    const captionTrack = captions?.caption_tracks;

    if (!captionTrack){
      throw new Error('Caption url not found');
    }

    const captionUrl = captionTrack[0].base_url
    
    // Convert transcript format
    // const originalSegments = transcriptList.map((item, index) => ({
    //   id: index,
    //   start: item.start,
    //   end: item.start + item.duration,
    //   text: item.text
    // }));
    const captionResponse = await axios.get(captionUrl);
    const xmlData = captionResponse.data;
    const originalSegments = parseXmlCaptions(xmlData);
    
    // Combine segments into chunks
    const segments = combineSegmentsIntoChunks(originalSegments);
    
    return {
      transcript: segments,
      videoId,
      videoTitle,
      videoDuration,
    };
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    throw new Error('Failed to get video transcript: ' + (error));
  }
}

// export async function getVideoTranscript(videoId: string) {
//   try {
//     const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
//     // Create temporary directory if it doesn't exist
//     // const tmpDir = path.join('/tmp', 'yt-transcripts');
//     // if (!fs.existsSync(tmpDir)) {
//     //   fs.mkdirSync(tmpDir, { recursive: true });
//     // }
    
//     const ytDlpPath = await getYtDlpPath();
//     const youtubeDl = create(ytDlpPath);
    
//     // // Generate a unique filename
//     // const outputFile = path.join(tmpDir, `${videoId}.vtt`);
    
//     // Get video info including title and duration
//     const videoInfo = await youtubeDl(videoUrl, {
//       skipDownload: true,
//       dumpSingleJson: true,
//     });
    
//     const videoTitle = videoInfo.title || 'Unknown Title';
//     const videoDuration = videoInfo.duration || 0;
//     const captions = videoInfo.automatic_captions

//     // Download only the English subtitles/captions
//     // const result = await youtubeDl(videoUrl, {
//     //   skipDownload: true,        // Don't download the video
//     //   writeSub: true,            // Write subtitle file
//     //   writeAutoSub: true,        // Write auto-generated subtitles if available
//     //   subLang: 'en',             // English subtitles
//     //   subFormat: 'vtt',          // VTT format
//     //   output: outputFile,        // Output file
//     //   noWarnings: true,          // Suppress warnings
//     // });
    
//     // // Read the subtitle file
//     // const vttContent = fs.readFileSync(outputFile, 'utf-8');
//     // Parse the VTT file into segments
//     // const originalSegments = parseVttCaptions(vttContent);

//     const captionUrl = captions["en"].find(x => x.ext == "srv1")?.url; 
//     if(!captionUrl ){
//       throw new Error("Caption url not found.")
//     }
//     const captionResponse = await axios.get(captionUrl);
//     const xmlData = captionResponse.data;
//     const originalSegments = parseXmlCaptions(xmlData);
//     // Combine segments into chunks, reusing your existing function
//     const segments = combineSegmentsIntoChunks(originalSegments);
    
//     // try {
//     //   fs.unlinkSync(outputFile);
//     // } catch (e) {
//     //   console.warn('Failed to delete temporary file:', e);
//     // }
    
//     return {
//       transcript: segments,
//       videoId,
//       videoTitle,
//       videoDuration,
//     };
//   } catch (error) {
//     console.error('Error fetching video transcript:', error);
//     throw new Error('Failed to get video transcript' + error);
//   }
// }

// async function getYtDlpPath() {
//   const platform = process.platform;
  
//   let binaryName = platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
//   let downloadUrl;
  
//   if (platform === 'win32') {
//     downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
//   } else if (platform === 'darwin') { // macOS
//     downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';
//     binaryName = 'yt-dlp_macos';
//   } else { // Linux and others
//     downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
//   }
  
//   const binDir = '/tmp/bin';
//   const binPath = path.join(binDir, binaryName);

//   // If file exists, return
//   if (fs.existsSync(binPath)) {
//     return binPath;
//   }
  
//   // Create bin directory if it doesn't exist
//   if (!fs.existsSync(binDir)) {
//     fs.mkdirSync(binDir, { recursive: true });
//   }
  
//   // Always download a fresh copy of yt-dlp
//   console.log(`Downloading yt-dlp from ${downloadUrl} to ${binPath}`);
  
//   try {
//     // Download the binary
//     const response = await axios({
//       method: 'GET',
//       url: downloadUrl,
//       responseType: 'arraybuffer'
//     });
    
//     // Write the binary to disk
//     fs.writeFileSync(binPath, Buffer.from(response.data));
    
//     // Make it executable (except on Windows)
//     if (platform !== 'win32') {
//       fs.chmodSync(binPath, 0o755); // rwxr-xr-x permissions
//     }
    
//     console.log(`yt-dlp binary saved and made executable at ${binPath}`);
//     return binPath;
//   } catch (error) {
//     console.error('Failed to download or save yt-dlp:', error);
//     throw new Error(`Failed to prepare yt-dlp: ${error}`);
//   }
// }

// function parseVttCaptions(vttContent: string): TranscriptSegment[] {
//   const segments: TranscriptSegment[] = [];
//   let id = 0;
  
//   // Regular expression to match VTT cue blocks
//   const cueRegex = /(\d+:\d+:\d+\.\d+) --> (\d+:\d+:\d+\.\d+)(?:.*\n)+?([\s\S]*?)(?:\n\n|$)/g;
  
//   let match;
//   while ((match = cueRegex.exec(vttContent)) !== null) {
//     // Parse the timestamps (HH:MM:SS.sss format)
//     const startTime = parseVttTimestamp(match[1]);
//     const endTime = parseVttTimestamp(match[2]);
    
//     // Clean up the text
//     const text = match[3].trim()
//       .replace(/<[^>]*>/g, '') // Remove HTML-like tags
//       .replace(/\n/g, ' ')     // Replace newlines with spaces
//       .trim();
    
//     if (text) {
//       segments.push({
//         id: id++,
//         start: startTime,
//         end: endTime,
//         text,
//       });
//     }
//   }
  
//   return segments;
// }

// function parseVttTimestamp(timestamp: string): number {
//   // Format: HH:MM:SS.sss
//   const parts = timestamp.split(':');
//   const hours = parseInt(parts[0], 10);
//   const minutes = parseInt(parts[1], 10);
//   const seconds = parseFloat(parts[2]);
  
//   return hours * 3600 + minutes * 60 + seconds;
// }


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
