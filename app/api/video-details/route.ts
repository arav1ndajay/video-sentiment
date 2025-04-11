import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    
    // Server-side only: Use ytdl-core to get video info
    const info = await ytdl.getInfo(videoId);
    
    if (!info || !info.videoDetails) {
      return NextResponse.json({ error: 'Failed to get video details' }, { status: 404 });
    }
    
    const videoDetails = {
      id: videoId,
      title: info.videoDetails.title || 'Unknown Title',
      duration: parseInt(info.videoDetails.lengthSeconds) || 0,
      thumbnailUrl: info.videoDetails.thumbnails[0]?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
    
    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error('Error in video-details API:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}