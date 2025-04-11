import { NextRequest, NextResponse } from 'next/server';
import Sentiment from 'sentiment';
import { getVideoTranscript } from '@/lib/transcript-api';

// Initialize the sentiment analyzer
const sentiment = new Sentiment();

// Helper functions for sentiment analysis
function getSentimentColor(score: number): string {
  if (score > 0) {
    // Green with intensity based on score (0-5)
    const intensity = Math.min(Math.abs(score), 5) / 5;
    return `rgba(0, 128, 0, ${0.3 + intensity * 0.7})`;
  } else if (score < 0) {
    // Red with intensity based on score (0-5)
    const intensity = Math.min(Math.abs(score), 5) / 5;
    return `rgba(255, 0, 0, ${0.3 + intensity * 0.7})`;
  } else {
    // Neutral gray
    return 'rgba(128, 128, 128, 0.3)';
  }
}

function getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, videoId } = body;
    
    let id = videoId;
    // If URL is provided but not videoId, extract it
    if (url && !id) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = url.match(regex);
      id = match ? match[1] : null;
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID or URL is required' },
        { status: 400 }
      );
    }
    
    // Get transcript from the transcript API
    const transcriptData = await getVideoTranscript(id);
    
    // Analyze sentiment of each segment
    const analyzedSegments = transcriptData.transcript.map((segment: any) => {
      const sentimentResult = sentiment.analyze(segment.text);
      return {
        ...segment,
        sentiment: {
          score: sentimentResult.score,
          comparative: sentimentResult.comparative,
          positive: sentimentResult.positive,
          negative: sentimentResult.negative,
          neutral: [],
        },
        sentimentLabel: getSentimentLabel(sentimentResult.score),
        color: getSentimentColor(sentimentResult.score),
      };
    });
    
    // Calculate overall sentiment
    const totalScore = analyzedSegments.reduce((sum: number, segment: any) => sum + segment.sentiment.score, 0);
    const totalComparative = analyzedSegments.length > 0 
      ? analyzedSegments.reduce((sum: number, segment: any) => sum + segment.sentiment.comparative, 0) / analyzedSegments.length
      : 0;
        
    const analysis = {
      segments: analyzedSegments,
      videoId: id,
      videoTitle: transcriptData.videoTitle,
      videoDuration: transcriptData.videoDuration,
      overallSentiment: {
        score: totalScore,
        comparative: totalComparative,
        label: getSentimentLabel(totalScore),
      },
    };
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze API:', error);
    
    return NextResponse.json(
      { error: 'Failed to analyze video' },
      { status: 500 }
    );
  }
}