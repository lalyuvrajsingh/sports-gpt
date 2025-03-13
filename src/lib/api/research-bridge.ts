'use client';

import { v4 as uuidv4 } from 'uuid';
import type { ResearchProgress } from '@/src/lib/types';

/**
 * Simplified ResearchBridge
 * This is a placeholder version that maintains the API but doesn't implement 
 * the complex event system
 */
export class ResearchBridge {
  private sessionId: string | null = null;
  private events: Record<string, any[]> = {};
  
  constructor() {
    console.log('Initialized simplified ResearchBridge');
  }
  
  /**
   * Set the current research session ID
   */
  setSessionId(id: string): void {
    this.sessionId = id;
    console.log(`[SimpleBridge] Session ID set: ${id}`);
  }
  
  /**
   * Get the current research session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }
  
  /**
   * Add a new research progress event (placeholder)
   */
  addEvent(event: ResearchProgress): void {
    // Ensure the event has an ID
    if (!event.id && this.sessionId) {
      event.id = this.sessionId;
    }
    
    if (!event.id) {
      event.id = uuidv4();
    }
    
    // Add to our internal events list
    this.events[event.id] = this.events[event.id] || [];
    this.events[event.id].push(event);
    
    console.log(`[SimpleBridge] Event added: ${event.message}`);
  }
  
  /**
   * Add an event listener (placeholder)
   */
  addEventListener(event: string, listener: (...args: any[]) => void): void {
    console.log(`[SimpleBridge] Event listener added for ${event}`);
    // This is a no-op in the simplified version
  }
  
  /**
   * Remove an event listener (placeholder)
   */
  removeEventListener(event: string, listener: (...args: any[]) => void): void {
    console.log(`[SimpleBridge] Event listener removed for ${event}`);
    // This is a no-op in the simplified version
  }
  
  /**
   * Get all events for the current session
   */
  getEvents(sessionId?: string): any[] {
    const targetSessionId = sessionId || this.sessionId;
    return targetSessionId ? (this.events[targetSessionId] || []) : [];
  }
}

// Create a singleton instance
export const researchBridge = new ResearchBridge(); 