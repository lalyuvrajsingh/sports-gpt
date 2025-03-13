'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';

/**
 * Simplified Research Progress component
 * This is a placeholder version that doesn't use the complex event system
 */
export default function ResearchProgress({ 
  sessionId, 
  show 
}: { 
  sessionId?: string; 
  show: boolean;
}) {
  if (!show) return null;
  
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 overflow-hidden p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiSearch className="text-blue-500" />
        <h3 className="text-white font-medium">Research Progress</h3>
        <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">
          Simplified Mode
        </span>
      </div>
      
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div 
          className="absolute left-0 top-0 h-full bg-blue-600 animate-pulse"
          style={{ width: '80%' }}
        ></div>
      </div>
      
      <p className="text-zinc-400 text-sm">
        Searching for cricket information... This may take a moment.
      </p>
      
      <div className="mt-4 text-xs text-zinc-500">
        Session ID: {sessionId || 'Not set'}
      </div>
    </div>
  );
} 