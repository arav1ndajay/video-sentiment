import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `${videoId}.mp3`);
    
    try {
      // Get audio stream from YouTube
      const audioStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
        filter: 'audioonly',
        quality: 'lowestaudio',
      });
      
      // Create a write stream to the temporary file
      const fileWriteStream = fs.createWriteStream(tempFilePath);
      
      // Use pipeline to handle the stream properly
      await pipeline(audioStream, fileWriteStream);
      
      // Return the path to the audio file
      return NextResponse.json({ 
        success: true, 
        filePath: tempFilePath 
      });
    } catch (error) {
      console.error('Error downloading audio:', error);
      
      // Clean up
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      return NextResponse.json({ 
        error: 'Failed to download audio' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in download-audio API:', error);
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}