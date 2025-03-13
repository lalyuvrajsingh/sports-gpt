'use client';

import { useState, useCallback } from 'react';
import type { ResearchProgress } from '@/src/lib/types';

/**
 * Simplified hook for research events
 * This is a placeholder that maintains the API but doesn't implement complex functionality
 */
export function useResearchEvents(
  sessionId?: string,
  initialEvents: ResearchProgress[] = []
) {
  const [events] = useState<ResearchProgress[]>(initialEvents);
  const [lastEvent] = useState<ResearchProgress | null>(
    initialEvents.length > 0 ? initialEvents[initialEvents.length - 1] : null
  );
  
  const forceRefresh = useCallback(() => {
    console.log('[SimplifiedHook] Force refresh called');
    // No implementation in simplified version
  }, []);
  
  const addEvent = useCallback((event: ResearchProgress) => {
    console.log('[SimplifiedHook] Add event called:', event.message);
    // No implementation in simplified version
  }, []);
  
  const clearEvents = useCallback(() => {
    console.log('[SimplifiedHook] Clear events called');
    // No implementation in simplified version
  }, []);

  return {
    events,
    lastEvent,
    addEvent,
    clearEvents,
    forceRefresh,
    currentSessionId: sessionId || null,
    setCurrentSessionId: () => {
      console.log('[SimplifiedHook] Set session ID called');
      // No implementation in simplified version
    },
    stats: { received: 0, processed: 0, filtered: 0 }
  };
} 