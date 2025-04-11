"use client";

import { useState, FormEvent } from 'react';
import { isValidYouTubeUrl } from '@/lib/youtube-api';

interface InputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate URL
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    
    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    // Submit URL for analysis
    onSubmit(url);
  };
  
  return (
    <div className="bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Enter a YouTube Product Review Video URL
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-300 mb-1">
            YouTube URL
          </label>
          <input
            type="text"
            id="youtube-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
            required
          />
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}
        
        <div className="mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Sentiment'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>This tool will:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Extract the transcript from the YouTube video</li>
          <li>Analyze the sentiment for each timestamp in the transcript</li>
          <li>Create a fun visual report of the sentiment analysis</li>
        </ol>
      </div>
    </div>
  );
}