'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const simulateProgress = () => {
    setProgress(0);
    let currentProgress = 0;
    
    progressIntervalRef.current = setInterval(() => {
      // Slower at the beginning, faster in the middle, slower at the end
      const increment = currentProgress < 30 ? 0.5 : 
                        currentProgress < 70 ? 1 : 0.3;
      
      currentProgress = Math.min(currentProgress + increment, 95);
      setProgress(currentProgress);
      
      if (currentProgress >= 95) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, 250);
  };

  const handleResearch = async () => {
    if (!query.trim() || isResearching) return;
    
    setIsResearching(true);
    simulateProgress();
    
    // Set timeout for the entire operation
    const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Research request timed out after 2 minutes")), TIMEOUT_MS);
    });
    
    try {
      // Make sure we're sending a properly formatted query
      const cleanQuery = query.trim();
      console.log('Sending research query:', cleanQuery);
      
      // Race the fetch request against the timeout
      const response = await Promise.race([
        fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: cleanQuery }),
        }),
        timeoutPromise
      ]) as Response;
      
      // Add more detailed error handling
      if (!response.ok) {
        console.error('Research API error status:', response.status, response.statusText);
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('Error response JSON:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const textError = await response.text();
          console.error('Error response text:', textError);
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // Add more logging about the successful response
      console.log('Research API response status:', response.status);
      
      // Safely parse the JSON response
      let result;
      try {
        result = await response.json();
        console.log('Research API response parsed successfully:', {
          hasContent: Boolean(result.content),
          contentLength: result.content?.length || 0,
          sourceCount: result.sources?.length || 0
        });
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        throw new Error('Failed to parse research results');
      }
      
      if (!result || typeof result.content !== 'string') {
        console.error('Invalid research result format:', result);
        throw new Error('The research API returned an invalid result format');
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
      
      // Log content snippet to help with debugging
      console.log('Content snippet:', result.content.substring(0, 100) + '...');
      
      setTimeout(() => {
        // Ensure we're passing a well-formed object to the callback
        const sanitizedResult = {
          content: result.content || '',
          sources: Array.isArray(result.sources) ? result.sources : [],
          searchQueries: Array.isArray(result.searchQueries) ? result.searchQueries : [],
          images: Array.isArray(result.images) ? result.images : []
        };
        
        console.log('Calling onResearchComplete with sanitized result:', {
          contentLength: sanitizedResult.content.length,
          sourcesCount: sanitizedResult.sources.length,
          contentStartsWith: sanitizedResult.content.substring(0, 50) + '...'
        });
        
        onResearchComplete(sanitizedResult);
        setIsResearching(false);
        setProgress(0);
      }, 300);
    } catch (error) {
      console.error('Research failed with error:', error);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(0);
      setIsResearching(false);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred during research';
      
      console.error('Final error message:', errorMessage);
      onError(errorMessage);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleResearch}
        disabled={!query.trim() || isResearching}
        className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          !query.trim() || isResearching 
            ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
        }`}
        title={isResearching ? "Researching..." : "Research this query"}
      >
        {isResearching ? (
          <>
            <FiLoader className="animate-spin mr-2" />
            Researching
          </>
        ) : (
          <>
            <FiSearch className="mr-2" />
            Research
          </>
        )}
      </button>
      
      {isResearching && (
        <div className="absolute left-0 bottom-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-b-md overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
} 