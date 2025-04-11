"use client";

import { useState } from 'react';
import { SentimentAnalysisResponse } from '@/lib/types';
import { formatTimestamp } from '@/lib/youtube-api';
import VideoPlayer from './VideoPlayer';
import TranscriptViewer from './TranscriptViewer';
import AnalysisChart from './AnalysisChart';

interface AnalysisResultsProps {
  analysis: SentimentAnalysisResponse;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chart'>('transcript');
  
  const getTopSegments = (analysis: SentimentAnalysisResponse, count: number = 3) => {
    const positiveSegments = [...analysis.segments]
      .filter(s => s.sentiment.score > 0)
      .sort((a, b) => b.sentiment.score - a.sentiment.score)
      .slice(0, count);
      
    const negativeSegments = [...analysis.segments]
      .filter(s => s.sentiment.score < 0)
      .sort((a, b) => a.sentiment.score - b.sentiment.score)
      .slice(0, count);
      
    return {
      positive: positiveSegments,
      negative: negativeSegments,
    };
  };
  
  const topSegments = getTopSegments(analysis);
  
  const handleTimestampClick = (time: number) => {
    setCurrentTimestamp(time);
  };
  
  return (
    <div className="space-y-6 pb-8">
      {/* Title section */}
      <div className="border-b border-gray-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Analysis of {analysis.videoTitle}</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <VideoPlayer
          videoId={analysis.videoId}
          title={analysis.videoTitle}
          timestamp={currentTimestamp}
        />
        
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Sentiment Summary</h2>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-200">Overall Sentiment:</h3>
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.overallSentiment.label === 'positive' ? 'bg-green-900 bg-opacity-50 text-green-300' :
                  analysis.overallSentiment.label === 'negative' ? 'bg-red-900 bg-opacity-50 text-red-300' :
                  'bg-gray-700 text-gray-300'
                }`}
              >
                {analysis.overallSentiment.label.charAt(0).toUpperCase() + analysis.overallSentiment.label.slice(1)}
                {' '}({(analysis.overallSentiment.comparative * 100).toFixed(0)}%)
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${
                  analysis.overallSentiment.label === 'positive' ? 'bg-green-500' :
                  analysis.overallSentiment.label === 'negative' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}
                style={{ width: `${Math.abs(analysis.overallSentiment.comparative) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-300">Positive</p>
                <p className="text-xl font-bold text-green-400">
                  {(analysis.segments.filter(s => s.sentimentLabel === 'positive').length / analysis.segments.length * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-300">Neutral</p>
                <p className="text-xl font-bold text-gray-300">
                  {(analysis.segments.filter(s => s.sentimentLabel === 'neutral').length / analysis.segments.length * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-300">Negative</p>
                <p className="text-xl font-bold text-red-400">
                  {(analysis.segments.filter(s => s.sentimentLabel === 'negative').length / analysis.segments.length * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">Key Segments</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-400 mb-1">Most Positive</h4>
                {topSegments.positive.length > 0 ? (
                  <div className="space-y-2">
                    {topSegments.positive.map((segment) => (
                      <div key={segment.id} className="bg-green-900 bg-opacity-20 p-2 rounded-lg border border-green-800">
                        <p 
                          className="text-sm font-medium text-blue-400 cursor-pointer hover:underline"
                          onClick={() => handleTimestampClick(segment.start)}
                        >
                          {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}: {segment.sentiment.score.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-300 line-clamp-2">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No positive segments found</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-red-400 mb-1">Most Negative</h4>
                {topSegments.negative.length > 0 ? (
                  <div className="space-y-2">
                    {topSegments.negative.map((segment) => (
                      <div key={segment.id} className="bg-red-900 bg-opacity-20 p-2 rounded-lg border border-red-800">
                        <p 
                          className="text-sm font-medium text-blue-400 cursor-pointer hover:underline"
                          onClick={() => handleTimestampClick(segment.start)}
                        >
                          {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}: {segment.sentiment.score.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-300 line-clamp-2">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No negative segments found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for switching between Transcript and Chart */}
      <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-700">
          <nav className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'transcript' ? 'bg-blue-900 bg-opacity-50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('transcript')}
            >
              Full Transcript
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'chart' ? 'bg-blue-900 bg-opacity-50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('chart')}
            >
              Sentiment Chart
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {activeTab === 'transcript' ? (
            <TranscriptViewer
              segments={analysis.segments}
              onTimestampClick={handleTimestampClick}
            />
          ) : (
            <AnalysisChart
              segments={analysis.segments}
              onSegmentClick={handleTimestampClick}
            />
          )}
        </div>
      </div>
      
      {/* Footer info */}
      <div className="text-center text-gray-400 text-sm mt-8">
        <p>Analysis completed on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}