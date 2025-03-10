'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdOutlineContentCopy, MdDone } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CricketChart from './CricketCharts';
import { findAndParseChartData } from '@/src/lib/utils/chartUtils';

interface ResearchResultsProps {
  content: string;
  className?: string;
  onRegenerate?: () => void;
  loading?: boolean;
  timestamp?: Date;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({
  content,
  className = '',
  onRegenerate,
  loading = false,
  timestamp,
}) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chartData, setChartData] = useState<any>({
    playerComparisons: [],
    careerProgressions: [],
    distributions: []
  });

  // Extract chart data when content changes
  useEffect(() => {
    if (content) {
      const extractedCharts = findAndParseChartData(content);
      setChartData(extractedCharts);
    }
  }, [content]);

  // Clean content by removing the special chart markers while preserving the tables
  const cleanContent = (text: string): string => {
    // Replace chart code blocks with regular markdown tables
    let cleaned = text
      .replace(/```chart:player-comparison\s+/g, '\n\n')
      .replace(/```chart:career-progression\s+/g, '\n\n')
      .replace(/```chart:distribution\s+/g, '\n\n')
      .replace(/```(?!\w+)/g, '\n\n');
    
    // Replace "Chart Insights:" with nothing to avoid duplication
    cleaned = cleaned.replace(/Chart Insights:\s*/g, '');
    
    return cleaned;
  };

  // Process content with charts
  const processedContent = useMemo(() => {
    if (!content) return '';
    return cleanContent(content);
  }, [content]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Count total charts
  const totalCharts = useMemo(() => {
    return (
      chartData.playerComparisons.length + 
      chartData.careerProgressions.length + 
      chartData.distributions.length
    );
  }, [chartData]);

  // Prepare chart components for rendering within the content
  const prepareChartComponents = () => {
    const charts: { id: string; component: React.ReactNode }[] = [];
    
    // Add player comparison radar charts
    if (chartData.playerComparisons && chartData.playerComparisons.length > 0) {
      chartData.playerComparisons.forEach((comparison: any, index: number) => {
        if (!comparison.data || comparison.data.length === 0) return;
        
        // Convert player data to bar chart format
        const barData = comparison.players.map((player: string) => {
          const dataPoint: any = { name: player };
          comparison.metrics.forEach((metric: string) => {
            const key = metric.toLowerCase().replace(/\s+/g, '');
            
            // Find the player data to extract values
            const playerData = comparison.data.find((p: any) => p.name === player);
            if (playerData) {
              dataPoint[metric] = playerData[key] || 0;
            }
          });
          return dataPoint;
        });
        
        const chartId = `player-comparison-${index}`;
        const title = `Player Comparison: ${comparison.players.join(' vs ')}`;
        
        charts.push({
          id: chartId,
          component: (
            <div key={chartId} className="my-6 bg-zinc-900 rounded-lg overflow-hidden">
              <CricketChart
                chartType="bar"
                data={barData}
                title={title}
                height={350}
                insights={comparison.insights}
              />
            </div>
          )
        });
      });
    }
    
    // Add career progression line charts
    if (chartData.careerProgressions && chartData.careerProgressions.length > 0) {
      chartData.careerProgressions.forEach((progression: any, index: number) => {
        if (!progression.data || progression.data.length === 0) return;
        
        progression.metrics.forEach((metric: string, metricIndex: number) => {
          // Convert progression data to line format
          const lineData = progression.data.map((period: any) => ({
            name: period.period,
            [metric]: period[metric.toLowerCase().replace(/\s+/g, '')] || 0
          }));
          
          const chartId = `career-progression-${index}-${metricIndex}`;
          const title = `${metric} Over Time`;
          
          charts.push({
            id: chartId,
            component: (
              <div key={chartId} className="my-6 bg-zinc-900 rounded-lg overflow-hidden">
                <CricketChart
                  chartType="line"
                  data={lineData}
                  title={title}
                  xAxisLabel="Period"
                  yAxisLabel={metric}
                  height={300}
                  insights={progression.insights}
                />
              </div>
            )
          });
        });
      });
    }
    
    // Add distribution pie charts
    if (chartData.distributions && chartData.distributions.length > 0) {
      chartData.distributions.forEach((distribution: any, index: number) => {
        if (!distribution.data || distribution.data.length === 0) return;
        
        // Convert distribution data to pie format
        const pieData = distribution.data.map((item: any) => ({
          name: item.category,
          value: item.value
        }));
        
        const categoryName = distribution.categories && distribution.categories[0] 
          ? distribution.categories[0].split(' ')[0] 
          : 'Distribution';
        
        const chartId = `distribution-${index}`;
        const title = `Distribution: ${categoryName}`;
        
        charts.push({
          id: chartId,
          component: (
            <div key={chartId} className="my-6 bg-zinc-900 rounded-lg overflow-hidden">
              <CricketChart
                chartType="pie"
                data={pieData}
                title={title}
                height={300}
                insights={distribution.insights}
              />
            </div>
          )
        });
      });
    }
    
    return charts;
  };

  return (
    <div className={`relative bg-zinc-900 p-4 rounded-lg overflow-hidden shadow-md ${className}`}>
      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-3">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <span>Research Results</span>
          {collapsed ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2">
          {timestamp && (
            <span className="text-xs text-zinc-500">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
          {totalCharts > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {totalCharts} chart{totalCharts !== 1 ? 's' : ''}
            </span>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              title="Regenerate results"
            >
              <IoMdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <MdDone className="w-4 h-4 text-green-500" /> : <MdOutlineContentCopy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="prose prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-hr:my-4 prose-img:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-2">
          {loading ? (
            <div className="h-6 w-full bg-zinc-800 animate-pulse rounded mb-2"></div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom components for inline chart rendering
                h2: ({ node, children, ...props }: any) => {
                  // Convert children to string to extract title
                  const title = React.Children.toArray(children)
                    .map(child => (typeof child === 'string' ? child : ''))
                    .join('');
                    
                  // Look for chart heading patterns to insert charts before sections
                  const charts = prepareChartComponents();
                  const relevantCharts = charts.filter(chart => {
                    // Logic to match charts with section headings
                    return chart.id.includes(title.toLowerCase().replace(/\s+/g, '-'));
                  });
                  
                  return (
                    <>
                      {relevantCharts.map(chart => chart.component)}
                      <h2 className="text-xl font-bold mt-6 mb-3" {...props}>{children}</h2>
                    </>
                  );
                },
                // Style tables
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-zinc-700" {...props} />
                  </div>
                ),
                // After specific tables, add related charts if available
                tr: ({ node, children, isLastRow, ...props }: any) => {
                  // Only process if this is the last row of a table
                  if (!isLastRow) {
                    return <tr {...props}>{children}</tr>;
                  }
                  
                  const charts = prepareChartComponents();
                  
                  // Convert children to string to check content
                  const rowContent = React.Children.toArray(children)
                    .map(child => (typeof child === 'string' ? child : ''))
                    .join(' ');
                  
                  // If this row contains stats that would benefit from visualization
                  const isPlayerStatsRow = rowContent && 
                    (rowContent.includes('Average') || 
                     rowContent.includes('Strike Rate') || 
                     rowContent.includes('Runs'));
                  
                  const relevantCharts = isPlayerStatsRow ? 
                    charts.filter(chart => chart.id.includes('player-comparison')) : [];
                  
                  return (
                    <>
                      <tr {...props}>{children}</tr>
                      {relevantCharts.length > 0 && relevantCharts[0].component}
                    </>
                  );
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchResults; 