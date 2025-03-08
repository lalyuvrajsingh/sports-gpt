'use client';

import { useState, useEffect } from 'react';
import ChatUI from './components/ChatUI';
import { FiGlobe, FiGithub, FiBook, FiInfo } from 'react-icons/fi';

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
    <main className="flex min-h-screen flex-col bg-zinc-900 text-zinc-100">
      {/* Simplified Header - Only shown on mobile */}
      <header className={`sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-zinc-900 md:hidden border-b border-zinc-800 ${
        isScrolled ? 'shadow-md' : ''
      }`}>
        <div className="flex items-center">
          <FiGlobe className="mr-2 text-blue-500" size={20} />
          <h1 className="text-lg font-medium">CricketGPT</h1>
        </div>
        <div className="flex space-x-3">
          <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200">About</a>
          <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200">Docs</a>
          <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200">GitHub</a>
        </div>
      </header>
      
        
        {/* Main Content Area */}
        
          {/* Chat UI */}
          <div className="px-4 py-2 md:p-0">
            <ChatUI />
          </div>
        
      
    </main>
  );
}
