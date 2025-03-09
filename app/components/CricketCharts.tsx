'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

/**
 * Data interfaces for cricket charts
 */
export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface RadarChartData {
  subject: string;
  [key: string]: string | number;
}

// Cricket color scheme - representing different teams/metrics
const COLORS = [
  '#1E88E5', // India blue
  '#16A34A', // Pakistan green
  '#FF9800', // Australia gold
  '#B71C1C', // England red
  '#9C27B0', // New Zealand purple
  '#FFD600', // Sri Lanka yellow
  '#00ACC1', // South Africa teal
  '#6D4C41', // West Indies brown
  '#607D8B', // Bangladesh blue-gray
  '#F44336'  // Zimbabwe red
];

// Helper to get color by player name or index
const getColor = (name: string, index: number): string => {
  // Consistent colors for specific teams
  const teamColors: Record<string, string> = {
    'india': '#1E88E5',
    'pakistan': '#16A34A',
    'australia': '#FF9800',
    'england': '#B71C1C',
    'new zealand': '#9C27B0',
    'sri lanka': '#FFD600',
    'south africa': '#00ACC1',
    'west indies': '#6D4C41',
    'bangladesh': '#607D8B',
    'zimbabwe': '#F44336',
    'virat kohli': '#1E88E5',
    'babar azam': '#16A34A',
    'steve smith': '#FF9800',
    'joe root': '#B71C1C',
    'kane williamson': '#9C27B0',
    'rohit sharma': '#6D4C41',
    'david warner': '#F44336'
  };

  // Try to match by player name
  for (const [team, color] of Object.entries(teamColors)) {
    if (name.toLowerCase().includes(team)) {
      return color;
    }
  }

  // Fallback to index-based color
  return COLORS[index % COLORS.length];
};

interface CricketChartProps {
  chartType: 'bar' | 'line' | 'pie' | 'radar';
  data: BarChartData[] | LineChartData[] | PieChartData[] | RadarChartData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  keys?: string[];
  height?: number;
}

const CricketChart: React.FC<CricketChartProps> = ({
  chartType,
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  keys,
  height = 400
}) => {
  if (!data || data.length === 0) return null;

  // Render the appropriate chart based on type
  return (
    <div className="cricket-chart w-full p-4">
      {title && <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' && (
          <BarChart
            data={data as BarChartData[]}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xAxisLabel || '', position: 'insideBottom', offset: -10 }} 
            />
            <YAxis label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {keys ? keys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
            )) : 
            Object.keys(data[0])
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))
            }
          </BarChart>
        )}

        {chartType === 'line' && (
          <LineChart
            data={data as LineChartData[]}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xAxisLabel || '', position: 'insideBottom', offset: -10 }} 
            />
            <YAxis label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {keys ? keys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                activeDot={{ r: 8 }} 
              />
            )) : 
            Object.keys(data[0])
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }} 
                />
              ))
            }
          </LineChart>
        )}

        {chartType === 'pie' && (
          <PieChart>
            <Pie
              data={data as PieChartData[]}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {(data as PieChartData[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}

        {chartType === 'radar' && (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data as RadarChartData[]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            {keys ? keys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={getColor(key, index)}
                fill={getColor(key, index)}
                fillOpacity={0.3}
              />
            )) : 
            Object.keys(data[0])
              .filter(key => key !== 'subject')
              .map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={getColor(key, index)}
                  fill={getColor(key, index)}
                  fillOpacity={0.3}
                />
              ))
            }
            <Legend />
            <Tooltip />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

interface CricketChartGridProps {
  children: React.ReactNode;
}

export const CricketChartGrid: React.FC<CricketChartGridProps> = ({ children }) => {
  return (
    <div className="cricket-chart-grid grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {children}
    </div>
  );
};

export default CricketChart;

// Sample data parsers to help convert API response data to chart-friendly formats

/**
 * Formats player comparison data for radar charts
 * @param data Array of player stats
 * @param metrics Metrics to include in comparison
 * @returns Radar chart formatted data
 */
export const formatPlayerComparisonForRadar = (
  players: any[],
  metrics: string[]
): RadarChartData[] => {
  const radarData: RadarChartData[] = [];
  
  metrics.forEach(metric => {
    const dataPoint: RadarChartData = { subject: metric };
    
    players.forEach(player => {
      dataPoint[player.name] = player[metric.toLowerCase().replace(/\s+/g, '')] || 0;
    });
    
    radarData.push(dataPoint);
  });
  
  return radarData;
};

/**
 * Formats career progression data for line charts
 * @param data Array of period/year stats
 * @param metrics Metrics to track over time
 * @returns Line chart formatted data
 */
export const formatCareerProgressionForLine = (
  data: any[],
  metric: string
): LineChartData[] => {
  // Return the data directly if it's already in the correct format
  return data.map(period => ({
    name: period.period,
    [metric]: period[metric.toLowerCase().replace(/\s+/g, '')]
  }));
};

/**
 * Formats distribution data for pie charts
 * @param data Array of category/value pairs
 * @returns Pie chart formatted data
 */
export const formatDistributionForPie = (
  data: any[]
): PieChartData[] => {
  return data.map(item => ({
    name: item.category,
    value: item.value
  }));
}; 