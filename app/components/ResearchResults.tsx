'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiExternalLink, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchResultsProps {
  content: string;
  sources: Source[];
  images?: any[]; // Keep this for compatibility but won't use it
  searchQueries?: string[];
  query: string;
}

/**
 * Component to display structured research results from Perplexity Sonar
 */
export default function ResearchResults({ 
  content, 
  sources = [], // Ensure sources has a default value
  images = [],
  searchQueries = [],
  query = ''
}: ResearchResultsProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const [showRawContent, setShowRawContent] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Helper to extract domain from URL
  const getDomain = (url: string) => {
    try {
      const domainMatch = url?.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
      return domainMatch ? domainMatch[1] : url;
    } catch (e) {
      return url || '';
    }
  };
  
  const visibleSources = showAllSources ? sources : (sources || []).slice(0, 3);
  
  // Filter content to remove <think> tags
  const cleanContent = (rawContent: string) => {
    if (!rawContent) return '';
    
    try {
      // Remove <think>...</think> sections which are internal instructions
      const thinkRegex = /<think>[\s\S]*?<\/think>/;
      return rawContent.replace(thinkRegex, '').trim();
    } catch (e) {
      console.error('Error cleaning content:', e);
      return rawContent;
    }
  };
  
  if (!content || content.trim() === '') {
    return (
      <div className="w-full p-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-300">No research content available.</p>
      </div>
    );
  }
  
  const processedContent = cleanContent(content);
  
  return (
    <div className="w-full">
      {/* Debug toggle */}
      <div className="w-full flex justify-end mb-2">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded flex items-center gap-1"
        >
          <FiInfo size={12} /> {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
        
        <button 
          onClick={() => setShowRawContent(!showRawContent)}
          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded ml-2"
        >
          {showRawContent ? 'Show Formatted' : 'Show Raw'}
        </button>
      </div>
      
      {/* Debug Info */}
      {showDebug && (
        <div className="w-full p-4 mb-4 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs font-mono">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <ul>
            <li>Content Length: {content?.length || 0} characters</li>
            <li>Processed Content Length: {processedContent?.length || 0} characters</li>
            <li>Sources: {sources?.length || 0}</li>
            <li>Query: {query || 'N/A'}</li>
          </ul>
        </div>
      )}
      
      {/* Main Content */}
      <div className="w-full">
        {showRawContent ? (
          <div className="prose dark:prose-invert w-full max-w-none border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <h2 className="text-xl font-bold mb-4">Raw Research Results</h2>
            <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-auto">
              {processedContent}
            </pre>
          </div>
        ) : (
          <div className="prose dark:prose-invert w-full max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-5 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 pl-6 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded border border-zinc-200 dark:border-zinc-700">
                    <table className="cricket-stats-table w-full">{children}</table>
                  </div>
                ),
                code: ({ node, className, children, ...props }) => {
                  // Check if this is an inline code block based on the parent node
                  const isInline = !className && !props.hasOwnProperty('data-language');
                  
                  if (isInline) {
                    return <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">{children}</code>;
                  }
                  return (
                    <div className="relative mt-4 mb-6">
                      <pre className="p-4 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-auto">
                        <code className={className} {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                }
              }}
            >
              {processedContent || ""}
            </ReactMarkdown>
          </div>
        )}
        
        {/* Sources Panel - Always show this section even when there are no sources */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setShowSourcePanel(!showSourcePanel)}
              className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sources {sources && sources.length > 0 ? `(${sources.length})` : '(0)'}
              {showSourcePanel ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>
            
            {sources && sources.length > 3 && showSourcePanel && (
              <button
                onClick={() => setShowAllSources(!showAllSources)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                {showAllSources ? 'Show less' : 'View all sources'}
              </button>
            )}
          </div>
          
          {showSourcePanel && (
            <div className="space-y-4">
              {visibleSources && visibleSources.length > 0 ? (
                visibleSources.map((source, index) => (
                  <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium line-clamp-1 text-zinc-900 dark:text-zinc-100">
                        {source.title}
                      </h3>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <FiExternalLink size={16} />
                      </a>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      {getDomain(source.url)}
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                      {source.snippet}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-500 dark:text-zinc-400 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  No sources were provided for this research. The content was generated based on the model's knowledge.
                </div>
              )}
              
              {!showAllSources && sources && sources.length > 3 && (
                <button
                  onClick={() => setShowAllSources(true)}
                  className="w-full py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
                >
                  View {sources.length - 3} more sources
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 