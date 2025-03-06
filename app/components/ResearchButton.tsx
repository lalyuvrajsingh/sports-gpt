'use client';

import { useState } from 'react';
import { FiSearch, FiLoader } from 'react-icons/fi';

interface ResearchButtonProps {
  query: string;
  onResearchComplete: (result: {
    content: string;
    sources: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
    searchQueries?: string[];
  }) => void;
  onError: (error: string) => void;
}

/**
 * Research Button component that initiates deep web research using Perplexity Sonar API
 */
export default function ResearchButton({ 
  query, 
  onResearchComplete, 
  onError 
}: ResearchButtonProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  
  // Progress simulation for better UX
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 2;
      if (progress > 95) {
        progress = 95;
        clearInterval(interval);
      }
      setResearchProgress(Math.min(progress, 95));
    }, 800);
    
    return interval;
  };

  const handleResearch = async () => {
    if (!query.trim() || isResearching) return;
    
    setIsResearching(true);
    setResearchProgress(0);
    const progressInterval = simulateProgress();
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to conduct research');
      }
      
      setResearchProgress(100);
      const result = await response.json();
      onResearchComplete(result);
    } catch (error) {
      console.error('Research failed:', error);
      onError(error instanceof Error ? error.message : 'Failed to conduct research');
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleResearch}
        disabled={isResearching || !query.trim()}
        className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl shadow-lg ${
          isResearching || !query.trim()
            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700/50'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/20 transition-all duration-300'
        }`}
        title="Conduct deep web research on this topic"
      >
        {isResearching ? (
          <>
            <FiLoader className="animate-spin" size={18} />
            <span className="font-medium">Researching...</span>
          </>
        ) : (
          <>
            <FiSearch size={18} />
            <span className="font-medium">Deep Research</span>
          </>
        )}
      </button>
      
      {/* Progress indicator */}
      {isResearching && (
        <div className="absolute left-0 right-0 -bottom-1 bg-zinc-700/50 h-1 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 rounded-full"
            style={{ width: `${researchProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
} 