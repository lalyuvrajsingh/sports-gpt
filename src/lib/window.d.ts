import type { ResearchProgress } from './types';

declare global {
  interface Window {
    injectResearchEvent?: (event: any) => void;
    __RESEARCH_EVENTS?: ResearchProgress[];
    __addResearchEvent?: (event: any) => void;
    __debugResearch?: boolean;
    ResearchBridge?: {
      addEvent: (event: any) => void;
      getEvents: () => any[];
    };
    __handleServerEvent?: (eventJson: string) => void;
    __processResearchProgressEvent?: (eventJson: string) => void;
    __pendingEvents?: string[];
    
    __CURRENT_RESEARCH_SESSION_ID?: string;
    __BRIDGE_STATS?: {
      eventsProcessed: number;
      eventsEmitted: number;
      lastEventTimestamp: number;
    };
    __RESEARCH_EVENT_STATS?: {
      total: number;
      bridge: number;
      window: number;
      lastUpdate: number;
    };
    __RESEARCH_BRIDGE?: any;
  }
}

export {}; 