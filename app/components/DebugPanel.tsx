'use client';

import React, { useState, useEffect } from 'react';
import type { ResearchProgress } from '@/src/lib/types';

/**
 * DebugPanel - Displays raw event data from all possible sources
 * This component is purely for debugging purposes
 */
export const DebugPanel: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [bridgeEvents, setBridgeEvents] = useState<any[]>([]);
  const [domEvents, setDomEvents] = useState<any[]>([]);
  const [localStorageEvents, setLocalStorageEvents] = useState<any[]>([]);
  const [windowEvents, setWindowEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    lastEventTime: 0,
    sources: { bridge: 0, dom: 0, localStorage: 0, window: 0 }
  });

  // Poll for events from ALL sources with minimal filtering
  useEffect(() => {
    console.log('[DebugPanel] Setting up event monitoring');
    
    const checkForEvents = () => {
      // Check 1: Window global object
      if (typeof window !== 'undefined') {
        try {
          if (window.__RESEARCH_EVENTS?.length) {
            const windowEventsData = [...window.__RESEARCH_EVENTS];
            setWindowEvents(windowEventsData);
            
            // Add to combined events
            if (windowEventsData.length > 0) {
              console.log(`[DebugPanel] Found ${windowEventsData.length} window events`);
              setStats(prev => ({
                ...prev, 
                totalEvents: prev.totalEvents + windowEventsData.length,
                sources: {...prev.sources, window: windowEventsData.length},
                lastEventTime: Date.now()
              }));
              setEvents(prev => [...prev, ...windowEventsData.map(e => ({...e, source: 'window'}))]);
            }
          }
          
          // Check if bridge has events (if available)
          if (window.ResearchBridge?.getEvents) {
            const bridgeEventsData = window.ResearchBridge.getEvents();
            if (bridgeEventsData?.length) {
              setBridgeEvents(bridgeEventsData);
              
              // Add to combined events
              console.log(`[DebugPanel] Found ${bridgeEventsData.length} bridge events`);
              setStats(prev => ({
                ...prev, 
                totalEvents: prev.totalEvents + bridgeEventsData.length,
                sources: {...prev.sources, bridge: bridgeEventsData.length},
                lastEventTime: Date.now()
              }));
              setEvents(prev => [...prev, ...bridgeEventsData.map(e => ({...e, source: 'bridge'}))]);
            }
          }
        } catch (e) {
          console.error('[DebugPanel] Error processing window events:', e);
        }
      }
      
      // Check 2: localStorage
      try {
        const storedEventsStr = localStorage.getItem('researchEvents');
        if (storedEventsStr) {
          const storedEvents = JSON.parse(storedEventsStr);
          if (Array.isArray(storedEvents) && storedEvents.length > 0) {
            setLocalStorageEvents(storedEvents);
            
            // Add to combined events
            console.log(`[DebugPanel] Found ${storedEvents.length} localStorage events`);
            setStats(prev => ({
              ...prev, 
              totalEvents: prev.totalEvents + storedEvents.length,
              sources: {...prev.sources, localStorage: storedEvents.length},
              lastEventTime: Date.now()
            }));
            setEvents(prev => [...prev, ...storedEvents.map(e => ({...e, source: 'localStorage'}))]);
          }
        }
      } catch (e) {
        console.error('[DebugPanel] Error reading from localStorage:', e);
      }
      
      // Check 3: DOM elements
      try {
        const eventsElement = document.getElementById('research-events-element');
        if (eventsElement) {
          const eventsStr = eventsElement.getAttribute('data-events');
          const latestEventStr = eventsElement.getAttribute('data-latest-event');
          
          if (eventsStr) {
            try {
              const domEvents = JSON.parse(eventsStr);
              if (Array.isArray(domEvents) && domEvents.length > 0) {
                setDomEvents(domEvents);
                
                // Add to combined events
                console.log(`[DebugPanel] Found ${domEvents.length} DOM events`);
                setStats(prev => ({
                  ...prev, 
                  totalEvents: prev.totalEvents + domEvents.length,
                  sources: {...prev.sources, dom: domEvents.length},
                  lastEventTime: Date.now()
                }));
                setEvents(prev => [...prev, ...domEvents.map(e => ({...e, source: 'dom'}))]);
              }
            } catch (e) {
              console.error('[DebugPanel] Error parsing DOM events:', e);
            }
          }
        }
      } catch (e) {
        console.error('[DebugPanel] Error checking DOM for events:', e);
      }
    };
    
    // Check immediately
    checkForEvents();
    
    // Set up polling interval (check every 500ms to avoid overwhelming the UI)
    const interval = setInterval(checkForEvents, 500);
    
    // Listen for direct DOM events
    const handleDirectEvent = (e: any) => {
      try {
        if (e.detail) {
          console.log('[DebugPanel] Received direct event:', e.detail);
          
          // Add to DOM events
          setDomEvents(prev => [...prev, e.detail]);
          
          // Add to combined events
          setEvents(prev => [...prev, {...e.detail, source: 'direct'}]);
          
          setStats(prev => ({
            ...prev, 
            totalEvents: prev.totalEvents + 1,
            sources: {...prev.sources, dom: prev.sources.dom + 1},
            lastEventTime: Date.now()
          }));
        }
      } catch (error) {
        console.error('[DebugPanel] Error handling direct event:', error);
      }
    };
    
    // Add event listeners for all possible event names
    window.addEventListener('research-progress', handleDirectEvent as EventListener);
    document.addEventListener('research-progress', handleDirectEvent as EventListener);
    window.addEventListener('research-event', handleDirectEvent as EventListener);
    document.addEventListener('research-event', handleDirectEvent as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('research-progress', handleDirectEvent as EventListener);
      document.removeEventListener('research-progress', handleDirectEvent as EventListener);
      window.removeEventListener('research-event', handleDirectEvent as EventListener);
      document.removeEventListener('research-event', handleDirectEvent as EventListener);
    };
  }, []);

  // Function to directly force a test event
  const injectTestEvent = () => {
    const testEvent = {
      id: 'test-' + Date.now(),
      status: 'testing',
      message: 'This is a test event',
      timestamp: Date.now(),
      completed: 50
    };
    
    console.log('[DebugPanel] Injecting test event:', testEvent);
    
    // Try all available injection methods
    
    // 1. Use window.__RESEARCH_EVENTS
    if (typeof window !== 'undefined') {
      if (!window.__RESEARCH_EVENTS) window.__RESEARCH_EVENTS = [];
      window.__RESEARCH_EVENTS.push(testEvent);
    }
    
    // 2. Use window.__addResearchEvent if available
    if (typeof window !== 'undefined' && window.__addResearchEvent) {
      window.__addResearchEvent(testEvent);
    }
    
    // 3. Use ResearchBridge if available
    if (typeof window !== 'undefined' && window.ResearchBridge?.addEvent) {
      window.ResearchBridge.addEvent(testEvent);
    }
    
    // 4. Use localStorage
    try {
      const existingEvents = localStorage.getItem('researchEvents');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(testEvent);
      localStorage.setItem('researchEvents', JSON.stringify(events));
    } catch (e) {
      console.error('[DebugPanel] Error saving to localStorage:', e);
    }
    
    // 5. Dispatch DOM event
    try {
      const event = new CustomEvent('research-progress', { detail: testEvent });
      window.dispatchEvent(event);
      document.dispatchEvent(event);
    } catch (e) {
      console.error('[DebugPanel] Error dispatching event:', e);
    }
    
    // Add to our own state for immediate feedback
    setEvents(prev => [...prev, {...testEvent, source: 'injected'}]);
  };
  
  // Clear events from all sources
  const clearEvents = () => {
    // Clear window.__RESEARCH_EVENTS
    if (typeof window !== 'undefined') {
      window.__RESEARCH_EVENTS = [];
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem('researchEvents');
    } catch (e) {
      console.error('[DebugPanel] Error clearing localStorage:', e);
    }
    
    // Clear states
    setEvents([]);
    setBridgeEvents([]);
    setDomEvents([]);
    setLocalStorageEvents([]);
    setWindowEvents([]);
    setStats({
      totalEvents: 0,
      lastEventTime: 0,
      sources: { bridge: 0, dom: 0, localStorage: 0, window: 0 }
    });
    
    console.log('[DebugPanel] All events cleared');
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 my-4 shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-blue-400">Debug Panel</h2>
        <div className="flex gap-2">
          <button 
            onClick={injectTestEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Inject Test Event
          </button>
          <button 
            onClick={clearEvents}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Clear Events
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 p-3 rounded border border-gray-800">
          <h3 className="text-sm font-medium mb-2 text-gray-400">Event Sources</h3>
          <div className="flex flex-wrap gap-2">
            <div className="bg-gray-800 px-2 py-1 rounded text-xs">
              Window: {stats.sources.window}
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded text-xs">
              Bridge: {stats.sources.bridge}
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded text-xs">
              LocalStorage: {stats.sources.localStorage}
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded text-xs">
              DOM: {stats.sources.dom}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded border border-gray-800">
          <h3 className="text-sm font-medium mb-2 text-gray-400">Stats</h3>
          <div className="flex flex-wrap gap-2">
            <div className="bg-gray-800 px-2 py-1 rounded text-xs">
              Total Events: {stats.totalEvents}
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded text-xs">
              Last Event: {stats.lastEventTime ? new Date(stats.lastEventTime).toLocaleTimeString() : 'None'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-60 bg-gray-900 p-2 rounded border border-gray-800">
        <h3 className="text-sm font-medium mb-2 sticky top-0 bg-gray-900 p-1 z-10 text-gray-400">
          Raw Events ({events.length})
        </h3>
        {events.length === 0 ? (
          <div className="text-gray-500 text-xs italic p-2">No events captured</div>
        ) : (
          <div className="space-y-2">
            {events.slice().reverse().map((event, index) => (
              <div key={index} className="text-xs bg-gray-800 p-2 rounded">
                <div className="flex justify-between text-gray-400 mb-1">
                  <span>
                    Source: <span className={`font-mono ${event.source === 'bridge' ? 'text-green-400' : event.source === 'window' ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {event.source || 'unknown'}
                    </span>
                  </span>
                  <span>{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Unknown time'}</span>
                </div>
                <div className="flex gap-2">
                  <span className={
                    event.status === 'error' ? 'text-red-400' :
                    event.status === 'completed' ? 'text-green-400' :
                    'text-blue-400'
                  }>
                    {event.status || 'unknown'}
                  </span>
                  <span className="text-gray-300">{event.message || 'No message'}</span>
                </div>
                {event.completed !== undefined && (
                  <div className="mt-1">
                    <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-500"
                        style={{ width: `${event.completed}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-gray-500 text-[10px] mt-0.5">{event.completed}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-2 italic">
        This panel collects all events from multiple sources for debugging purposes.
        Check browser console for more detailed logs.
      </div>
    </div>
  );
};

export default DebugPanel; 