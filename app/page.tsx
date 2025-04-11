"use client";

import { useState } from 'react';
import axios from 'axios';
import { SentimentAnalysisResponse } from '@/lib/types';
import InputForm from './components/InputForm';
import LoadingState from './components/LoadingState';
import AnalysisResults from './components/AnalysisResults';
import { extractVideoId } from '@/lib/youtube-api';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysis, setAnalysis] = useState<SentimentAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (url: string) => {
    try {
      setLoading(true);
      setLoadingStep(1);
      setLoadingMessage('Extracting video information...');
      setError(null);
      setAnalysis(null);
      
      // Extract video ID
      const videoId = extractVideoId(url);
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      
      // Analyze the video
      setLoadingStep(2);
      setLoadingMessage('Extracting transcript and analyzing sentiment...');
      
      const response = await axios.post('/api/analyze', { videoId });
      
      setLoadingStep(3);
      setLoadingMessage('Processing results...');
      
      // Set the analysis results
      setAnalysis(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error analyzing video:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || 'Failed to analyze video');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <InputForm onSubmit={handleSubmit} isLoading={loading} />
      
      {error && (
        <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <LoadingState
          message={loadingMessage}
          step={loadingStep}
          totalSteps={3}
        />
      )}
      
      {analysis && (
        <AnalysisResults analysis={analysis} />
      )}
    </div>
  );
}