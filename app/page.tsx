'use client';

import { useState, useEffect } from 'react';
import ChatUI from './components/ChatUI';
import { FiGithub, FiBook, FiInfo, FiChevronUp, FiChevronDown } from 'react-icons/fi';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  // Handle header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100">
      {/* Compact Header */}
      <header className={`border-b transition-all duration-300 sticky top-0 z-10 ${
        scrolled
          ? 'border-zinc-800/80 bg-zinc-900/80 backdrop-blur-xl shadow-md py-2'
          : 'border-transparent bg-transparent py-3'
      }`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white text-base font-bold">S</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                Sports GPT
              </h1>
              <p className="text-zinc-400 text-xs font-light tracking-wide hidden sm:inline-block ml-2">
                Your AI cricket assistant
              </p>
            </div>
            <nav className="flex gap-2 sm:gap-4 items-center">
              <a 
                href="#" 
                className="flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-zinc-800/50"
                title="About"
              >
                <FiInfo size={16} />
                <span className="hidden sm:inline ml-1 text-xs">About</span>
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-zinc-800/50"
                title="Documentation"
              >
                <FiBook size={16} />
                <span className="hidden sm:inline ml-1 text-xs">Docs</span>
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-zinc-800/50"
                title="GitHub Repository"
              >
                <FiGithub size={16} />
                <span className="hidden sm:inline ml-1 text-xs">GitHub</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatUI />

      {/* Collapsible Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <button 
          onClick={() => setShowFooter(!showFooter)} 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-t-lg px-4 py-1 text-xs flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          {showFooter ? (
            <>
              <FiChevronDown size={14} />
              <span>Hide info</span>
            </>
          ) : (
            <>
              <FiChevronUp size={14} />
              <span>Show info</span>
            </>
          )}
        </button>
        
        {showFooter && (
          <footer className="bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800/50 py-4 shadow-lg animate-slideUp">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <h3 className="text-xs font-medium text-zinc-300 mb-2">Powered by</h3>
                  <ul className="space-y-1 text-zinc-400 font-light">
                    <li className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      <a href="https://openai.com" target="_blank" rel="noopener noreferrer">OpenAI</a>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                      <a href="https://perplexity.ai" target="_blank" rel="noopener noreferrer">Perplexity API</a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-zinc-300 mb-2">Resources</h3>
                  <ul className="space-y-1 text-zinc-400 font-light">
                    <li className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      <a href="#">API Docs</a>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                      <a href="#">Privacy</a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-zinc-300 mb-2">Connect</h3>
                  <ul className="space-y-1 text-zinc-400 font-light">
                    <li className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                      <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-zinc-500 font-light">
                  © {new Date().getFullYear()} Sports GPT
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
