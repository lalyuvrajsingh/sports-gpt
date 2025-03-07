'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiSearch, FiUser } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import ResearchButton from './ResearchButton';
import ResearchResults from './ResearchResults';
import GlobalProgress from './GlobalProgress';
import ErrorBoundary from './ErrorBoundary';

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
  const [query, setQuery] = useState('');
  const [textareaHeight, setTextareaHeight] = useState(56);
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-adjust textarea height based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '56px'; // Reset height
      const scrollHeight = inputRef.current.scrollHeight;
      setTextareaHeight(scrollHeight > 150 ? 150 : scrollHeight);
      inputRef.current.style.height = `${scrollHeight > 150 ? 150 : scrollHeight}px`;
    }
  }, [query]);
  
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
      setQuery(queryParam);
      onSubmit(null, queryParam);
    }
  }, []);
  
  const onSubmit = async (e: React.FormEvent | null, customQuery?: string) => {
    if (e) e.preventDefault();
    
    const queryToSend = customQuery || query;
    if (!queryToSend.trim() || isLoading) return;
    
    const newMessage: Message = { role: 'user', content: queryToSend };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setError(null);
    setQuery('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSend }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get a response');
      }
      
      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.content };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate related questions based on the query
      if (queryToSend) {
        generateRelatedQueries(queryToSend);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error during chat:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResearchComplete = (result: ResearchResult) => {
    console.log("Research complete with result:", {
      contentLength: result.content?.length || 0,
      sourcesCount: result.sources?.length || 0,
      imagesCount: result.images?.length || 0,
      searchQueriesCount: result.searchQueries?.length || 0
    });
    console.log("Active query:", activeQuery);
    
    if (result.content) {
      console.log("Research content preview:", result.content.substring(0, 200) + "...");
    } else {
      console.warn("Research completed but no content was returned");
    }
    
    // Store the result in state
    setResearchResult(result);
    
    // If content exists but no sources or images, still show it
    if (result.content && (!result.sources || result.sources.length === 0)) {
      console.log("Content exists but no sources found, still displaying content");
    }
    
    setIsResearching(false);
    if (activeQuery || query) {
      generateRelatedQueries(activeQuery || query);
    }
  };
  
  const handleResearchError = (error: string) => {
    setError(error);
    setIsResearching(false);
  };
  
  const handleStartResearch = () => {
    setIsResearching(true);
    setResearchResult(null);
    setError(null);
  };
  
  const generateRelatedQueries = (baseQuery: string) => {
    // In a real app, you might use an API to generate these
    // For now, we'll use hardcoded examples based on common patterns
    const cricketTopics = [
      "highest run scorer",
      "most wickets",
      "world cup winners",
      "batting average",
      "bowling economy",
      "career statistics",
      "best performance",
      "recent form"
    ];
    
    const randomTopics = cricketTopics
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const playerName = baseQuery.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/)?.[1] || '';
    
    const queries = randomTopics.map(topic => {
      if (playerName) {
        return `${playerName}'s ${topic}`;
      } else {
        return `Cricket ${topic}`;
      }
    });
    
    setRelatedQueries(queries);
  };
  
  const renderMessageContent = (content: string, isExpandable = true) => {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    );
  };
  
  return (
    <main className="flex flex-col h-full max-w-5xl mx-auto py-4 px-4 md:px-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        CricketGPT
      </h1>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {researchResult ? (
          <div className="mt-4">
            <ErrorBoundary fallback={
              <div className="w-full p-4 my-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20">
                <h3 className="text-red-700 dark:text-red-300 font-medium">Error displaying research results</h3>
                <p className="text-red-600 dark:text-red-400 mt-2">The research results couldn't be displayed properly.</p>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reload page
                  </button>
                </div>
              </div>
            }>
              <ResearchResults 
                content={researchResult.content || ''} 
                sources={researchResult.sources || []} 
                images={researchResult.images || []}
                searchQueries={researchResult.searchQueries || []}
                query={activeQuery || query}
              />
            </ErrorBoundary>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[75%] p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-[75%] p-4 rounded-lg bg-gray-200 dark:bg-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">What would you like to know about cricket?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSubmit(null, "Who is the current ICC number one ranked batsman?")}>
                  Who is the current ICC number one ranked batsman?
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSubmit(null, "Which country has won the most test matches?")}>
                  Which country has won the most test matches?
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSubmit(null, "What is the highest team score in ODI cricket?")}>
                  What is the highest team score in ODI cricket?
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSubmit(null, "Who holds the record for fastest T20 century?")}>
                  Who holds the record for fastest T20 century?
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Related Questions */}
        {relatedQueries.length > 0 && !researchResult && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Related Questions:</h3>
            <div className="flex flex-wrap gap-2">
              {relatedQueries.map((relatedQuery, index) => (
                <button
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => onSubmit(null, relatedQuery)}
                >
                  {relatedQuery}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <p>Error: {error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="mt-auto">
        <form onSubmit={onSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about cricket..."
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-20 py-3 resize-none"
            style={{ height: `${textareaHeight}px`, maxHeight: '150px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <ResearchButton
              query={query}
              onResearchComplete={handleResearchComplete}
              onError={handleResearchError}
            />
            <button
              type="submit"
              className={`p-2 rounded-md ${
                !query.trim() || isLoading
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={!query.trim() || isLoading}
              title={!query.trim() ? "Enter a query first" : "Send"}
            >
              <FiSend />
            </button>
          </div>
        </form>
        
        {activeQuery && isResearching && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Researching: {activeQuery}
          </div>
        )}
        
        {/* Loading/progress indicator */}
        {isResearching && <GlobalProgress isLoading={isResearching} />}
      </div>
    </main>
  );
} 