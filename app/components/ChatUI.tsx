'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiSearch, FiUser, FiGlobe, FiChevronRight, FiLink, FiArrowRight, FiMenu, FiX, FiZap, FiMessageCircle } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import ResearchButton from './ResearchButton';
import ResearchResults from './ResearchResults';
import GlobalProgress from './GlobalProgress';
import ErrorBoundary from './ErrorBoundary';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ImageSource {
  url: string;
  origin?: string;
  height?: number;
  width?: number;
  context?: string;
}

interface ResearchResult {
  content: string;
  sources: Source[];
  images?: ImageSource[];
  searchQueries?: string[];
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([
    "Who is the current ICC number one ranked batsman?",
    "Which country has won the most test matches?",
    "What is the highest team score in ODI cricket?",
    "Who holds the record for fastest T20 century?"
  ]);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-adjust textarea height based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, researchResult]);
  
  // Handle URL query parameters
  const searchParams = useSearchParams();
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setInputValue(queryParam);
      onSubmit(null, queryParam);
    }
  }, []);
  
  const onSubmit = async (e: React.FormEvent | null, customQuery?: string) => {
    e?.preventDefault();
    
    const query = customQuery || inputValue;
    if (!query.trim() || isResearching) return;
    
    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: query,
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setResearchResult(null);
    setResearchError(null);
    setIsResearching(true);
    setActiveQuery(query);
  };
  
  const handleResearchComplete = (result: ResearchResult) => {
    setIsResearching(false);
    setResearchResult(result);
    
    // Generate related queries based on the user's query
    if (activeQuery) {
      generateRelatedQueries(activeQuery);
    }
    
    // Add assistant message
    const newAssistantMessage: Message = {
      role: 'assistant',
      content: result.content,
    };
    
    setMessages(prev => [...prev, newAssistantMessage]);
    
    // Generate suggested follow-up queries
    if (messages.length === 1) {
      generateRelatedQueries(activeQuery);
    }
  };
  
  const handleResearchError = (error: string) => {
    setIsResearching(false);
    setResearchError(error);
  };
  
  const handleStartResearch = () => {
    setIsResearching(true);
    setResearchResult(null);
    setResearchError(null);
  };
  
  const generateRelatedQueries = (baseQuery: string) => {
    const related = [
      `What are the latest stats for ${baseQuery}?`,
      `Compare top players in ${baseQuery}`,
      `Historical context of ${baseQuery}`,
      `Recent news about ${baseQuery}`
    ];
    
    setSuggestedQueries(related);
    setRelatedQueries(related);
  };
  
  const renderMessageContent = (content: string) => {
    return (
      <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
        <ReactMarkdown
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
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900 text-black dark:text-white overflow-hidden">
      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden transition-transform duration-300 ease-in-out`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className="absolute top-0 left-0 w-64 h-full bg-zinc-900 shadow-lg p-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                <FiGlobe className="text-black" />
              </div>
              <span className="font-semibold text-xl">CricketGPT</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <FiX size={24} />
            </button>
          </div>
          
          <button className="w-full text-left mb-6 flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700">
            <div className="w-5 h-5 flex items-center justify-center">
              <FiMenu />
            </div>
            <span>New Thread</span>
          </button>
          
          <div className="space-y-1 mb-8">
            <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-800 flex items-center gap-2">
              <FiUser />
              <span>Home</span>
            </button>
            <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-800 flex items-center gap-2">
              <FiSearch />
              <span>Discover</span>
            </button>
          </div>
          
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <h3 className="text-xs uppercase text-zinc-500 font-semibold mb-2 px-3">Recent Searches</h3>
            <div className="space-y-1">
              <button 
                onClick={() => onSubmit(null, "Who is the highest run scorer in IPL?")} 
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-800 text-sm flex items-center"
              >
                <span className="text-ellipsis overflow-hidden whitespace-nowrap">Who is the highest run scorer in IPL?</span>
              </button>
              <button 
                onClick={() => onSubmit(null, "ICC Cricket World Cup winners")} 
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-800 text-sm flex items-center"
              >
                <span className="text-ellipsis overflow-hidden whitespace-nowrap">ICC Cricket World Cup winners</span>
              </button>
              <button 
                onClick={() => onSubmit(null, "Virat Kohli career statistics")} 
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-800 text-sm flex items-center"
              >
                <span className="text-ellipsis overflow-hidden whitespace-nowrap">Virat Kohli career statistics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
            <FiGlobe className="text-black" />
          </div>
          <span className="font-semibold text-xl">CricketGPT</span>
        </div>
        
        <button className="w-full text-left mb-6 flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700">
          <div className="w-5 h-5 flex items-center justify-center">
            <FiMenu />
          </div>
          <span>New Thread</span>
        </button>
        
        <div className="space-y-1 mb-8">
          <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-2">
            <FiUser />
            <span>Home</span>
          </button>
          <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-2">
            <FiSearch />
            <span>Discover</span>
          </button>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
          <h3 className="text-xs uppercase text-zinc-500 font-semibold mb-2 px-3">Recent Searches</h3>
          <div className="space-y-1">
            <button 
              onClick={() => onSubmit(null, "Who is the highest run scorer in IPL?")} 
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm flex items-center"
            >
              <span className="text-ellipsis overflow-hidden whitespace-nowrap">Who is the highest run scorer in IPL?</span>
            </button>
            <button 
              onClick={() => onSubmit(null, "ICC Cricket World Cup winners")} 
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm flex items-center"
            >
              <span className="text-ellipsis overflow-hidden whitespace-nowrap">ICC Cricket World Cup winners</span>
            </button>
            <button 
              onClick={() => onSubmit(null, "Virat Kohli career statistics")} 
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm flex items-center"
            >
              <span className="text-ellipsis overflow-hidden whitespace-nowrap">Virat Kohli career statistics</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="mr-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 lg:hidden">
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl font-semibold">
              {activeQuery || "Cricket Research"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">About</button>
            <button className="px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Documentation</button>
            <a href="https://github.com/your-repo/cricket-gpt" target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1">
              <span>GitHub</span>
            </a>
            <button className="ml-2 px-4 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-1">
              <span>Share</span>
            </button>
          </div>
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <FiGlobe className="text-blue-500 mb-4" size={48} />
              <h1 className="text-2xl font-bold mb-6">What would you like to know about cricket?</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => onSubmit(null, query)}
                    className="text-left p-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors flex items-center"
                  >
                    <FiMessageCircle className="mr-2 text-zinc-400 flex-shrink-0" size={16} />
                    <span className="text-sm line-clamp-2">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-6 ${message.role === 'user' ? 'ml-auto max-w-2xl' : 'max-w-3xl'}`}
                >
                  <div className={`
                    flex items-start gap-3
                    ${message.role === 'user' 
                      ? 'flex-row-reverse' 
                      : 'flex-row'}
                  `}>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-800 text-blue-500'}
                    `}>
                      {message.role === 'user' ? 'U' : <FiZap size={16} />}
                    </div>
                    
                    <div className={`
                      rounded-lg px-4 py-3 
                      ${message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-800 text-zinc-100'}
                    `}>
                      {message.role === 'user' ? (
                        <p>{message.content}</p>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </div>
                  </div>
                  
                  {/* Research results for assistant messages */}
                  {message.role === 'assistant' && index === messages.length - 1 && researchResult && (
                    <div className="mt-4 pl-11">
                      <ResearchResults 
                        content={researchResult.content}
                        sources={researchResult.sources}
                        searchQueries={researchResult.searchQueries}
                        query={messages[messages.length - 2]?.content || ''}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading state while researching */}
              {isResearching && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <FiZap className="text-white animate-pulse" />
                    </div>
                    <p className="text-sm text-zinc-400">Researching the web...</p>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {researchError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 my-4 max-w-2xl mx-auto">
                  <p className="text-red-400 text-sm">{researchError}</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Related Questions */}
          {relatedQueries.length > 0 && (activeQuery || messages.length > 0) && !isResearching && (
            <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="text-lg font-medium mb-3">Related Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {relatedQueries.map((relatedQuery, index) => (
                  <button
                    key={index}
                    className="p-3 text-left border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex justify-between items-center"
                    onClick={() => onSubmit(null, relatedQuery)}
                  >
                    <span className="flex-1 pr-2">{relatedQuery}</span>
                    <FiArrowRight className="text-zinc-400" size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={onSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about cricket..."
                className="w-full pl-4 pr-24 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl resize-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none"
                style={{ height: 'auto', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(null, inputValue);
                  }
                }}
              />
              
              <div className="absolute right-3 bottom-3 flex space-x-1">
                <ResearchButton
                  query={inputValue}
                  onResearchComplete={handleResearchComplete}
                  onError={handleResearchError}
                />
                <button
                  type="submit"
                  className={`p-2 rounded-lg ${
                    !inputValue.trim() || isResearching
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={!inputValue.trim() || isResearching}
                >
                  <FiSend size={18} />
                </button>
              </div>
            </form>
            
            {activeQuery && isResearching && (
              <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                Researching: {activeQuery}
              </div>
            )}
            
            {/* Loading/progress indicator */}
            {isResearching && <GlobalProgress isLoading={isResearching} />}
          </div>
        </div>
      </div>
    </div>
  );
} 