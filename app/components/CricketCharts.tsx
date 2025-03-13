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
  Cell
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

// Cricket color scheme - team colors that work well on dark backgrounds
const COLORS = [
  '#3498db', // Blue
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#e74c3c', // Red
  '#9b59b6', // Purple
  '#f1c40f', // Yellow
  '#1abc9c', // Teal
  '#e67e22', // Dark orange
  '#95a5a6', // Gray
  '#34495e'  // Dark blue
];

interface CricketChartProps {
  chartType: 'bar' | 'line' | 'pie';
  data: BarChartData[] | LineChartData[] | PieChartData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  keys?: string[];
  height?: number;
  insights?: string;
}

const CricketChart: React.FC<CricketChartProps> = ({
  chartType,
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  keys,
  height = 300,
  insights
}) => {
  if (!data || data.length === 0) return null;

  // Create a custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 p-2 rounded-md border border-zinc-700">
          <p className="text-white text-sm font-medium">{label}</p>
          <div className="mt-1">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center mt-1 text-sm">
                <div 
                  className="w-2 h-2 rounded-full mr-1.5" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-zinc-300">{item.name}: </span>
                <span className="text-white font-medium ml-1">
                  {typeof item.value === 'number' ? 
                    item.value.toLocaleString(undefined, { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 2 
                    }) : 
                    item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Render the appropriate chart based on type
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-base font-semibold text-center mb-2 text-zinc-200">{title}</h3>
      )}
      
      {chartType === 'bar' && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data as BarChartData[]}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
            <XAxis 
              dataKey="name" 
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 0, fill: '#aaa' } : undefined}
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: '#666' }}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left', fill: '#aaa' } : undefined}
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 5, fontSize: 12 }}
            />
            {keys ? keys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={COLORS[index % COLORS.length]}
                radius={[2, 2, 0, 0]}
              />
            )) : 
            Object.keys(data[0])
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))
            }
          </BarChart>
        </ResponsiveContainer>
      )}

      {chartType === 'line' && (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data as LineChartData[]}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="name" 
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 0, fill: '#aaa' } : undefined}
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: '#666' }}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left', fill: '#aaa' } : undefined}
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 5, fontSize: 12 }}
            />
            {keys ? keys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS[index % COLORS.length], stroke: '#fff', strokeWidth: 1 }}
                activeDot={{ r: 6 }}
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
                  strokeWidth={2}
                  dot={{ r: 4, fill: COLORS[index % COLORS.length], stroke: '#fff', strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              ))
            }
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartType === 'pie' && (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data as PieChartData[]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              dataKey="value"
            >
              {(data as PieChartData[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 5, fontSize: 12 }}
              layout="horizontal"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      
      {/* Simple insight box */}
      {insights && (
        <div className="mt-2 p-2 text-xs text-zinc-300 bg-zinc-800/50 border-l-2 border-blue-500 rounded">
          {insights}
        </div>
      )}
    </div>
  );
};

export default CricketChart; 