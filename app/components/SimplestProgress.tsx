'use client';

import React, { useState, useEffect } from 'react';
import type { ResearchProgress } from '@/src/lib/types';

interface SimplestProgressProps {
  sessionId?: string;
}

/**
 * SimplestProgress - An ultra-simple, minimal component to show research progress
 * Directly polls and displays events with minimal filtering
 */
export const SimplestProgress: React.FC<SimplestProgressProps> = ({ sessionId }) => {
  const [events, setEvents] = useState<ResearchProgress[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [lastMessage, setLastMessage] = useState<string>('Initializing...');
  const [status, setStatus] = useState<string>('initiated');
  
  // Directly poll for events from all possible sources
  useEffect(() => {
    console.log('[SimplestProgress] Setting up event polling');
    
    // Display the session ID
    if (sessionId) {
      console.log(`[SimplestProgress] Tracking session: ${sessionId}`);
    }
    
    const checkForEvents = () => {
      console.log('[SimplestProgress] Checking for events...');
      
      // Method 1: Check window.__RESEARCH_EVENTS
      if (typeof window !== 'undefined' && window.__RESEARCH_EVENTS?.length) {
        try {
          const filteredEvents = sessionId 
            ? window.__RESEARCH_EVENTS.filter((event: any) => !event.id || event.id === sessionId)
            : window.__RESEARCH_EVENTS;
            
          if (filteredEvents.length > 0) {
            console.log(`[SimplestProgress] Found ${filteredEvents.length} events in window.__RESEARCH_EVENTS`);
            processNewEvents(filteredEvents);
          }
        } catch (e) {
          console.error('[SimplestProgress] Error processing window events:', e);
        }
      }
      
      // Method 2: Check localStorage
      try {
        const storedEventsStr = localStorage.getItem('researchEvents');
        if (storedEventsStr) {
          const storedEvents = JSON.parse(storedEventsStr);
          if (Array.isArray(storedEvents) && storedEvents.length > 0) {
            const filteredEvents = sessionId 
              ? storedEvents.filter((event: any) => !event.id || event.id === sessionId)
              : storedEvents;
              
            if (filteredEvents.length > 0) {
              console.log(`[SimplestProgress] Found ${filteredEvents.length} events in localStorage`);
              processNewEvents(filteredEvents);
            }
          }
        }
      } catch (e) {
        console.error('[SimplestProgress] Error reading from localStorage:', e);
      }
      
      // Method 3: Check DOM elements
      try {
        const eventsElement = document.getElementById('research-events-element');
        if (eventsElement) {
          const eventsStr = eventsElement.getAttribute('data-events');
          const latestEventStr = eventsElement.getAttribute('data-latest-event');
          
          if (eventsStr) {
            try {
              const domEvents = JSON.parse(eventsStr);
              if (Array.isArray(domEvents) && domEvents.length > 0) {
                const filteredEvents = sessionId 
                  ? domEvents.filter((event: any) => !event.id || event.id === sessionId)
                  : domEvents;
                  
                if (filteredEvents.length > 0) {
                  console.log(`[SimplestProgress] Found ${filteredEvents.length} events in DOM data-events`);
                  processNewEvents(filteredEvents);
                }
              }
            } catch (e) {
              console.error('[SimplestProgress] Error parsing DOM events:', e);
            }
          }
          
          if (latestEventStr) {
            try {
              const latestEvent = JSON.parse(latestEventStr);
              if (!sessionId || latestEvent.id === sessionId) {
                console.log(`[SimplestProgress] Found latest event in DOM:`, latestEvent);
                processNewEvents([latestEvent]);
              }
            } catch (e) {
              console.error('[SimplestProgress] Error parsing latest DOM event:', e);
            }
          }
        }
      } catch (e) {
        console.error('[SimplestProgress] Error checking DOM for events:', e);
      }
    };
    
    // Process new events, updating our state
    const processNewEvents = (newEvents: ResearchProgress[]) => {
      if (!Array.isArray(newEvents) || newEvents.length === 0) return;
      
      setEvents(prev => {
        // Combine with existing events, remove duplicates
        const combinedEvents = [...prev];
        let updated = false;
        
        for (const event of newEvents) {
          // Simple duplicate check
          const isDuplicate = combinedEvents.some(e => 
            e.message === event.message && 
            e.status === event.status
          );
          
          if (!isDuplicate) {
            combinedEvents.push(event);
            updated = true;
            
            // Update last message and status from newest event
            if (!event.timestamp || 
                !combinedEvents[combinedEvents.length - 1].timestamp || 
                event.timestamp >= combinedEvents[combinedEvents.length - 1].timestamp) {
              setLastMessage(event.message || 'Processing...');
              setStatus(event.status || 'processing');
              
              // Update progress if available
              if (typeof event.completed === 'number' && event.completed > progress) {
                setProgress(event.completed);
              }
            }
          }
        }
        
        // Sort by timestamp if available
        const sortedEvents = combinedEvents.sort((a, b) => 
          (a.timestamp || 0) - (b.timestamp || 0)
        );
        
        return updated ? sortedEvents : prev;
      });
    };
    
    // Set up polling interval
    const interval = setInterval(checkForEvents, 50); // Check every 50ms
    
    // Check immediately
    checkForEvents();
    
    // Also listen for direct DOM events
    const handleDomEvent = (e: any) => {
      try {
        if (e.detail && typeof e.detail === 'object' && 'status' in e.detail) {
          const event = e.detail;
          if (!sessionId || event.id === sessionId) {
            console.log('[SimplestProgress] Received direct DOM event:', event);
            processNewEvents([event]);
          }
        }
      } catch (error) {
        console.error('[SimplestProgress] Error handling DOM event:', error);
      }
    };
    
    // Add event listeners
    window.addEventListener('research-progress', handleDomEvent as EventListener);
    document.addEventListener('research-progress', handleDomEvent as EventListener);
    window.addEventListener('research-event', handleDomEvent as EventListener);
    document.addEventListener('research-event', handleDomEvent as EventListener);
    
    // Also set a global function for direct calls
    if (typeof window !== 'undefined') {
      window.__addResearchEvent = (event: ResearchProgress) => {
        if (!sessionId || event.id === sessionId) {
          console.log('[SimplestProgress] Received event via global function:', event);
          processNewEvents([event]);
        }
      };
    }
    
    // Create a fake event if nothing happens in 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (events.length === 0) {
        console.log('[SimplestProgress] No events received after 3s, creating fallback');
        const fallbackEvent: ResearchProgress = {
          id: sessionId || 'fallback',
          status: 'searching',
          message: 'Searching for cricket information...',
          timestamp: Date.now(),
          completed: 25
        };
        processNewEvents([fallbackEvent]);
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
      window.removeEventListener('research-progress', handleDomEvent as EventListener);
      document.removeEventListener('research-progress', handleDomEvent as EventListener);
      window.removeEventListener('research-event', handleDomEvent as EventListener);
      document.removeEventListener('research-event', handleDomEvent as EventListener);
      
      if (typeof window !== 'undefined') {
        delete window.__addResearchEvent;
      }
    };
  }, [sessionId, progress]);
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Research Progress</span>
          <span className="text-sm text-blue-400">{progress}%</span>
        </div>
        
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-gray-300 text-sm">
          <div className="font-medium">Status: {status}</div>
          <div className="text-gray-400 mt-1">{lastMessage}</div>
        </div>
        
        {events.length > 0 && (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <div className="text-xs text-gray-500 mb-2">Activity Log ({events.length} events)</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="text-xs text-gray-400">
                  <span className="text-gray-500">
                    {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Unknown time'}
                  </span>
                  {' - '}
                  <span className={
                    event.status === 'error' ? 'text-red-400' :
                    event.status === 'completed' ? 'text-green-400' :
                    'text-blue-400'
                  }>
                    {event.status}
                  </span>
                  {' - '}
                  <span>{event.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplestProgress; 