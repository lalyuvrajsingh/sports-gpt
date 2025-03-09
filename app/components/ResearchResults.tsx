'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdOutlineContentCopy, MdDone } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';
import { ResearchResponse } from '@/src/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CricketChart, { CricketChartGrid } from './CricketCharts';
import { findAndParseChartData, formatPlayerComparisonForRadar, formatCareerProgressionForLine, formatDistributionForPie } from '@/src/lib/utils/chartUtils';

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
  const [showCharts, setShowCharts] = useState(true);
  const [chartData, setChartData] = useState<any>({
    playerComparisons: [],
    careerProgressions: [],
    distributions: []
  });

  // Clean content by removing the special chart markers while preserving the tables
  const cleanContent = (text: string): string => {
    // Replace chart code blocks with regular markdown tables
    let cleaned = text
      .replace(/```chart:player-comparison\s+/g, '\n\n')
      .replace(/```chart:career-progression\s+/g, '\n\n')
      .replace(/```chart:distribution\s+/g, '\n\n')
      .replace(/```(?!\w+)/g, '\n\n');
    
    return cleaned;
  };

  // Process content with charts
  const processedContent = useMemo(() => {
    if (!content) return '';
    return cleanContent(content);
  }, [content]);

  // Extract chart data when content changes
  useEffect(() => {
    if (content) {
      const extractedCharts = findAndParseChartData(content);
      setChartData(extractedCharts);
    }
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

  // Render charts based on extracted data
  const renderCharts = () => {
    const chartElements: React.ReactNode[] = [];
    
    // Add player comparison radar charts
    if (chartData.playerComparisons && Array.isArray(chartData.playerComparisons)) {
      chartData.playerComparisons.forEach((comparison: any, index: number) => {
        // Convert player data to radar format
        const radarData = comparison.data.map((player: any) => {
          const dataPoint: any = { subject: player.name };
          comparison.metrics.forEach((metric: string) => {
            const key = metric.toLowerCase().replace(/\s+/g, '');
            dataPoint[player.name] = player[key] || 0;
          });
          return dataPoint;
        });
        
        chartElements.push(
          <CricketChart
            key={`player-comparison-${index}`}
            chartType="radar"
            data={radarData}
            title={`Player Comparison: ${comparison.players.join(' vs ')}`}
            keys={comparison.players}
            height={350}
          />
        );
      });
    }
    
    // Add career progression line charts
    if (chartData.careerProgressions && Array.isArray(chartData.careerProgressions)) {
      chartData.careerProgressions.forEach((progression: any, index: number) => {
        progression.metrics.forEach((metric: string, metricIndex: number) => {
          // Convert progression data to line format
          const lineData = progression.data.map((period: any) => ({
            name: period.period,
            [metric]: period[metric.toLowerCase().replace(/\s+/g, '')] || 0
          }));
          
          chartElements.push(
            <CricketChart
              key={`career-progression-${index}-${metricIndex}`}
              chartType="line"
              data={lineData}
              title={`${metric} Over Time`}
              xAxisLabel="Period"
              yAxisLabel={metric}
              height={300}
            />
          );
        });
      });
    }
    
    // Add distribution pie charts
    if (chartData.distributions && Array.isArray(chartData.distributions)) {
      chartData.distributions.forEach((distribution: any, index: number) => {
        // Convert distribution data to pie format
        const pieData = distribution.data.map((item: any) => ({
          name: item.category,
          value: item.value
        }));
        
        chartElements.push(
          <CricketChart
            key={`distribution-${index}`}
            chartType="pie"
            data={pieData}
            title={`Distribution: ${distribution.categories[0].split(' ')[0]}`}
            height={300}
          />
        );
      });
    }
    
    return chartElements.length > 0 ? (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Data Visualizations</h3>
          <button 
            className="text-sm text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
        
        {showCharts && (
          <CricketChartGrid>
            {chartElements}
          </CricketChartGrid>
        )}
      </div>
    ) : null;
  };

  return (
    <div className={`relative bg-zinc-900 p-4 rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center mb-3">
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
        <>
          {/* Visualizations section */}
          {renderCharts()}
          
          {/* Markdown content */}
          <div className="prose prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-hr:my-4 prose-img:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-2">
            {loading ? (
              <div className="h-6 w-full bg-zinc-800 animate-pulse rounded mb-2"></div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              >
                {processedContent}
              </ReactMarkdown>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResearchResults; 