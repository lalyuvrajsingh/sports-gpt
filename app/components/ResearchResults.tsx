'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiExternalLink, FiChevronDown, FiChevronUp, FiInfo, FiLink, FiClock, FiArrowRight, FiEdit, FiCheckCircle, FiClipboard, FiImage } from 'react-icons/fi';

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
 * Component to display structured research results in a Perplexity-like format
 */
export default function ResearchResults({ 
  content, 
  sources = [], // Ensure sources has a default value
  images = [],
  searchQueries = [],
  query = ''
}: ResearchResultsProps) {
  const [showRawContent, setShowRawContent] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);
  
  // Helper to extract domain from URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch (e) {
      return url;
    }
  };
  
  // Format a timestamp for now to mimic Perplexity's "last updated" display
  const formattedTimestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  // Move cleanContent function before its usage in useMemo
  const cleanContent = (rawContent: string) => {
    // Remove <think> tags and their contents
    return rawContent.replace(/<think>[\s\S]*?<\/think>/g, '');
  };
  
  const processedContent = useMemo(() => {
    return cleanContent(content);
  }, [content]);
  
  const handleCopySnippet = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedSnippet(index);
        setTimeout(() => setCopiedSnippet(null), 3000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };
  
  const visibleSources = showSources ? sources : (sources || []).slice(0, 3);
  
  const renderContent = () => {
    return (
      <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Style table to be more readable
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-zinc-700" {...props} />
              </div>
            ),
            // Style headings
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-4 mb-2" {...props} />,
            // Style paragraphs
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
            // Style code blocks
            pre: ({ node, ...props }) => (
              <pre className="bg-zinc-800 rounded-lg p-3 my-4 overflow-x-auto" {...props} />
            ),
            // Style inline code
            code: ({ node, className, children, ...props }) => {
              // Check if it's inline code by testing if it has a className
              const isInline = !className?.includes('language-');
              return isInline ? (
                <code className="bg-zinc-800 rounded px-1 py-0.5 text-sm" {...props}>
                  {children}
                </code>
              ) : (
                <code {...props}>{children}</code>
              );
            },
            // Better link handling
            a: ({href, children}) => {
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:underline inline-flex items-center"
                >
                  {children}
                  <FiExternalLink className="ml-1 inline-block" size={12} />
                </a>
              );
            },
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };
  
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-xl w-full">
      {/* Header with controls */}
      <div className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSources(!showSources)}
            className="text-sm flex items-center gap-1 text-gray-400 hover:text-white"
          >
            <FiLink size={14} />
            <span>{showSources ? 'Hide' : 'Show'} Sources</span>
            {showSources ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
          
          {/* Only show debug controls if there's debug info */}
          {searchQueries && searchQueries.length > 0 && (
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm flex items-center gap-1 text-gray-400 hover:text-white"
            >
              <FiInfo size={14} />
              <span>{showDebug ? 'Hide' : 'Show'} Debug</span>
              {showDebug ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
          )}
          
          <button 
            onClick={() => setShowRawContent(!showRawContent)}
            className="text-sm flex items-center gap-1 text-gray-400 hover:text-white"
          >
            <FiEdit size={14} />
            <span>{showRawContent ? 'View Formatted' : 'View Raw'}</span>
          </button>
        </div>
        
        <div className="flex items-center text-gray-400 text-sm">
          <FiClock size={14} className="mr-1" />
          <span>Last updated: {formattedTimestamp}</span>
        </div>
      </div>
      
      {/* Source Pills - Perplexity Style */}
      {showSources && sources.length > 0 && (
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="flex flex-wrap gap-2">
            {sources.slice(0, 5).map((source, index) => (
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm text-gray-300 transition-colors"
              >
                <span className="w-4 h-4 mr-2 rounded overflow-hidden flex items-center justify-center bg-zinc-700">
                  {source.url.includes('cricbuzz') ? 'C' : 
                   source.url.includes('espncricinfo') ? 'E' :
                   source.url.includes('icc-cricket') ? 'I' :
                   getDomain(source.url).charAt(0).toUpperCase()}
                </span>
                {getDomain(source.url)}
              </a>
            ))}
            {sources.length > 5 && (
              <button className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm text-gray-300">
                +{sources.length - 5} more
              </button>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </div>
        </div>
      )}
      
      {/* Debug Info (if enabled) */}
      {showDebug && searchQueries && searchQueries.length > 0 && (
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-950 text-xs">
          <div className="font-medium text-gray-400 mb-1">Search Queries:</div>
          <div className="text-gray-500">
            {searchQueries.map((query, i) => (
              <div key={i} className="mb-1 last:mb-0">
                <span className="text-blue-400">#{i+1}:</span> {query}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="p-6">
        {showRawContent ? (
          <div className="bg-zinc-800 p-4 rounded-lg overflow-auto">
            <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono">
              {content}
            </pre>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      
      {/* Sources Panel (Detailed) */}
      {showSources && sources.length > 0 && (
        <div className="mt-4 border-t border-zinc-800 p-6">
          <div className="flex items-center mb-4">
            <FiClipboard className="mr-2 text-gray-400" size={18} />
            <h3 className="text-lg font-medium text-gray-300">Sources</h3>
          </div>
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div key={index} className="group">
                <div className="flex justify-between">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-start mb-1 group-hover:text-blue-300"
                  >
                    <span className="w-5 h-5 mr-2 rounded overflow-hidden flex items-center justify-center bg-zinc-800 text-xs shrink-0 mt-0.5">
                      {source.url.includes('cricbuzz') ? 'C' : 
                       source.url.includes('espncricinfo') ? 'E' :
                       source.url.includes('icc-cricket') ? 'I' :
                       getDomain(source.url).charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{source.title || getDomain(source.url)}</span>
                    <FiExternalLink size={14} className="ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                  </a>
                  <button 
                    onClick={() => handleCopySnippet(index, source.snippet)}
                    className="text-gray-500 hover:text-white p-1 rounded"
                    title="Copy snippet"
                  >
                    {copiedSnippet === index ? <FiCheckCircle size={16} className="text-green-500" /> : <FiClipboard size={16} />}
                  </button>
                </div>
                <p className="text-gray-400 text-sm pl-7">
                  {source.snippet.length > 200 
                    ? `${source.snippet.substring(0, 200)}...` 
                    : source.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 