'use client';

import React, { useState } from 'react';

/**
 * ResearchDebugger - A simplified component for deployment
 * This is a placeholder that maintains the API but doesn't use complex functionality
 */
export default function ResearchDebugger() {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg cursor-pointer z-50"
        onClick={() => setIsExpanded(true)}
      >
        <div className="text-xs font-mono">
          <span className="font-bold">Research Events:</span> N/A
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg z-50 max-w-lg w-full max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Research Events Debugger</h3>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-xs bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded"
        >
          Minimize
        </button>
      </div>
      
      <div className="text-xs mb-2 grid grid-cols-4 gap-1">
        <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded">
          <span className="font-bold">Bridge:</span> 0
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-1 rounded">
          <span className="font-bold">Window:</span> 0
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-1 rounded">
          <span className="font-bold">Storage:</span> 0
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded">
          <span className="font-bold">DOM:</span> 0
        </div>
      </div>
      
      <div className="text-xs font-mono">
        <div className="text-center py-4 text-gray-500">
          Debug mode disabled for deployment
        </div>
      </div>
    </div>
  );
} 