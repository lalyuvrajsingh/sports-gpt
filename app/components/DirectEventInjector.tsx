'use client';

import React, { useEffect, useState } from 'react';
import type { ResearchProgress } from '@/src/lib/types';

/**
 * DirectEventInjector - A utility component that directly injects events
 * into multiple channels to ensure progress components receive updates.
 * This is a last-resort solution for when events aren't propagating properly.
 */
export default function DirectEventInjector({ sessionId }: { sessionId?: string }) {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (initialized) return;
    
    // Create a hidden div to hold events
    console.log('[DirectEventInjector] Creating DOM element for events');
    
    // Create element if it doesn't exist
    let eventsElement = document.getElementById('research-events-element');
    if (!eventsElement) {
      eventsElement = document.createElement('div');
      eventsElement.id = 'research-events-element';
      eventsElement.style.display = 'none';
      document.body.appendChild(eventsElement);
    }
    
    // Set up global handler function
    console.log('[DirectEventInjector] Setting up global handlers');
    
    // Create a function to directly inject events into all channels
    const injectEvent = (event: any) => {
      try {
        // Ensure the event has an ID
        if (!event.id && sessionId) {
          event.id = sessionId;
        }
        
        // Ensure timestamp
        if (!event.timestamp) {
          event.timestamp = Date.now();
        }
        
        console.log('[DirectEventInjector] Injecting event:', event);
        
        // 1. Add to window.__RESEARCH_EVENTS
        if (typeof window !== 'undefined') {
          if (!window.__RESEARCH_EVENTS) window.__RESEARCH_EVENTS = [];
          window.__RESEARCH_EVENTS.push(event);
        }
        
        // 2. Store in DOM element
        if (eventsElement) {
          // Store the latest event
          eventsElement.setAttribute('data-latest-event', JSON.stringify(event));
          
          // Also maintain an array of events
          try {
            const existingEventsStr = eventsElement.getAttribute('data-events');
            const existingEvents = existingEventsStr ? JSON.parse(existingEventsStr) : [];
            existingEvents.push(event);
            eventsElement.setAttribute('data-events', JSON.stringify(existingEvents));
          } catch (e) {
            console.error('[DirectEventInjector] Error updating data-events:', e);
            // Fallback: just set it to an array with this event
            eventsElement.setAttribute('data-events', JSON.stringify([event]));
          }
        }
        
        // 3. Dispatch DOM events
        try {
          const domEvent = new CustomEvent('research-progress', { detail: event });
          document.dispatchEvent(domEvent);
          window.dispatchEvent(domEvent);
        } catch (e) {
          console.error('[DirectEventInjector] Error dispatching event:', e);
        }
        
        // 4. Add to localStorage
        try {
          const storedEventsStr = localStorage.getItem('researchEvents');
          const storedEvents = storedEventsStr ? JSON.parse(storedEventsStr) : [];
          storedEvents.push(event);
          localStorage.setItem('researchEvents', JSON.stringify(storedEvents));
        } catch (e) {
          console.error('[DirectEventInjector] Error storing in localStorage:', e);
        }
        
        // 5. Use window.__addResearchEvent if available
        if (typeof window !== 'undefined' && window.__addResearchEvent) {
          window.__addResearchEvent(event);
        }
        
        // 6. Use ResearchBridge if available
        if (typeof window !== 'undefined' && window.ResearchBridge?.addEvent) {
          window.ResearchBridge.addEvent(event);
        }
      } catch (e) {
        console.error('[DirectEventInjector] Error injecting event:', e);
      }
    };
    
    // Store the inject function globally
    if (typeof window !== 'undefined') {
      window.injectResearchEvent = injectEvent;
    }
    
    // Start proxy observer for server events
    const checkForNewServerEvents = () => {
      // Look for new events in the server response logs
      const logs = document.querySelectorAll('.cursor-log-line');
      
      logs.forEach(log => {
        try {
          const text = log.textContent || '';
          
          // Look for lines with [PROGRESS_EMIT] or [PROGRESS_EVENT]
          if (text.includes('[PROGRESS_EMIT]') || text.includes('[PROGRESS_EVENT]') || text.includes('[SERVER_EVENT]')) {
            // Try to extract the JSON portion
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');
            
            if (startIndex >= 0 && endIndex > startIndex) {
              const jsonStr = text.substring(startIndex, endIndex + 1);
              
              try {
                const event = JSON.parse(jsonStr);
                console.log('[DirectEventInjector] Found event in logs:', event);
                
                // Only inject if this is a new event (based on message + status)
                const existingEvents = window.__RESEARCH_EVENTS || [];
                const isDuplicate = existingEvents.some((e: any) => 
                  e.message === event.message && e.status === event.status
                );
                
                if (!isDuplicate) {
                  injectEvent(event);
                }
              } catch (e) {
                // Silently ignore parse errors, as log might not contain valid JSON
              }
            }
          }
        } catch (e) {
          // Silently ignore errors from individual log elements
        }
      });
    };
    
    // Check for server events every second
    const serverCheckInterval = setInterval(checkForNewServerEvents, 1000);
    
    // Create a direct test event after 1 second to confirm the system works
    setTimeout(() => {
      const testEvent = {
        id: sessionId || 'test-direct',
        status: 'initiated',
        message: 'Direct event injection test',
        timestamp: Date.now(),
        completed: 10
      };
      
      injectEvent(testEvent);
    }, 1000);
    
    // Set up a polling interval to inject "heartbeat" events if nothing happens
    let lastEventTime = Date.now();
    let progress = 10;
    
    const heartbeatInterval = setInterval(() => {
      // If no events in 5 seconds, inject a heartbeat
      const now = Date.now();
      if (now - lastEventTime > 5000) {
        console.log('[DirectEventInjector] No events in 5s, injecting heartbeat');
        
        // Increment progress for each heartbeat, but max out at 95%
        progress = Math.min(95, progress + 5);
        
        const heartbeatEvent = {
          id: sessionId || 'heartbeat',
          status: 'searching',
          message: `Research in progress (heartbeat ${progress}%)...`,
          timestamp: now,
          completed: progress,
          isHeartbeat: true
        };
        
        injectEvent(heartbeatEvent);
        lastEventTime = now;
      }
    }, 5000);
    
    // Update the initialized state
    setInitialized(true);
    
    return () => {
      // Clean up intervals
      clearInterval(serverCheckInterval);
      clearInterval(heartbeatInterval);
      
      // Remove global function
      if (typeof window !== 'undefined') {
        delete window.injectResearchEvent;
      }
    };
  }, [initialized, sessionId]);
  
  // This component doesn't render anything visible
  return null;
} 