'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiExternalLink, FiChevronDown, FiChevronUp, FiInfo, FiLink, FiClock, FiArrowRight, FiEdit, FiCheckCircle, FiClipboard } from 'react-icons/fi';

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
  const [showAllSources, setShowAllSources] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const [showRawContent, setShowRawContent] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);
  
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
      const thinkRegex = /<think>[\s\S]*?<\/think>/g;
      return rawContent.replace(thinkRegex, '').trim();
    } catch (e) {
      console.error('Error cleaning content:', e);
      return rawContent;
    }
  };
  
  // Handle copying source snippets to clipboard
  const handleCopySnippet = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedSnippet(index);
        setTimeout(() => setCopiedSnippet(null), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };
  
  if (!content || content.trim() === '') {
    return (
      <div className="w-full p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-300">No research content available.</p>
      </div>
    );
  }
  
  const processedContent = cleanContent(content);
  
  // Format a timestamp for now to mimic Perplexity's "last updated" display
  const formattedTimestamp = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header with timestamp and controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600/10 rounded-full flex items-center justify-center">
            <FiInfo className="text-blue-500" size={16} />
          </div>
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <FiClock size={12} />
              <span>Updated {formattedTimestamp}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs px-2 py-1 bg-zinc-800/70 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
          >
            {showDebug ? 'Hide Debug' : 'Debug'}
          </button>
          
          <button 
            onClick={() => setShowRawContent(!showRawContent)}
            className="text-xs px-2 py-1 bg-zinc-800/70 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
          >
            {showRawContent ? 'Show Formatted' : 'Show Raw'}
          </button>
        </div>
      </div>
      
      {/* Source Pills - shown at the top like Perplexity */}
      {sources && sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sources.slice(0, 3).map((source, index) => (
            <a 
              key={index} 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/60 text-xs hover:bg-zinc-700 transition-colors"
            >
              <FiLink size={10} className="mr-1.5 text-blue-400" />
              <span className="max-w-[160px] truncate">{getDomain(source.url)}</span>
            </a>
          ))}
          {sources.length > 3 && (
            <button 
              onClick={() => setShowSourcePanel(!showSourcePanel)}
              className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/60 text-xs hover:bg-zinc-700 transition-colors"
            >
              +{sources.length - 3} more
            </button>
          )}
        </div>
      )}
      
      {/* Debug Info */}
      {showDebug && (
        <div className="w-full p-3 mb-4 border border-blue-900/30 rounded-lg bg-blue-900/20 text-xs font-mono">
          <h3 className="font-bold mb-2 text-blue-400">Debug Information:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-zinc-400">Content Length:</span> {content?.length || 0}</div>
            <div><span className="text-zinc-400">Clean Content:</span> {processedContent?.length || 0}</div>
            <div><span className="text-zinc-400">Sources:</span> {sources?.length || 0}</div>
            <div><span className="text-zinc-400">Search Queries:</span> {searchQueries?.length || 0}</div>
            <div className="col-span-2"><span className="text-zinc-400">Query:</span> {query || 'N/A'}</div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="w-full">
        {showRawContent ? (
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-zinc-200">Raw Content</h2>
              <button 
                onClick={() => navigator.clipboard.writeText(processedContent)}
                className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                <FiClipboard size={12} /> Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap bg-zinc-800/70 p-4 rounded-lg text-sm overflow-auto max-h-[400px] text-zinc-300">
              {processedContent}
            </pre>
          </div>
        ) : (
          <div className="prose dark:prose-invert w-full max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-8 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-6 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 pl-6 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline inline-flex items-center"
                  >
                    {children}
                    <FiExternalLink className="ml-1 inline-block" size={12} />
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-zinc-700">
                    <table className="w-full text-sm">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-zinc-800 p-2 text-left font-medium">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border-t border-zinc-700 p-2">{children}</td>
                ),
                code: ({ node, className, children, ...props }) => {
                  // Check if this is an inline code block based on the parent node
                  const isInline = !className && !props.hasOwnProperty('data-language');
                  
                  if (isInline) {
                    return <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-sm">{children}</code>;
                  }
                  return (
                    <div className="relative mt-4 mb-6">
                      <pre className="p-4 rounded-lg bg-zinc-800 overflow-auto">
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
        
        {/* Sources Panel - improved Perplexity style */}
        {sources && sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={() => setShowSourcePanel(!showSourcePanel)}
                className="flex items-center gap-1 text-zinc-200 font-medium hover:text-zinc-100"
              >
                Sources {sources.length > 0 && `(${sources.length})`}
                {showSourcePanel ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              
              {sources.length > 3 && showSourcePanel && (
                <button
                  onClick={() => setShowAllSources(!showAllSources)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {showAllSources ? 'Show fewer' : 'View all sources'}
                  {!showAllSources && <FiArrowRight size={12} />}
                </button>
              )}
            </div>
            
            {showSourcePanel && (
              <div className="space-y-3 mt-3">
                {visibleSources && visibleSources.length > 0 ? (
                  visibleSources.map((source, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <a 
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-400 hover:underline line-clamp-1 flex items-center gap-1"
                        >
                          {source.title || getDomain(source.url)}
                          <FiExternalLink size={12} />
                        </a>
                        <span className="text-xs text-zinc-500 flex-shrink-0">
                          {getDomain(source.url)}
                        </span>
                      </div>
                      <div className="relative">
                        <p className="text-sm text-zinc-300 line-clamp-2">
                          {source.snippet || 'No snippet available'}
                        </p>
                        <button 
                          onClick={() => handleCopySnippet(index, source.snippet)}
                          className="absolute right-0 bottom-0 text-zinc-500 hover:text-zinc-300"
                          title={copiedSnippet === index ? "Copied!" : "Copy snippet"}
                        >
                          {copiedSnippet === index ? 
                            <FiCheckCircle size={14} className="text-green-500" /> : 
                            <FiClipboard size={14} />
                          }
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-400 text-sm italic">No sources available</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 