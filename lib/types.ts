export interface TranscriptSegment {
    id: number;
    start: number;
    end: number;
    text: string;
  }
  
  export interface TranscriptResponse {
    transcript: TranscriptSegment[];
    videoId: string;
    videoTitle?: string;
    videoDuration?: number;
  }
  
  export interface SentimentScore {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
    neutral: string[];
  }
  
  export interface SentimentSegment extends TranscriptSegment {
    sentiment: SentimentScore;
    sentimentLabel: 'positive' | 'negative' | 'neutral';
    color: string;
  }
  
  export interface SentimentAnalysisResponse {
    segments: SentimentSegment[];
    videoId: string;
    videoTitle?: string;
    videoDuration?: number;
    overallSentiment: {
      score: number;
      comparative: number;
      label: 'positive' | 'negative' | 'neutral';
    };
  }
  
  export interface VideoDetails {
    id: string;
    title: string;
    duration: number;
    thumbnailUrl: string;
  }
  
  export interface YouTubeVideoData {
    videoId: string;
    videoDetails?: VideoDetails;
    error?: string;
  }