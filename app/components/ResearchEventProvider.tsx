'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simple context with minimal functionality
interface SimpleResearchContextType {
  isResearching: boolean;
  startResearch: () => void;
  stopResearch: () => void;
  sessionId: string;
}

// Create context with default values
const ResearchEventsContext = createContext<SimpleResearchContextType>({
  isResearching: false,
  startResearch: () => {},
  stopResearch: () => {},
  sessionId: ''
});

// Custom hook to use the research context
export const useResearchEvents = () => useContext(ResearchEventsContext);

interface ResearchEventProviderProps {
  children: ReactNode;
}

export const ResearchEventProvider: React.FC<ResearchEventProviderProps> = ({ children }) => {
  const [isResearching, setIsResearching] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);

  // Simple functions to start and stop research
  const startResearch = () => {
    console.log('Starting research session:', sessionId);
    setIsResearching(true);
  };

  const stopResearch = () => {
    console.log('Stopping research session:', sessionId);
    setIsResearching(false);
  };

  const value = {
    isResearching,
    startResearch,
    stopResearch,
    sessionId
  };

  return (
    <ResearchEventsContext.Provider value={value}>
      {children}
    </ResearchEventsContext.Provider>
  );
};

export default ResearchEventProvider; 