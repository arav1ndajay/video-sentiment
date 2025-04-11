"use client";

import { useState } from 'react';
import { SentimentSegment } from '@/lib/types';
import { formatTimestamp } from '@/lib/youtube-api';

interface TranscriptViewerProps {
  segments: SentimentSegment[];
  onTimestampClick: (time: number) => void;
}

export default function TranscriptViewer({ segments, onTimestampClick }: TranscriptViewerProps) {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  
  const filteredSegments = segments.filter(segment => {
    if (filter === 'all') return true;
    return segment.sentimentLabel === filter;
  });
  
  return (
    <div className="bg-gray-800 shadow rounded-lg p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-white">Transcripts</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-gray-600 font-medium text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${filter === 'positive' ? 'bg-green-800 font-medium text-green-200' : 'bg-green-900 bg-opacity-50 hover:bg-green-800 text-green-300'}`}
            onClick={() => setFilter('positive')}
          >
            Positive
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${filter === 'negative' ? 'bg-red-800 font-medium text-red-200' : 'bg-red-900 bg-opacity-50 hover:bg-red-800 text-red-300'}`}
            onClick={() => setFilter('negative')}
          >
            Negative
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${filter === 'neutral' ? 'bg-blue-800 font-medium text-blue-200' : 'bg-blue-900 bg-opacity-50 hover:bg-blue-800 text-blue-300'}`}
            onClick={() => setFilter('neutral')}
          >
            Neutral
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-96 pr-2">
        {filteredSegments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No transcript segments match the selected filter.</p>
        ) : (
          <div className="space-y-4">
            {filteredSegments.map((segment) => (
              <div 
                key={segment.id}
                className={`p-3 rounded-lg ${
                  segment.sentimentLabel === 'positive' ? 'sentiment-positive' :
                  segment.sentimentLabel === 'negative' ? 'sentiment-negative' :
                  'sentiment-neutral'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span 
                    className="timestamp font-medium"
                    onClick={() => onTimestampClick(segment.start)}
                  >
                    {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
                  </span>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      segment.sentimentLabel === 'positive' ? 'bg-green-900 bg-opacity-50 text-green-300' :
                      segment.sentimentLabel === 'negative' ? 'bg-red-900 bg-opacity-50 text-red-300' :
                      'bg-blue-900 bg-opacity-50 text-blue-200'
                    }`}
                  >
                    {segment.sentiment.score > 0 ? '+' : ''}{segment.sentiment.score.toFixed(1)}
                  </span>
                </div>
                <p className="text-gray-300">{segment.text}</p>
                
                {(segment.sentiment.positive.length > 0 || segment.sentiment.negative.length > 0) && (
                  <div className="mt-2 text-xs">
                    {segment.sentiment.positive.length > 0 && (
                      <div className="inline-flex items-center mr-2">
                        <span className="text-green-400 font-medium mr-1">Positive:</span>
                        <span className="text-gray-300">{segment.sentiment.positive.join(', ')}</span>
                      </div>
                    )}
                    {segment.sentiment.negative.length > 0 && (
                      <div className="inline-flex items-center">
                        <span className="text-red-400 font-medium mr-1">Negative:</span>
                        <span className="text-gray-300">{segment.sentiment.negative.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}