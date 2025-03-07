'use client';

import { useState, useEffect } from 'react';
import ChatUI from './components/ChatUI';
import { FiHome, FiSearch, FiGlobe, FiGrid, FiPlus, FiGithub, FiBook, FiInfo } from 'react-icons/fi';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-20 flex flex-col">
        <div className="p-4 flex items-center border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" />
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="ml-2 font-semibold text-lg">CricketGPT</span>
        </div>
        
        <div className="p-3">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-zinc-800 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium">
            <FiPlus size={18} />
            <span>New Thread</span>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-3 mb-2">Navigation</div>
            <ul>
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <FiHome size={16} />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <FiSearch size={16} />
                  <span>Discover</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <FiGrid size={16} />
                  <span>Spaces</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div className="px-3 mb-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-3 mb-2">Recent Searches</div>
            <ul>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <span className="line-clamp-1">Who is the highest run scorer in IPL history?</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <span className="line-clamp-1">ICC Cricket World Cup 2023 winners</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <span className="line-clamp-1">Virat Kohli career statistics</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium line-clamp-1">Cricket Fan</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 ml-56">
        {/* Header */}
        <header className={`sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md z-10 transition-all duration-200 ${
          isScrolled ? 'border-b border-zinc-200 dark:border-zinc-800' : ''
        }`}>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-6">
              <h1 className="font-medium">Cricket Research</h1>
              <nav className="hidden md:flex gap-4">
                <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">About</a>
                <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Documentation</a>
                <a href="https://github.com/yourusername/cricket-gpt" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1">
                  <FiGithub size={14} />
                  <span>GitHub</span>
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 rounded-md bg-blue-600 text-white font-medium flex items-center gap-1 text-sm">
                <FiGlobe size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="h-[calc(100vh-48px)]">
          <ChatUI />
        </main>
      </div>
    </div>
  );
}
