'use client';

import { useState } from 'react';
import { FiExternalLink, FiChevronDown, FiChevronUp, FiSearch, FiBookOpen, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchResultsProps {
  content: string;
  sources: Source[];
  searchQueries?: string[];
}

/**
 * Component to display structured research results from Perplexity Sonar
 */
export default function ResearchResults({ 
  content, 
  sources, 
  searchQueries = [] 
}: ResearchResultsProps) {
  const [showSources, setShowSources] = useState(false);
  const [showSearchQueries, setShowSearchQueries] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className={`flex flex-col w-full ${fullscreen ? 'fixed inset-0 z-50 p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn' : 'max-w-4xl mx-auto'}`}>
      <div className={`bg-gradient-to-b from-zinc-800/90 to-zinc-800/80 backdrop-blur-xl rounded-xl border border-zinc-700/50 ${fullscreen ? 'w-full h-full max-w-6xl mx-auto flex flex-col overflow-hidden' : 'p-4 sm:p-5 shadow-xl'}`}>
        <div className="flex items-center justify-between border-b border-zinc-700/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1.5 shadow-md">
              <FiBookOpen className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              Research Results
            </h2>
          </div>
          <div className="flex space-x-1.5">
            <button
              onClick={() => setShowSearchQueries(!showSearchQueries)}
              className={`flex items-center text-xs p-1.5 rounded-lg transition-colors ${
                searchQueries.length === 0 
                  ? 'text-zinc-500 cursor-not-allowed' 
                  : showSearchQueries 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100'
              }`}
              disabled={searchQueries.length === 0}
              title={searchQueries.length === 0 ? "No search queries" : "Toggle search queries"}
            >
              <FiSearch size={14} />
            </button>
            <button
              onClick={() => setShowSources(!showSources)}
              className={`flex items-center text-xs p-1.5 rounded-lg transition-colors ${
                sources.length === 0 
                  ? 'text-zinc-500 cursor-not-allowed' 
                  : showSources 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100'
              }`}
              disabled={sources.length === 0}
              title={sources.length === 0 ? "No sources" : "Toggle sources"}
            >
              <FiExternalLink size={14} />
              <span className="ml-1 hidden sm:inline">{sources.length}</span>
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="flex items-center text-xs p-1.5 rounded-lg text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100 transition-colors"
              title={fullscreen ? "Exit fullscreen" : "View fullscreen"}
            >
              {fullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
            </button>
            {fullscreen && (
              <button
                onClick={() => setFullscreen(false)}
                className="flex items-center text-xs p-1.5 rounded-lg text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100 transition-colors sm:hidden"
                title="Close"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className={`${fullscreen ? 'flex-grow flex flex-col overflow-hidden' : ''}`}>
          {/* Search Queries Panel */}
          {showSearchQueries && searchQueries.length > 0 && (
            <div className="mb-3 p-3 bg-zinc-700/20 border border-zinc-700/50 rounded-lg text-xs animate-fadeIn">
              <h3 className="text-xs font-medium mb-2 text-blue-300 flex items-center">
                <FiSearch className="mr-1.5" size={12} />
                Search Queries
              </h3>
              <ul className="space-y-1.5 text-zinc-300">
                {searchQueries.map((query, index) => (
                  <li key={index} className="p-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
                    "{query}"
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Sources Panel */}
          {showSources && sources.length > 0 && (
            <div className="mb-3 p-3 bg-zinc-700/20 border border-zinc-700/50 rounded-lg text-xs animate-fadeIn">
              <h3 className="text-xs font-medium mb-2 text-blue-300 flex items-center">
                <FiExternalLink className="mr-1.5" size={12} />
                Sources
              </h3>
              <div className={`space-y-2 ${fullscreen ? 'max-h-[20vh]' : 'max-h-40'} overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800`}>
                {sources.map((source, index) => (
                  <div key={index} className="p-2 bg-zinc-800/70 rounded-lg border border-zinc-700/40 hover:border-zinc-600/60 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-blue-300 line-clamp-1">{source.title || 'Untitled Source'}</h4>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-blue-600/20 text-blue-400 p-1 rounded-lg hover:bg-blue-600/30 transition-colors ml-1.5"
                        title="Visit source"
                      >
                        <FiExternalLink size={12} />
                      </a>
                    </div>
                    {source.snippet && (
                      <p className="text-zinc-400 mt-1 text-xs line-clamp-2">{source.snippet}</p>
                    )}
                    <div className="mt-1 text-xs text-zinc-500 truncate">{source.url}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className={`prose prose-invert prose-blue prose-sm max-w-none ${fullscreen ? 'flex-grow overflow-y-auto p-2' : 'overflow-auto max-h-[50vh]'} scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800 rounded-lg`}>
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]}
              components={{
                table: ({ node, ...props }: any) => (
                  <div className="overflow-x-auto my-2 rounded-lg border border-zinc-700/50">
                    <table {...props} className="min-w-full divide-y divide-zinc-700/50 text-sm" />
                  </div>
                ),
                thead: ({ node, ...props }: any) => (
                  <thead {...props} className="bg-zinc-800" />
                ),
                tbody: ({ node, ...props }: any) => (
                  <tbody {...props} className="divide-y divide-zinc-700/50 bg-zinc-800/50" />
                ),
                tr: ({ node, ...props }: any) => (
                  <tr {...props} className="hover:bg-zinc-700/30 transition-colors" />
                ),
                th: ({ node, ...props }: any) => (
                  <th {...props} className="px-3 py-2 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider" />
                ),
                td: ({ node, ...props }: any) => (
                  <td {...props} className="px-3 py-2 whitespace-nowrap text-zinc-400" />
                ),
                a: ({ node, ...props }: any) => (
                  <a 
                    {...props} 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                h1: ({ node, ...props }: any) => (
                  <h1 {...props} className="text-xl font-bold mb-3 pb-2 border-b border-zinc-700/50 text-zinc-100" />
                ),
                h2: ({ node, ...props }: any) => (
                  <h2 {...props} className="text-lg font-semibold mb-3 text-zinc-100" />
                ),
                h3: ({ node, ...props }: any) => (
                  <h3 {...props} className="text-md font-medium mb-2 text-zinc-100" />
                ),
                p: ({ node, ...props }: any) => (
                  <p {...props} className="mb-3 text-zinc-300 leading-relaxed" />
                ),
                ul: ({ node, ...props }: any) => (
                  <ul {...props} className="list-disc pl-6 mb-3 space-y-1 text-zinc-300" />
                ),
                ol: ({ node, ...props }: any) => (
                  <ol {...props} className="list-decimal pl-6 mb-3 space-y-1 text-zinc-300" />
                ),
                li: ({ node, ...props }: any) => (
                  <li {...props} className="pl-1.5" />
                ),
                code: ({ node, inline, ...props }: any) => (
                  inline 
                    ? <code {...props} className="bg-zinc-700/50 px-1 py-0.5 rounded text-zinc-300" />
                    : <code {...props} className="block bg-zinc-700/50 p-3 rounded-lg text-zinc-300 overflow-x-auto" />
                ),
                pre: ({ node, ...props }: any) => (
                  <pre {...props} className="bg-zinc-700/50 p-3 rounded-lg text-zinc-300 overflow-x-auto mb-3" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
} 