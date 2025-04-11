"use client";

interface LoadingStateProps {
  message: string;
  step: number;
  totalSteps: number;
}

export default function LoadingState({ message, step, totalSteps }: LoadingStateProps) {
  const progress = (step / totalSteps) * 100;
  
  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Processing Video</h2>
      
      <div className="flex items-center justify-center mb-4">
        <svg className="animate-spin h-10 w-10 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <p className="text-center text-gray-300 mb-4">{message}</p>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="mt-2 text-center text-sm text-gray-400">
        Step {step} of {totalSteps}
      </p>
      
      <div className="mt-4 text-sm text-gray-400">
        <p className="text-center">Please wait a few seconds!</p>
      </div>
    </div>
  );
}