"use client";

import { SentimentSegment } from '@/lib/types';
import { formatTimestamp } from '@/lib/youtube-api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';

interface AnalysisChartProps {
  segments: SentimentSegment[];
  onSegmentClick: (time: number) => void;
}

// Custom tooltip for sentiment charts
const SentimentTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const segment = payload[0].payload;
    return (
      <div className="bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-600 max-w-xs">
        <p className="font-medium text-white">{formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}</p>
        <p className="text-gray-300 mt-1 mb-1 text-sm line-clamp-2">{segment.text}</p>
        <p className="text-white">
          <span className="font-medium">Score:</span> {segment.sentiment.score.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
};

export default function AnalysisChart({ segments, onSegmentClick }: AnalysisChartProps) {
  // Create full chart data for desktop
  const fullChartData = segments.map((segment) => ({
    ...segment,
    start: segment.start,
    end: segment.end,
    startFormatted: formatTimestamp(segment.start),
    score: segment.sentiment.score,
    comparative: segment.sentiment.comparative,
  }));
  
  // Get key segments for mobile charts (only significant sentiment points)
  const getKeySegments = () => {
    // Include first and last segments for context
    const first = segments[0];
    const last = segments[segments.length - 1];
    
    // Get top positive and negative segments
    const significantPositive = [...segments]
      .filter(s => s.sentiment.score > 2) // Only strong positive sentiment
      .sort((a, b) => b.sentiment.score - a.sentiment.score)
      .slice(0, 5);
      
    const significantNegative = [...segments]
      .filter(s => s.sentiment.score < -1) // Only strong negative sentiment
      .sort((a, b) => a.sentiment.score - b.sentiment.score)
      .slice(0, 5);
    
    // Additional segments for context (one every ~15% of the way through)
    const contextSegments = [];
    const totalDuration = last.end - first.start;
    for (let i = 1; i < 6; i++) {
      const targetTime = first.start + (totalDuration * (i / 6));
      const closest = segments.reduce((prev, curr) => 
        Math.abs(curr.start - targetTime) < Math.abs(prev.start - targetTime) ? curr : prev
      );
      contextSegments.push(closest);
    }
    
    // Combine all segments and remove duplicates
    const combined = [first, ...significantPositive, ...significantNegative, ...contextSegments, last];
    const uniqueSegments = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // Sort by timestamp
    return uniqueSegments.sort((a, b) => a.start - b.start).map(segment => ({
      ...segment,
      start: segment.start,
      end: segment.end,
      startFormatted: formatTimestamp(segment.start),
      score: segment.sentiment.score,
      comparative: segment.sentiment.comparative,
    }));
  };
  
  const keyChartData = getKeySegments();
  
  // Function to handle bar click
  const handleBarClick = (data: any) => {
    if (data && data.start !== undefined) {
      onSegmentClick(data.start);
    }
  };

  // Get color based on sentiment score
  const getBarColor = (score: number) => {
    if (score > 0) return "#4ade80"; // Green for positive
    if (score < 0) return "#f87171"; // Red for negative
    return "#94a3b8";               // Gray for neutral
  };
  
  return (
    <div className="bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Sentiment Analysis Over Time</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2 text-gray-200">Raw Sentiment Score</h3>
        
        {/* Mobile view - simplified chart */}
        <div className="block sm:hidden">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={keyChartData}
                margin={{ top: 20, right: 10, left: 15, bottom: 40 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="startFormatted" 
                  height={40}
                  label={{ value: 'Timestamp', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  tick={{ fill: '#9CA3AF' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickMargin={10}
                />
                <YAxis 
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', offset: -5, fill: '#9CA3AF', dy: 90 }} 
                  domain={['auto', 'auto']}
                  tick={{ fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  width={40}
                />
                <Tooltip content={<SentimentTooltip />} wrapperStyle={{ outline: 'none' }} />
                <ReferenceLine y={0} stroke="#6B7280" />
                <Bar 
                  dataKey="score" 
                  onClick={handleBarClick}
                  cursor="pointer"
                  isAnimationActive={false}
                  radius={[3, 3, 0, 0]}
                >
                  {keyChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getBarColor(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Desktop view - full chart */}
        <div className="hidden sm:block">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={fullChartData}
                margin={{ top: 20, right: 10, left: 15, bottom: 40 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="startFormatted" 
                  height={40}
                  label={{ value: 'Timestamp', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  tick={{ fill: '#9CA3AF' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickMargin={10}
                />
                <YAxis 
                  label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft', offset: -5, fill: '#9CA3AF', dy: 90 }} 
                  domain={['auto', 'auto']}
                  tick={{ fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  width={50}
                />
                <Tooltip content={<SentimentTooltip />} wrapperStyle={{ outline: 'none' }} />
                <ReferenceLine y={0} stroke="#6B7280" />
                <Bar 
                  dataKey="score" 
                  onClick={handleBarClick}
                  cursor="pointer"
                  isAnimationActive={false}
                  radius={[3, 3, 0, 0]}
                >
                  {fullChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getBarColor(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-200">Sentiment Trend</h3>
        
        {/* Mobile view - simplified chart */}
        <div className="block sm:hidden">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={keyChartData}
                margin={{ top: 20, right: 10, left: 15, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="startFormatted" 
                  height={40}
                  label={{ value: 'Timestamp', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  tick={{ fill: '#9CA3AF' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickMargin={10}
                />
                <YAxis 
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', offset: -5, fill: '#9CA3AF', dy: 90 }} 
                  domain={['auto', 'auto']}
                  tick={{ fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  width={40}
                />
                <Tooltip content={<SentimentTooltip />} wrapperStyle={{ outline: 'none' }} />
                <ReferenceLine y={0} stroke="#6B7280" />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a78bfa" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#a78bfa" }}
                  activeDot={{ r: 5, onClick: (data: any) => handleBarClick(data.payload) }}
                  name="Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="comparative" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#4ade80" }}
                  activeDot={{ r: 5, onClick: (data: any) => handleBarClick(data.payload) }}
                  name="Comparative"
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ 
                    paddingTop: "10px"
                  }}
                  formatter={(value) => <span style={{ color: "#E5E7EB" }}>{value}</span>}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-gray-400 text-xs text-center mt-2">
            Showing key sentiment points. Use landscape mode for full detail.
        </p>
        </div>
        
        {/* Desktop view - full chart */}
        <div className="hidden sm:block">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={fullChartData}
                margin={{ top: 20, right: 10, left: 15, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="startFormatted" 
                  height={40}
                  label={{ value: 'Timestamp', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  tick={{ fill: '#9CA3AF' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickMargin={10}
                />
                <YAxis 
                  label={{ value: 'Sentiment', angle: -90, position: 'insideLeft', offset: -5, fill: '#9CA3AF', dy: 90 }} 
                  domain={['auto', 'auto']}
                  tick={{ fill: '#9CA3AF' }}
                  stroke="#4B5563"
                  width={50}
                />
                <Tooltip content={<SentimentTooltip />} wrapperStyle={{ outline: 'none' }} />
                <ReferenceLine y={0} stroke="#6B7280" />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a78bfa" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#a78bfa" }}
                  activeDot={{ r: 5, onClick: (data: any) => handleBarClick(data.payload) }}
                  name="Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="comparative" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#4ade80" }}
                  activeDot={{ r: 5, onClick: (data: any) => handleBarClick(data.payload) }}
                  name="Comparative"
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ 
                    paddingTop: "10px"
                  }}
                  formatter={(value) => <span style={{ color: "#E5E7EB" }}>{value}</span>}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}