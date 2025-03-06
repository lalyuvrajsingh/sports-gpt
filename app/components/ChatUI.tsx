import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import ResearchButton from './ResearchButton';
import ResearchResults from './ResearchResults';
import { FiSend, FiAlertCircle, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchResult {
  content: string;
  sources: Source[];
  searchQueries?: string[];
}

export default function ChatUI() {
  const [loading, setLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [fullscreenMessage, setFullscreenMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    setResearchResult(null);
    setResearchError(null);
    await handleSubmit(e);
    setLoading(false);
  };

  const handleResearchComplete = (result: ResearchResult) => {
    setResearchResult(result);
    setResearchError(null);
  };

  const handleResearchError = (error: string) => {
    setResearchError(error);
    setResearchResult(null);
  };

  // Enhanced rendering for message content
  const renderMessageContent = (content: string, isExpandable = true) => {
    // Check if content contains table-like structure
    const hasTable = content.includes('|') && content.includes('\n|');
    const hasCode = content.includes('```');
    
    const messageClass = hasTable || hasCode 
      ? 'prose prose-invert prose-blue max-w-none text-sm md:text-base'
      : 'whitespace-pre-wrap leading-relaxed text-sm md:text-base';
    
    return (
      <div className={messageClass}>
        {hasTable || hasCode ? (
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
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                
                return !inline ? (
                  <div className="relative group">
                    <div className="absolute top-2 right-2 text-xs text-zinc-500 font-mono bg-zinc-800/80 px-2 py-0.5 rounded">
                      {lang || 'code'}
                    </div>
                    <pre className="mt-4 p-4 bg-zinc-800/80 rounded-lg overflow-x-auto border border-zinc-700/30">
                      <code {...props} className={`language-${lang || 'text'}`}>
                        {String(children).replace(/\n$/, '')}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="px-1.5 py-0.5 mx-0.5 bg-zinc-800/60 text-zinc-300 rounded font-mono text-sm">
                    {children}
                  </code>
                );
              },
              ul: ({ node, ...props }: any) => (
                <ul {...props} className="list-disc pl-6 my-2 space-y-1 text-zinc-300" />
              ),
              ol: ({ node, ...props }: any) => (
                <ol {...props} className="list-decimal pl-6 my-2 space-y-1 text-zinc-300" />
              ),
              li: ({ node, ...props }: any) => (
                <li {...props} className="pl-1.5" />
              ),
              p: ({ node, ...props }: any) => (
                <p {...props} className="my-2 text-zinc-300" />
              ),
              h1: ({ node, ...props }: any) => (
                <h1 {...props} className="text-xl font-semibold my-4 pb-2 border-b border-zinc-700/50 text-zinc-100" />
              ),
              h2: ({ node, ...props }: any) => (
                <h2 {...props} className="text-lg font-semibold my-3 text-zinc-100" />
              ),
              h3: ({ node, ...props }: any) => (
                <h3 {...props} className="text-base font-medium my-2 text-zinc-100" />
              ),
              a: ({ node, ...props }: any) => (
                <a {...props} className="text-blue-400 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          content
        )}
        
        {isExpandable && (hasTable || hasCode || content.length > 500) && (
          <button
            onClick={() => setFullscreenMessage(content)}
            className="mt-2 text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="Expand to fullscreen"
          >
            <FiMaximize2 size={12} />
            <span>View fullscreen</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto w-full px-3 sm:px-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent rounded-lg pb-2">
        {messages.length === 0 && (
          <div className="text-center space-y-6 p-6 mb-4 mt-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
              <RiRobot2Line size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-medium tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              Welcome to Sports GPT
            </h2>
            <p className="text-base text-zinc-300 font-light max-w-xl mx-auto">
              Get real-time cricket information, statistics, and analysis.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-400 font-light max-w-3xl mx-auto">
              <div 
                className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 shadow-sm hover:shadow-md hover:border-zinc-600/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleInputChange({ target: { value: "Who is the highest run scorer in IPL history?" } } as any)}
              >
                <p className="text-sm text-zinc-300 font-medium mb-1">IPL Records</p>
                Who is the highest run scorer in IPL history?
              </div>
              <div 
                className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 shadow-sm hover:shadow-md hover:border-zinc-600/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleInputChange({ target: { value: "How many wickets has Jasprit Bumrah taken in the last IPL season?" } } as any)}
              >
                <p className="text-sm text-zinc-300 font-medium mb-1">Player Stats</p>
                How many wickets has Jasprit Bumrah taken in the last IPL season?
              </div>
              <div 
                className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 shadow-sm hover:shadow-md hover:border-zinc-600/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleInputChange({ target: { value: "Which team has won the most Cricket World Cups?" } } as any)}
              >
                <p className="text-sm text-zinc-300 font-medium mb-1">World Cup History</p>
                Which team has won the most Cricket World Cups?
              </div>
              <div 
                className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 shadow-sm hover:shadow-md hover:border-zinc-600/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleInputChange({ target: { value: "Give me live cricket match scores" } } as any)}
              >
                <p className="text-sm text-zinc-300 font-medium mb-1">Live Scores</p>
                Give me live cricket match scores
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            <div
              className={`flex ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              } max-w-[95%] gap-2`}
            >
              <div className={`flex-shrink-0 mt-1 ${message.role === 'user' ? 'ml-1.5' : 'mr-1.5'}`}>
                {message.role === 'user' ? (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                    <FaUserCircle className="text-white" size={16} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <RiRobot2Line className="text-white" size={16} />
                  </div>
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500'
                    : 'bg-zinc-800/90 text-zinc-100 rounded-tl-none border border-zinc-700/60'
                } shadow-sm`}
              >
                {renderMessageContent(message.content)}
              </div>
            </div>
          </div>
        ))}
        
        {/* Research Results */}
        {researchResult && (
          <div className="flex justify-center my-6 animate-fadeIn">
            <ResearchResults
              content={researchResult.content}
              sources={researchResult.sources}
              searchQueries={researchResult.searchQueries}
            />
          </div>
        )}
        
        {/* Errors */}
        {(researchError || error) && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 my-4 flex items-center gap-2">
            <FiAlertCircle size={16} />
            <p className="text-sm font-medium">
              {researchError || (error ? (error.message || 'An error occurred') : '')}
            </p>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center my-4">
            <div className="flex items-center gap-3 text-zinc-400 animate-pulse">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        {/* Element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col space-y-3 mt-auto mb-4">
        {/* Research button - only show when there's input text */}
        {input.trim() && (
          <div className="flex justify-end">
            <ResearchButton
              query={input}
              onResearchComplete={handleResearchComplete}
              onError={handleResearchError}
            />
          </div>
        )}
        
        {/* Chat input form */}
        <form onSubmit={onSubmit} className="relative bg-zinc-800/70 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-lg focus-within:shadow-blue-500/10 focus-within:border-blue-500/30 transition-all duration-300">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about cricket stats, matches, and players..."
            className="w-full rounded-xl bg-transparent px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:outline-none text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 text-white ${
              loading || !input.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700 transition-all'
            }`}
          >
            <FiSend size={16} />
          </button>
        </form>
      </div>
      
      {/* Fullscreen message view */}
      {fullscreenMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="text-zinc-100 font-medium">Detailed View</h3>
              <button 
                onClick={() => setFullscreenMessage(null)}
                className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <FiMinimize2 size={16} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
              {renderMessageContent(fullscreenMessage, false)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 